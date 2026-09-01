import csv
from urllib.request import urlopen

from iso3 import to_iso3
from parsing_utils import load_json, save_json


def ebola_bvd_parse_admin2_data(s3, bucket, data_url, outbreak_name, parsed_data_key, missing_data_key):
    aggregates = {}
    with urlopen(data_url) as response:
        rows = csv.DictReader((line.decode('utf-8') for line in response))
        for row in rows:
            if row.get('Case_status') != 'confirmed':
                continue
            country_name = row.get('Location_Admin0')
            province_name = row.get('Location Admin1')
            health_zone_name = row.get('Health zone')
            if not country_name or not province_name or not health_zone_name:
                continue
            key = (country_name, province_name, health_zone_name)
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
            'province': province_name,
            'name': health_zone_name,
            'lastUpdated': agg['lastUpdated'],
            'caseCount': agg['caseCount'],
        }
        for (country_name, province_name, health_zone_name), agg in aggregates.items()
    ]
    data = [{**entry, 'countryCode': to_iso3(entry['countryCode'])} for entry in data]

    name_matching_province = load_json(
        s3, bucket, f'name-matching/{outbreak_name}/admin1/latest.json', default={})
    name_matching_health_zone = load_json(
        s3, bucket, f'name-matching/{outbreak_name}/admin2/latest.json', default={})

    metadata = load_json(
        s3, bucket, f'metadata/health_zone.json', default={})

    parsed_data = []
    missing_data = []

    provinces = []

    for data_entry in data:
        health_zone = data_entry['name']
        province = data_entry['province']
        country_code = data_entry['countryCode']
        if country_code in name_matching_province:
            if province in name_matching_province[country_code]:
                province = name_matching_province[country_code][province]

        if province not in provinces:
            provinces.append(province)
            province_id = f'{country_code.upper()}.ADM1.OTHER {province.upper()} PROVINCE'
            parsed_data.append({
                'case_count': 0,
                'last_updated': data_entry['lastUpdated'],
                'id': province_id,
            })
        if country_code in name_matching_health_zone:
            if province in name_matching_health_zone[country_code]:
                if health_zone in name_matching_health_zone[country_code][province]:
                    health_zone = name_matching_health_zone[country_code][province][health_zone]

        id = f'{country_code.upper()}.ADM1.{province.upper()}.HEALTH ZONE.{health_zone.upper()}'
        if id not in metadata:
            missing_data.append(id)

        parsed_data.append({
            'case_count': data_entry['caseCount'],
            'last_updated': data_entry['lastUpdated'],
            'id': id,
        })

    save_json(s3, bucket, parsed_data_key, parsed_data)
    save_json(s3, bucket, missing_data_key, missing_data)

