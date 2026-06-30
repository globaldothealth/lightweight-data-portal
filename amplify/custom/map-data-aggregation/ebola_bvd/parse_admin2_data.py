import country_converter as coco
import pandas as pd

from prepare_geometry import prepare_geometry
from parsing_utils import load_json, save_json, build_feature, read_shapefile


def ebola_bvd_parse_admin2_data(s3, bucket, data_url, outbreak_name, parsed_data_key, missing_data_key):
    # A shapefile is multiple files (.shp, .shx, .dbf, .prj, .cpg); download them all and read from disk.
    geo_data = read_shapefile(s3, bucket, 'parsing/other/DRC_Health_zones/DRC_Health_zones')
    if geo_data.empty or 'Nom' not in geo_data.columns:
        raise ValueError(
            'DRC health zones shapefile not found or missing "Nom" column at parsing/other/DRC_Health_zones/DRC_Health_zones'
        )
    df = pd.read_csv(data_url)
    country_counts = df[df['Case_status'] == 'confirmed'].groupby(
        ['Location_Admin0', 'Location Admin1', 'Health zone']).agg(
        {'Date_confirmation': 'max', 'Case_status': 'size'}).reset_index()
    data = country_counts.rename(
        columns={'Health zone': 'name', 'Date_confirmation': 'lastUpdated', 'Case_status': 'caseCount',
                 'Location_Admin0': 'countryCode'}).to_dict('records')
    data = [{**entry, 'countryCode': coco.convert(entry['countryCode'], to='ISO3')} for entry in data]

    # Ensure every Location Admin1 has an "Other" bucket
    zero_other = list(set(entry['Location Admin1'] for entry in data)
                      - set(entry['Location Admin1'] for entry in data if entry['name'] == 'Other'))
    for zero_entry in zero_other:
        data.append({'Location Admin1': zero_entry, 'caseCount': 0, 'countryCode': 'COD',
                     'lastUpdated': '2026-06-01', 'name': 'Other'})

    names = geo_data['Nom'].tolist()
    parsed_data = []
    missing_data = {}

    name_matching = load_json(s3, bucket, f'name-matching/{outbreak_name}/admin2/name_matching.json', default={})
    name_matching_adm1 = load_json(s3, bucket, f'name-matching/{outbreak_name}/admin1/name_matching.json', default={})
    geo_data2 = load_json(s3, bucket, 'parsing/admin1/geoBoundariesCGAZ_ADM1_simplified.geojson',
                          default={'features': []})['features']

    for data_entry in data:
        entry_name = data_entry['name']
        if entry_name == 'Other':
            location_admin1 = data_entry['Location Admin1']
            if data_entry['countryCode'] in name_matching_adm1 and data_entry['Location Admin1'] in name_matching_adm1[data_entry['countryCode']]:
                location_admin1 = name_matching_adm1[data_entry['countryCode']][location_admin1]
            matching_feature = next((feature for feature in geo_data2 if feature['properties']['shapeGroup'] == data_entry['countryCode'] and feature['properties']['shapeName'] == location_admin1), None)
            if not matching_feature:
                print(f'No admin1 geometry found for "Other" bucket: {location_admin1} ({data_entry["countryCode"]})')
                continue
            geometry, centroid, bounds = prepare_geometry(matching_feature["geometry"])
            parsed_data.append(build_feature(
                geometry, centroid, bounds,
                name=f"Other ({location_admin1} Province)",
                case_count=data_entry['caseCount'],
                last_updated=data_entry['lastUpdated'],
                country_code='COD',
                feature_id=f"{data_entry['name']}{location_admin1}",
            ))
        else:
            if data_entry['countryCode'] in name_matching and entry_name in name_matching[data_entry['countryCode']]:
                entry_name = name_matching[data_entry['countryCode']][entry_name]
            matching_feature = geo_data[geo_data['Nom'] == entry_name]
            if len(matching_feature) > 0:
                feature = matching_feature.iloc[0]
                try:
                    geometry, centroid, bounds = prepare_geometry(feature["geometry"])
                    parsed_data.append(build_feature(
                        geometry, centroid, bounds,
                        name=entry_name,
                        case_count=data_entry['caseCount'],
                        last_updated=data_entry['lastUpdated'],
                        country_code='COD',
                        feature_id=data_entry['name'],
                    ))
                except Exception as e:
                    print(f"Error processing {entry_name}: {e}")
            else:
                if data_entry['countryCode'] not in missing_data:
                    missing_data[data_entry['countryCode']] = {
                        "entries": [entry_name],
                        "possible_matches": names
                    }
                else:
                    missing_data[data_entry['countryCode']]['entries'].append(entry_name)

    save_json(s3, bucket, parsed_data_key, parsed_data)
    save_json(s3, bucket, missing_data_key, missing_data)

