import country_converter as coco
import pandas as pd

from match_admin1_entries_to_geoBoundary_features import match_admin1_entries_to_geoBoundary_features
from prepare_geometry import prepare_geometry
from parsing_utils import load_json, save_json, build_feature


def ebola_bvd_parse_admin1_data(s3, bucket, data_url, outbreak_name, parsed_data_key, missing_data_key):
    df = pd.read_csv(data_url)
    # Get case counts by Location_District for confirmed cases, with Country and most recent Date_confirmation
    country_counts = df[df['Case_status'] == 'confirmed'].groupby(['Location_Admin0', 'Location Admin1']).agg(
        {'Date_confirmation': 'max', 'Case_status': 'size'}).reset_index()
    data = country_counts.rename(
        columns={'Location_Admin0': 'countryCode', 'Date_confirmation': 'lastUpdated', 'Case_status': 'caseCount',
                 "Location Admin1": 'name'}).to_dict('records')

    # Map code from name to iso3 for all entries in data
    data = [{**entry, 'countryCode': coco.convert(entry['countryCode'], to='ISO3')} for entry in data]

    name_matching = load_json(
        s3, bucket, f'name-matching/{outbreak_name}/admin1/name_matching.json', default={})

    parsed_data = []
    matched_entries, missing_data = match_admin1_entries_to_geoBoundary_features(data, s3, bucket, name_matching)
    for entry, feature in matched_entries:
        try:
            geometry, centroid, bounds = prepare_geometry(feature["geometry"])
            properties = feature["properties"]
            parsed_data.append(build_feature(
                geometry, centroid, bounds,
                name=properties["shapeName"],
                case_count=entry['caseCount'],
                last_updated=entry['lastUpdated'],
                country_code=entry['countryCode'],
                feature_id=properties["shapeID"],
            ))
        except Exception as e:
            print(f"Error processing {entry['countryCode']}: {e}")

    save_json(s3, bucket, parsed_data_key, parsed_data)
    save_json(s3, bucket, missing_data_key, missing_data)
