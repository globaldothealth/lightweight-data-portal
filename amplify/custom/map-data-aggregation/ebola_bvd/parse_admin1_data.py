import csv
from urllib.request import urlopen

from iso3 import to_iso3
from parsing_utils import load_json, save_json


def ebola_bvd_parse_admin1_data(s3, bucket, data_url, outbreak_name, parsed_data_key, missing_data_key):
    aggregates = {}
    with urlopen(data_url) as response:
        rows = csv.DictReader((line.decode('utf-8') for line in response))
        for row in rows:
            if row.get('Case_status') != 'confirmed':
                continue
            country_name = row.get('Location_Admin0')
            admin1_name = row.get('Location Admin1')
            if not country_name or not admin1_name:
                continue
            key = (country_name, admin1_name)
            last_updated = row.get('Date_confirmation')
            current = aggregates.get(key)
            if current is None:
                aggregates[key] = {'caseCount': 1, 'lastUpdated': last_updated}
                continue
            current['caseCount'] += 1
            if last_updated and (not current['lastUpdated'] or last_updated > current['lastUpdated']):
                current['lastUpdated'] = last_updated

    data = [
        {
            'countryCode': country_name,
            'name': admin1_name,
            'lastUpdated': agg['lastUpdated'],
            'caseCount': agg['caseCount'],
        }
        for (country_name, admin1_name), agg in aggregates.items()
    ]

    # Map code from name to iso3 for all entries in data
    data = [{**entry, 'countryCode': to_iso3(entry['countryCode'])} for entry in data]

    name_matching = load_json(
        s3, bucket, f'name-matching/{outbreak_name}/admin1/latest.json', default={})

    metadata = load_json(
        s3, bucket, f'metadata/admin1.json', default={})

    parsed_data = []
    missing_data = []

    for data_entry in data:
        admin1_name = data_entry['name']
        country_code = data_entry['countryCode']
        if country_code in name_matching:
            if admin1_name in name_matching[country_code]:
                admin1_name = name_matching[country_code][admin1_name]

        id = f'{country_code.upper()}.ADM1.{admin1_name.upper()}'
        if id not in metadata:
            missing_data.append(id)

        parsed_data.append({
            'case_count': data_entry['caseCount'],
            'last_updated': data_entry['lastUpdated'],
            'id': id,
        })

    save_json(s3, bucket, parsed_data_key, parsed_data)
    save_json(s3, bucket, missing_data_key, missing_data)
