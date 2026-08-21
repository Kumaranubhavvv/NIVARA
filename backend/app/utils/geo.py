import math
from typing import Tuple, Dict, Any, Optional
from app.utils.distance import calculate_haversine_distance, is_point_in_polygon


def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates compass bearing (heading) in degrees (0 - 360) from point 1 to point 2.
    """
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    diff_lon = math.radians(lon2 - lon1)

    x = math.sin(diff_lon) * math.cos(lat2_rad)
    y = math.cos(lat1_rad) * math.sin(lat2_rad) - (
        math.sin(lat1_rad) * math.cos(lat2_rad) * math.cos(diff_lon)
    )

    initial_bearing = math.atan2(x, y)
    compass_bearing = (math.degrees(initial_bearing) + 360) % 360
    return round(compass_bearing, 2)


def get_bounding_box(lat: float, lon: float, radius_meters: float) -> Dict[str, float]:
    """
    Computes a rectangular latitude/longitude bounding box around a center point for rapid DB filtering.
    """
    earth_radius = 6371000.0  # meters
    lat_delta = (radius_meters / earth_radius) * (180 / math.pi)
    lon_delta = (radius_meters / (earth_radius * math.cos(math.radians(lat)))) * (180 / math.pi)

    return {
        "min_lat": lat - lat_delta,
        "max_lat": lat + lat_delta,
        "min_lon": lon - lon_delta,
        "max_lon": lon + lon_delta,
    }


def is_coordinate_valid(lat: Optional[float], lon: Optional[float]) -> bool:
    """Checks if latitude is in [-90, 90] and longitude is in [-180, 180]."""
    if lat is None or lon is None:
        return False
    return -90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0
