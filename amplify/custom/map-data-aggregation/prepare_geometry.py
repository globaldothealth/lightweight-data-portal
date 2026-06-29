from shapely.geometry import shape, mapping, MultiPolygon

def count_points(geometry_dict: dict) -> int:
    geom_type = geometry_dict.get("type")
    coords = geometry_dict.get("coordinates", [])

    if geom_type == "Polygon":
        return sum(len(ring) for ring in coords)
    if geom_type == "MultiPolygon":
        return sum(len(ring) for polygon in coords for ring in polygon)
    return 0

def simplify_to_target(geom, target_points: int):
    """Filter tiny polygons, then simplify to reach target point count."""
    # Sort polygons by area descending, keep only the largest ones
    if geom.geom_type == "MultiPolygon":
        polygons = sorted(geom.geoms, key=lambda p: p.area, reverse=True)
    else:
        polygons = [geom]

    # Keep polygons that together have enough detail; drop tiny islands
    # Start by keeping only polygons above an area threshold
    total_area = sum(p.area for p in polygons)
    # Keep polygons that represent at least 0.001% of total area
    min_area = total_area * 0.00001
    kept = [p for p in polygons if p.area >= min_area]
    print(f"kept {len(kept)} of {len(polygons)} polygons (min_area={min_area:.6f})")

    geom = MultiPolygon(kept) if len(kept) > 1 else kept[0]

    # Now iteratively simplify
    tolerance = 0.001
    while True:
        simplified = geom.simplify(tolerance, preserve_topology=True)
        pts = count_points(mapping(simplified))
        if pts <= target_points or tolerance > 10:
            return simplified, tolerance
        tolerance *= 1.5


hardcoded_bounds = {
    "USA": [-180,43,-80,55],
    "NZL": [160,-39,180,-45]
}

def prepare_geometry(geometry, area_code=None):
    from shapely.geometry.base import BaseGeometry
    # If geometry is already a Shapely object, convert to GeoJSON dict
    if isinstance(geometry, BaseGeometry):
        shapely_geom = geometry
        geometry = mapping(shapely_geom)
    else:
        shapely_geom = shape(geometry)

    centroid = shapely_geom.centroid
    # points = count_points(geometry)

    if area_code in hardcoded_bounds:
        bounds = hardcoded_bounds[area_code]
    else:
        bounds = shapely_geom.bounds

    # if points > 1000:
    #     simplified, tolerance = simplify_to_target(shapely_geom, target_points=max(1000, int(points / 10)))
    #     geometry = mapping(simplified)
    return geometry, centroid, bounds