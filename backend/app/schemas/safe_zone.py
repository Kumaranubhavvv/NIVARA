from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict
from typing import Optional, List, Tuple, Literal, Dict, Any
from datetime import datetime
import json


# ─────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────

ZONE_TYPES = Literal["circle", "polygon"]


# ─────────────────────────────────────────────────────────────
# Input Schemas
# ─────────────────────────────────────────────────────────────

class SafeZoneCreate(BaseModel):
    """
    Schema for creating a new geofenced safe zone.
    - Circle zones require center_latitude, center_longitude, and radius_meters.
    - Polygon zones require polygon_coordinates with at least 3 vertices.
    """
    child_id: str = Field(..., description="ID of the child this zone protects")
    name: str = Field(..., min_length=2, max_length=100, description="Friendly zone label", examples=["Home", "School"])
    zone_type: ZONE_TYPES = Field("circle", description="Boundary geometry type")

    # Circular geometry
    center_latitude: float = Field(..., ge=-90.0, le=90.0, description="Zone centre latitude")
    center_longitude: float = Field(..., ge=-180.0, le=180.0, description="Zone centre longitude")
    radius_meters: float = Field(150.0, ge=10.0, le=50000.0, description="Radius in metres (circle zones only)")

    # Polygon geometry
    polygon_coordinates: Optional[List[Tuple[float, float]]] = Field(
        None,
        description="List of (lat, lon) vertices defining the polygon boundary (polygon zones only, min 3 points)"
    )

    # Metadata
    address: Optional[str] = Field(None, max_length=512, description="Human-readable address for this zone")

    # Alert triggers
    is_active: bool = Field(True, description="Whether this zone's alerts are active")
    alert_on_exit: bool = Field(True, description="Trigger alert when child leaves this zone")
    alert_on_enter: bool = Field(False, description="Trigger alert when child enters this zone")

    @field_validator("name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        return v.strip()

    @model_validator(mode="after")
    def validate_zone_geometry(self) -> "SafeZoneCreate":
        """Polygon zones must supply at least 3 coordinate vertices."""
        if self.zone_type == "polygon":
            if not self.polygon_coordinates or len(self.polygon_coordinates) < 3:
                raise ValueError("Polygon zones require at least 3 coordinate vertices in polygon_coordinates")
        return self


class SafeZoneUpdate(BaseModel):
    """
    Schema for partially updating a safe zone.
    All fields are optional; only supplied fields are applied.
    """
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    zone_type: Optional[ZONE_TYPES] = None
    center_latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    center_longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    radius_meters: Optional[float] = Field(None, ge=10.0, le=50000.0)
    polygon_coordinates: Optional[List[Tuple[float, float]]] = None
    address: Optional[str] = Field(None, max_length=512)
    is_active: Optional[bool] = None
    alert_on_exit: Optional[bool] = None
    alert_on_enter: Optional[bool] = None

    @model_validator(mode="after")
    def validate_polygon_if_type_set(self) -> "SafeZoneUpdate":
        """If switching to polygon type, coordinates must be provided."""
        if self.zone_type == "polygon" and self.polygon_coordinates is not None:
            if len(self.polygon_coordinates) < 3:
                raise ValueError("Polygon zones require at least 3 coordinate vertices")
        return self


class SafeZoneToggleRequest(BaseModel):
    """
    Schema for quickly toggling a zone's active state without a full PATCH.
    """
    is_active: bool = Field(..., description="Set True to enable alerts, False to pause them")


class SafeZoneGeofenceCheck(BaseModel):
    """
    On-demand geofence check — asks the server whether a specific point
    is inside any safe zone for a given child.
    """
    child_id: str
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)


# ─────────────────────────────────────────────────────────────
# Output Schemas
# ─────────────────────────────────────────────────────────────

class SafeZoneResponse(BaseModel):
    """
    Full serialisation of a safe zone record for API responses.
    Supports ORM-mode loading from the SafeZone SQLAlchemy model.
    polygon_coordinates is returned as a parsed list, not a raw JSON string.
    """
    model_config = ConfigDict(from_attributes=True)

    id: str
    child_id: str

    # Metadata
    name: str
    zone_type: str
    address: Optional[str] = None

    # Circle geometry
    center_latitude: float
    center_longitude: float
    radius_meters: float

    # Polygon geometry — raw string from ORM; client should parse as JSON
    polygon_coordinates: Optional[str] = None

    # Alert triggers
    is_active: bool
    alert_on_exit: bool
    alert_on_enter: bool

    # Timestamps
    created_at: datetime
    updated_at: Optional[datetime] = None

    @property
    def parsed_polygon(self) -> Optional[List[Tuple[float, float]]]:
        """Helper: deserialise polygon_coordinates JSON string to list of tuples."""
        if not self.polygon_coordinates:
            return None
        try:
            return json.loads(self.polygon_coordinates)
        except Exception:
            return None


class SafeZoneStatusCheck(BaseModel):
    """
    Result of a real-time geofence containment check for a child's current position.
    Returned after each location ping is processed.
    """
    child_id: str
    latitude: float
    longitude: float

    # Containment result
    is_inside_safe_zone: bool
    active_zone_id: Optional[str] = None
    active_zone_name: Optional[str] = None
    zone_type: Optional[str] = None           # "circle" | "polygon"

    # Distance context
    distance_to_boundary_meters: Optional[float] = None
    distance_to_center_meters: Optional[float] = None

    # Nearest zone (even if outside all zones)
    nearest_zone_id: Optional[str] = None
    nearest_zone_name: Optional[str] = None
    nearest_zone_distance_meters: Optional[float] = None

    # Alert flags
    exit_alert_triggered: bool = False
    enter_alert_triggered: bool = False


class SafeZoneBulkStatusResponse(BaseModel):
    """
    Geofence status across all active safe zones for a given child.
    Used by the dashboard to render a zone-level heatmap or list.
    """
    child_id: str
    child_name: Optional[str] = None
    total_active_zones: int
    zones_inside: List[str] = []       # zone IDs the child is currently inside
    zones_outside: List[str] = []      # zone IDs the child is currently outside
    zone_details: List[SafeZoneStatusCheck] = []


class SafeZoneListResponse(BaseModel):
    """
    Paginated list of safe zones for a given child.
    """
    child_id: str
    total: int
    zones: List[SafeZoneResponse]
