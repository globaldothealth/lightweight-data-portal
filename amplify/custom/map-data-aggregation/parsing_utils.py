"""Shared S3 / parsing helpers used by the per-outbreak admin parsers."""
import json
from botocore.exceptions import ClientError


def load_json(s3, bucket, key, default=None):
    """Load and parse a JSON object from S3.

    Returns ``default`` when the key does not exist instead of raising, so callers
    can treat optional inputs (e.g. name-matching overrides) as empty.
    """
    try:
        response = s3.get_object(Bucket=bucket, Key=key)
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchKey":
            return default
        raise
    return json.loads(response["Body"].read().decode("utf-8"))


def save_json(s3, bucket, key, obj):
    """Serialise ``obj`` as indented JSON and upload it to S3."""
    s3.put_object(
        Bucket=bucket,
        Key=key,
        Body=json.dumps(obj, indent=2),
        ContentType="application/json",
    )

