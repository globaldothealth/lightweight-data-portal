import csv
from urllib.request import urlopen

from iso3 import to_iso3
from parsing_utils import save_json


def ebola_bvd_parse_admin0_data(s3, bucket, data_url, parsed_data_key, missing_data_key):
    aggregates = {}
    with urlopen(data_url) as response:
        rows = csv.DictReader((line.decode('utf-8') for line in response))
        for row in rows:
            if row.get('Case_status') != 'confirmed':
                continue
            country_name = row.get('Location_Admin0')
            if not country_name:
                continue
            last_updated = row.get('Date_confirmation')
            current = aggregates.get(country_name)
            if current is None:
                aggregates[country_name] = {'caseCount': 1, 'lastUpdated': last_updated}
                continue
            current['caseCount'] += 1
            if last_updated and (not current['lastUpdated'] or last_updated > current['lastUpdated']):
                current['lastUpdated'] = last_updated

    data = [
        {'countryCode': country_name, 'lastUpdated': agg['lastUpdated'], 'caseCount': agg['caseCount']}
        for country_name, agg in aggregates.items()
    ]

    # Map code from name to iso3 for all entries in data
    data = [{**entry, 'countryCode': to_iso3(entry['countryCode'])} for entry in data]

    parsed_data = []
    for data_entry in data:
        parsed_data.append({
            'case_count': data_entry['caseCount'],
            'last_updated': data_entry['lastUpdated'],
            'id': data_entry["countryCode"],
        })

    save_json(s3, bucket, parsed_data_key, parsed_data)
