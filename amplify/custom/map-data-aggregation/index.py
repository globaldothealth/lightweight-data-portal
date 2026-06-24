import json
import tempfile
import boto3
import country_converter as coco
import geopandas as gpd
import pandas as pd
import os
from datetime import datetime, timezone
from botocore.exceptions import ClientError
from match_admin0_entries_to_geoBoundary_features import match_admin0_entries_to_geoBoundary_features
from match_admin1_entries_to_geoBoundary_features import match_admin1_entries_to_geoBoundary_features
from prepare_geometry import prepare_geometry


s3 = boto3.client("s3")

def parse_admin0_data_geoBoundaries(s3, bucket, data_url, parsed_data_key, missing_data_key):
    df = pd.read_csv(data_url)
    # Get case counts by country for confirmed cases and most recent Date_confirmation
    country_counts = df[df['Case_status'] == 'confirmed'].groupby('Location_Admin0').agg(
        {'Date_confirmation': 'max', 'Case_status': 'size'}).reset_index()
    data = country_counts.rename(columns={'Location_Admin0': 'countryCode', 'Date_confirmation': 'lastUpdated',
                                          'Case_status': 'caseCount'}).to_dict('records')

    # Map code from name to iso3 for all entries in data
    data = [{**entry, 'countryCode': coco.convert(entry['countryCode'], to='ISO3')} for entry in data]

    parsed_data = []
    matched_entries, missing_data = match_admin0_entries_to_geoBoundary_features(data, s3, bucket)
    for entry, feature in matched_entries:
        try:
            properties = feature["properties"]
            geometry, centroid, bounds = prepare_geometry(feature['geometry'], properties["shapeGroup"])
            parsed_data.append({
                "lat": centroid.y,
                "long": centroid.x,
                "name": properties["shapeName"],
                "bounds": bounds,
                "case_count": entry['caseCount'],
                "last_updated": entry['lastUpdated'],
                "country_code": entry['countryCode'],
                "geometry": geometry,
                "id": properties["shapeGroup"],
            })
        except Exception as e:
            print(f"Error processing {entry['countryCode']}: {e}")

        # export_parsing_results_to_json(outbreak, admin_resolution, parsed_data, missing_data)
        # Save parsed_data to S3
    s3.put_object(
        Bucket=bucket,
        Key=parsed_data_key,
        Body=json.dumps(parsed_data, indent=2),
        ContentType="application/json",
    )

    # Save missing_data to S3
    s3.put_object(
        Bucket=bucket,
        Key=missing_data_key,
        Body=json.dumps(missing_data, indent=2),
        ContentType="application/json",
    )


def parse_admin1_data_geoBoundaries(s3, bucket, data_url, parsed_data_key, missing_data_key):
    df = pd.read_csv(data_url)
    # Get case counts by Location_District for confirmed cases, with Country and most recent Date_confirmation
    country_counts = df[df['Case_status'] == 'confirmed'].groupby(['Location_Admin0', 'Location Admin1']).agg(
        {'Date_confirmation': 'max', 'Case_status': 'size'}).reset_index()
    # country_counts = df[df['Case_status'] == 'Confirmed'].groupby('Country').size().reset_index(name='casecount')
    data = country_counts.rename(
        columns={'Location_Admin0': 'countryCode', 'Date_confirmation': 'lastUpdated', 'Case_status': 'caseCount',
                 "Location Admin1": 'name'}).to_dict('records')

    # Map code from name to iso3 for all entries in data
    data = [{**entry, 'countryCode': coco.convert(entry['countryCode'], to='ISO3')} for entry in data]

    try:
        response = s3.get_object(Bucket=bucket, Key='name-matching/Ebola BVD/admin1/name_matching.json')
        name_matching = json.loads(response["Body"].read().decode("utf-8"))
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchKey":
            data = {}
        else:
            raise

    parsed_data = []
    matched_entries, missing_data = match_admin1_entries_to_geoBoundary_features(data, s3, bucket, name_matching)
    for entry, feature in matched_entries:
        try:
            geometry, centroid, bounds = prepare_geometry(feature["geometry"])
            properties = feature["properties"]
            parsed_data.append({
                "lat": centroid.y,
                "long": centroid.x,
                "name": properties["shapeName"],
                "bounds": bounds,
                "case_count": entry['caseCount'],
                "last_updated": entry['lastUpdated'],
                "country_code": entry['countryCode'],
                "geometry": geometry,
                "id": properties["shapeID"],
            })
        except Exception as e:
            print(f"Error processing {entry['countryCode']}: {e}")

    # Save parsed_data to S3
    s3.put_object(
        Bucket=bucket,
        Key=parsed_data_key,
        Body=json.dumps(parsed_data, indent=2),
        ContentType="application/json",
    )

    # Save missing_data to S3
    s3.put_object(
        Bucket=bucket,
        Key=missing_data_key,
        Body=json.dumps(missing_data, indent=2),
        ContentType="application/json",
    )

