"""Shared S3 / parsing helpers used by the per-outbreak admin parsers."""
import json
import os
import tempfile
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


def build_feature(geometry, centroid, bounds, *, name, case_count, last_updated, country_code, feature_id):
    """Build the standard parsed map feature dict shared across all admin levels."""
    return {
        "lat": centroid.y,
        "long": centroid.x,
        "name": name,
        "bounds": bounds,
        "case_count": case_count,
        "last_updated": last_updated,
        "country_code": country_code,
        "geometry": geometry,
        "id": feature_id,
    }


def read_shapefile(s3, bucket, base_key,
                   extensions=('.shp', '.shx', '.dbf', '.prj', '.cpg', '.qmd')):
    """Download every component of a shapefile from S3 and read it into a GeoDataFrame.

    Returns an empty ``GeoDataFrame`` if the ``.shp`` component is missing.
    """
    import geopandas as gpd  # imported lazily so JSON-only callers don't pay for it

    name = os.path.basename(base_key)
    with tempfile.TemporaryDirectory() as tmpdir:
        downloaded_shp = False
        for ext in extensions:
            try:
                response = s3.get_object(Bucket=bucket, Key=f'{base_key}{ext}')
            except ClientError as e:
                if e.response["Error"]["Code"] != "NoSuchKey":
                    raise
                continue
            with open(os.path.join(tmpdir, f'{name}{ext}'), 'wb') as f:
                f.write(response["Body"].read())
            if ext == '.shp':
                downloaded_shp = True
        if downloaded_shp:
            return gpd.read_file(os.path.join(tmpdir, f'{name}.shp'))
    return gpd.GeoDataFrame()

