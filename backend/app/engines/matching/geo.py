import math
from typing import Optional, Tuple

def haversine_distance_meters(lat1: Optional[float], lon1: Optional[float], lat2: Optional[float], lon2: Optional[float]) -> Optional[float]:
    """
    Computes the great-circle distance between two points on Earth using Haversine formula.
    Returns distance in meters, or None if coordinates are missing.
    """
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return None
    try:
        lat1, lon1, lat2, lon2 = float(lat1), float(lon1), float(lat2), float(lon2)
    except (ValueError, TypeError):
        return None
        
    R = 6371000.0 # Earth's radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def calculate_geo_similarity(distance_meters: Optional[float], tolerance_meters: float = 350.0) -> float:
    """
    Calculates geographic proximity score between 0.0 and 100.0.
    - Within 50m: 100.0%
    - Within tolerance (e.g. 350m): smoothly decays from 100% to 75%
    - Between 350m and 1000m: decays from 75% to 20%
    - Over 1500m: 0.0%
    - Missing coordinates: neutral fallback 50.0%
    """
    if distance_meters is None:
        return 50.0 # neutral default when coordinates are absent
        
    if distance_meters <= 50.0:
        return 100.0
    elif distance_meters <= tolerance_meters:
        # Linear decay from 100 to 75
        ratio = (distance_meters - 50.0) / (tolerance_meters - 50.0)
        return round(100.0 - (ratio * 25.0), 2)
    elif distance_meters <= 1500.0:
        # Linear decay from 75 to 0
        ratio = (distance_meters - tolerance_meters) / (1500.0 - tolerance_meters)
        return max(0.0, round(75.0 - (ratio * 75.0), 2))
    else:
        return 0.0
