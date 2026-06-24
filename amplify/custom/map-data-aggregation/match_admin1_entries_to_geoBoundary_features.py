import json

def simplify_missing_entries(missing_entries):
    for iso3 in missing_entries:
        missing_entries[iso3]['missing'] =  list(map(lambda m: m['name'], missing_entries[iso3]['missing']))
        missing_entries[iso3]['potential_matches'] =  list(map(lambda m: m['name'], missing_entries[iso3]['potential_matches']))


    return missing_entries


def match_admin1_entries_to_geoBoundary_features(entries, s3, bucket, name_matching=None):
    try:
        response = s3.get_object(Bucket=bucket, Key='parsing/admin1/geoBoundariesCGAZ_ADM1_simplified.geojson')
        geo_data = json.loads(response["Body"].read().decode("utf-8"))
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchKey":
            data = {}
        else:
            raise
    geo_data = geo_data['features']
    for feature in geo_data:
        props = feature['properties']
        if 'shapeName' in props:
            try:
                props['shapeName'] = props['shapeName'].encode('latin-1').decode('utf-8')
            except (UnicodeEncodeError, UnicodeDecodeError):
                pass  # Already correct encoding, skip
    chl_data = list(filter(lambda x: x['properties']['shapeGroup'] == "CHL", geo_data))

    matched_entries = []
    missing_entries = {}

    country_features = {}

    if name_matching:
        for entry in entries:
            iso3 = entry['countryCode']
            if iso3 in name_matching:
                name = entry['name']
                if name in name_matching[iso3]:
                    entry['name'] = name_matching[iso3][name]
        # After applying name matching some regions may have the same name, so we need to group features by country code to find potential matches for missing entries
        new_entries = {}
        for entry in entries:
            iso3 = entry['countryCode']
            name = entry['name']
            if iso3 not in new_entries:
                new_entries[iso3] = {}
            if name not in new_entries[iso3]:
                new_entries[iso3][name] = entry
            else:
                new_entries[iso3][name]['caseCount'] += entry['caseCount']
        # Now we need to convert new_entries back to a list of entries
        entries = []
        for iso3 in new_entries:
            for name in new_entries[iso3]:
                entries.append(new_entries[iso3][name])


    for feature in geo_data:
        if feature['properties']['shapeID'] == "17685810B76974127550435": continue
        iso3 = feature['properties']['shapeGroup']
        name = feature['properties']['shapeName']
        matching_entry = next((entry for entry in entries if entry['countryCode'] == iso3 and entry['name'] == name), None)
        if matching_entry:
            matched_entries.append((matching_entry, feature))
        if iso3 == 'IRN' and matching_entry is not None:
            print(matching_entry['name'], feature['properties'])
        if iso3 not in country_features:
            country_features[iso3] = []
        country_features[iso3].append(feature)
    for entry in entries:
        iso3 = entry['countryCode']
        name = entry['name']
        matching_feature = next((feature for feature in geo_data if feature['properties']['shapeGroup'] == iso3 and feature['properties']['shapeName'] == name), None)
        if not matching_feature:
            if iso3 not in missing_entries:
                missing_entries[iso3] = {"missing": [], "potential_matches": list(map(lambda f: {'countryCode': f['properties']['shapeGroup'], 'name': f['properties']['shapeName']},country_features.get(iso3, [])))}
            missing_entries[iso3]["missing"].append(entry)
    missing_entries = simplify_missing_entries(missing_entries)
    return matched_entries, missing_entries