def parse_admin2_data_geoBoundaries(s3, bucket, data_url, parsed_data_key, missing_data_key):
    # A shapefile is multiple files (.shp, .shx, .dbf, .prj, .cpg).
    # Download all components into a temp directory and read from disk.
    shp_base_key = 'parsing/other/DRC_Health_zones/DRC_Health_zones'
    shp_extensions = ['.shp', '.shx', '.dbf', '.prj', '.cpg', '.qmd']
    geo_data = gpd.GeoDataFrame()
    with tempfile.TemporaryDirectory() as tmpdir:
        downloaded_shp = False
        for ext in shp_extensions:
            try:
                response = s3.get_object(Bucket=bucket, Key=f'{shp_base_key}{ext}')
                with open(os.path.join(tmpdir, f'DRC_Health_zones{ext}'), 'wb') as f:
                    f.write(response["Body"].read())
                if ext == '.shp':
                    downloaded_shp = True
            except ClientError as e:
                if e.response["Error"]["Code"] != "NoSuchKey":
                    raise
        if downloaded_shp:
            geo_data = gpd.read_file(os.path.join(tmpdir, 'DRC_Health_zones.shp'))
    df = pd.read_csv(data_url)
    country_counts = df[df['Case_status'] == 'confirmed'].groupby(['Location_Admin0','Location Admin1', 'Health zone']).agg(
        {'Date_confirmation': 'max', 'Case_status': 'size'}).reset_index()
    # country_counts = df[df['Case_status'] == 'Confirmed'].groupby('Country').size().reset_index(name='casecount')
    data = country_counts.rename(
        columns={'Health zone': 'name', 'Date_confirmation': 'lastUpdated', 'Case_status': 'caseCount', 'Location_Admin0': 'countryCode'}).to_dict(
        'records')
    data = [{**entry, 'countryCode': coco.convert(entry['countryCode'], to='ISO3')} for entry in data]
    # find in data distinct Location Admin1 data that has no entry with name "Other"
    zero_other = list(set([entry['Location Admin1'] for entry in data]) - set([entry['Location Admin1'] for entry in data if entry['name'] == 'Other']))
    for zero_entry in zero_other:
        data.append({'Location Admin1': zero_entry, 'caseCount': 0, 'countryCode': 'COD', 'lastUpdated': '2026-06-01', 'name': 'Other'})
    names = geo_data['Nom'].tolist()
    parsed_data = []
    missing_data = {}
    try:
        response = s3.get_object(Bucket=bucket, Key='name-matching/Ebola BVD/admin2/name_matching.json')
        name_matching = json.loads(response["Body"].read().decode("utf-8"))
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchKey":
            data = {}
        else:
            raise
    try:
        response = s3.get_object(Bucket=bucket, Key='name-matching/Ebola BVD/admin1/name_matching.json')
        name_matching_adm1 = json.loads(response["Body"].read().decode("utf-8"))
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchKey":
            data = {}
        else:
            raise
    try:
        response = s3.get_object(Bucket=bucket, Key='parsing/admin1/geoBoundariesCGAZ_ADM1_simplified.geojson')
        geo_data2 = json.loads(response["Body"].read().decode("utf-8"))
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchKey":
            data = {}
        else:
            raise
    geo_data2 = geo_data2['features']
    for data_entry in data:
        entry_name = data_entry['name']
        if entry_name == 'Other':
            location_admin1 = data_entry['Location Admin1']
            if data_entry['countryCode'] in name_matching_adm1 and data_entry['Location Admin1'] in name_matching_adm1[data_entry['countryCode']]:
                location_admin1 = name_matching_adm1[data_entry['countryCode']][location_admin1]
            matching_feature = next((feature for feature in geo_data2 if feature['properties']['shapeGroup'] == data_entry['countryCode'] and feature['properties']['shapeName'] == location_admin1), None)
            geometry, centroid, bounds = prepare_geometry(matching_feature["geometry"])
            parsed_data.append({
                "lat": centroid.y,
                "long": centroid.x,
                "name": f"Other ({location_admin1} Province)",
                "bounds": bounds,
                "case_count": data_entry['caseCount'],
                "last_updated": data_entry['lastUpdated'],
                "country_code": 'COD',
                "geometry": geometry,
                "id": f"{data_entry['name']}{location_admin1}",
            })
        else:
            if data_entry['countryCode'] in name_matching and entry_name in name_matching[data_entry['countryCode']]:
                entry_name = name_matching[data_entry['countryCode']][entry_name]
            matching_feature = geo_data[geo_data['Nom'] == entry_name]
            if len(matching_feature) > 0:
                feature = matching_feature.iloc[0]
                try:
                    geometry, centroid, bounds = prepare_geometry(feature["geometry"])
                    parsed_data.append({
                        "lat": centroid.y,
                        "long": centroid.x,
                        "name": entry_name,
                        "bounds": bounds,
                        "case_count": data_entry['caseCount'],
                        "last_updated": data_entry['lastUpdated'],
                        "country_code": 'COD',
                        "geometry": geometry,
                        "id": data_entry['name'],
                    })
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

    # Save parsed_data to S3
    s3.put_object(
        Bucket=bucket,
        Key=parsed_data_key,
        Body=json.dumps(parsed_data, indent=2),
        ContentType="application/json",
    )

    # Save missing_data to S3
    s3.put_object(
        Bucket=bucket,
        Key=missing_data_key,
        Body=json.dumps(missing_data, indent=2),
        ContentType="application/json",
    )

def handler(event, context):
    bucket = os.environ["BUCKET_NAME"]
    data_url = os.environ["DATA_URL"]
    parse_admin0_data_geoBoundaries(s3, bucket, data_url, 'outbreaks/Ebola BVD/admin0/simplified.json', 'missing-data/Ebola BVD/admin0/missing_data.json')
    parse_admin1_data_geoBoundaries(s3, bucket, data_url, 'outbreaks/Ebola BVD/admin1/simplified.json', 'missing-data/Ebola BVD/admin1/missing_data.json')
    parse_admin2_data_geoBoundaries(s3, bucket, data_url, 'outbreaks/Ebola BVD/admin2/simplified.json', 'missing-data/Ebola BVD/admin2/missing_data.json')

    return {"statusCode": 200, "body": json.dumps({"message": "Data parsed and saved successfully"})}

