import json
import boto3
import os

from ebola_bvd.parse_admin0_data import ebola_bvd_parse_admin0_data
from ebola_bvd.parse_admin1_data import ebola_bvd_parse_admin1_data
from ebola_bvd.parse_admin2_data import ebola_bvd_parse_admin2_data

s3 = boto3.client("s3")

# Parsed once at cold start from the env var set by backend.ts (JSON.stringify(OUTBREAK_CONFIGS)).
OUTBREAK_CONFIGS = json.loads(os.environ.get('OUTBREAK_CONFIGS', '{}'))


def handler(event, context):
    event = event or {}
    bucket = os.environ["BUCKET_NAME"]
    outbreak_name = event.get("outbreakName") or next(iter(OUTBREAK_CONFIGS), None)
    config_id = event.get("configId")

    if not outbreak_name or outbreak_name not in OUTBREAK_CONFIGS:
        raise ValueError(
            f"Unknown or missing outbreakName: {outbreak_name!r}. Known outbreaks: {list(OUTBREAK_CONFIGS)}")

    outbreak_config = OUTBREAK_CONFIGS[outbreak_name]
    data_url = event.get("dataUrl") or outbreak_config["dataUrl"]

    print(f"Running aggregation (configId={config_id}, outbreakName={outbreak_name})")

    if outbreak_name == "Ebola BVD":
        ebola_bvd_parse_admin0_data(s3, bucket, data_url, f'outbreaks/{outbreak_name}/admin0/latest.json',
                                    f'missing-data/{outbreak_name}/admin0/missing_data.json')
        ebola_bvd_parse_admin1_data(s3, bucket, data_url, outbreak_name,
                                    f'outbreaks/{outbreak_name}/admin1/latest.json',
                                    f'missing-data/{outbreak_name}/admin1/missing_data.json')
        ebola_bvd_parse_admin2_data(s3, bucket, data_url, outbreak_name,
                                        f'outbreaks/{outbreak_name}/admin2/latest.json',
                                        f'missing-data/{outbreak_name}/admin2/missing_data.json')

    return {"statusCode": 200, "body": json.dumps({"message": "Data parsed and saved successfully"})}
