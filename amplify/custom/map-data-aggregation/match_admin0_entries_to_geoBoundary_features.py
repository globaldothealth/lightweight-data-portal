import json
from botocore.exceptions import ClientError

def match_admin0_entries_to_geoBoundary_features(entries, s3, bucket, name_matching=None):
    try:
        response = s3.get_object(Bucket=bucket, Key='parsing/admin0/geoBoundariesCGAZ_ADM0_simplified.geojson')
        geo_data = json.loads(response["Body"].read().decode("utf-8"))
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchKey":
            geo_data = {"features": []}
        else:
            raise

    geo_data = geo_data['features']
    # Remove CHN from geoBoundaries and source from Natural Earth instead
    geo_data = [feature for feature in geo_data if feature['properties']['shapeGroup'] not in ["CHN", "HKG"]]

    # additional_countries = ["SHN", "REU", "VIR", "GIB", "NCL", "MTQ", "GUM", "GLP", "CUW", "ABW", "BMU"]
    # for country in additional_countries:
    #     with open(f"geoBoundaries/admin0/geoBoundaries-{country}-ADM0.geojson", "r", encoding="utf-8") as f:
    #         country_geo_data = json.load(f)
    #     country_geo_data = country_geo_data['features'][0]
    #     geo_data.append(country_geo_data)
    #
    # # Countries sourced from Natural Earth (https://www.naturalearthdata.com)
    # natural_earth_countries = ["HKG", "CHN", "MAF", "PRI"]
    # with open(f"geoBoundaries/admin0/ne_10m_admin_0_countries.geojson", "r", encoding="utf-8") as f:
    #     ne_data = json.load(f)
    # for country in natural_earth_countries:
    #     feature = next((f for f in ne_data['features'] if f['properties'].get('ADM0_A3') == country), None)
    #     if feature:
    #         props = feature['properties']
    #         feature['properties'] = {
    #             "shapeID": props.get("ADM0_A3", country),
    #             "shapeGroup": props.get("ADM0_A3", country),
    #             "shapeName": props.get("ADMIN", props.get("NAME", country))
    #         }
    #         geo_data.append(feature)
    #
    # # Add Other entries
    # geo_data.append({
    #     "type": "Feature",
    #     "properties": {
    #         "shapeID": "Other*",
    #         "shapeGroup": "Other*",
    #         "shapeName": "Other*"
    #     },
    #     "geometry": {
    #         "type": "Polygon",
    #         "coordinates": [[
    #             [ -24.358,-45.7174],
    #             [ -24.358,-45.8174],
    #             [ -24.458,-45.8174],
    #             [ -24.458,-45.7174]
    #             ]]}
    # })
    # geo_data.append({
    #     "type": "Feature",
    #     "properties": {
    #         "shapeID": "Other**",
    #         "shapeGroup": "Other**",
    #         "shapeName": "Other**"
    #     },
    #     "geometry": {
    #         "type": "Polygon",
    #         "coordinates": [[
    #             [-22.65, 12.8830],
    #             [-22.65, 12.9830],
    #             [-22.75, 12.9830],
    #             [-22.75, 12.8830]
    #         ]]}
    # })

    matched_entries = []
    missing_entries = {}

    for entry in entries:
        iso3 = entry['countryCode']
        matching_feature = next((feature for feature in geo_data if feature['properties']['shapeGroup'] == iso3), None)
        if matching_feature:
            matched_entries.append((entry, matching_feature))
        else:
            missing_entries[iso3] = entry
    return matched_entries, missing_entries