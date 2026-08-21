from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone


# ─────────────────────────────────────────────────────────────
# Input Schemas
# ─────────────────────────────────────────────────────────────

class LocationCreate(BaseModel):
    """
    Schema for creating a new location ping.
    Validates coordinate bounds and normalises heading to [0, 360).
    """
    child_id: str = Field(..., description="ID of the child being tracked")
    device_id: Optional[str] = Field(None, description="ID of the emitting device, if available")

    # GPS Coordinates
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude in decimal degrees")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude in decimal degrees")

    # Telemetry
    accuracy: Optional[float] = Field(5.0, ge=0.0, description="GPS accuracy radius in metres")
    altitude: Optional[float] = Field(None, description="Altitude in metres above sea level")
    speed: Optional[float] = Field(0.0, ge=0.0, description="Speed in m/s")
    heading: Optional[float] = Field(0.0, ge=0.0, le=360.0, description="Compass heading in degrees")
    battery_level: Optional[float] = Field(None, ge=0.0, le=100.0, description="Battery percentage (0-100)")

    # Human-readable
    address: Optional[str] = Field(None, max_length=512, description="Reverse-geocoded address string")
    recorded_at: Optional[datetime] = Field(None, description="Device-side timestamp; defaults to server time if absent")

    @field_validator("heading")
    @classmethod
    def normalise_heading(cls, v: Optional[float]) -> Optional[float]:
        """Wrap heading values > 360 back into [0, 360) range."""
        if v is not None and v > 360.0:
            return v % 360.0
        return v

    @field_validator("recorded_at", mode="before")
    @classmethod
    def default_recorded_at(cls, v):
        """If not supplied by device, default to server UTC time."""
        return v or datetime.now(timezone.utc)


class LocationUpdate(BaseModel):
    """
    Schema for partially updating an existing location record (address correction, accuracy refinement).
    """
    accuracy: Optional[float] = Field(None, ge=0.0)
    altitude: Optional[float] = None
    speed: Optional[float] = Field(None, ge=0.0)
    heading: Optional[float] = Field(None, ge=0.0, le=360.0)
    battery_level: Optional[float] = Field(None, ge=0.0, le=100.0)
    address: Optional[str] = Field(None, max_length=512)


class BulkLocationCreate(BaseModel):
    """
    Schema for batch ingestion of location pings (e.g., offline flush from device).
    Accepts up to 500 pings in a single request.
    """
    locations: List[LocationCreate] = Field(..., min_length=1, max_length=500)

    @model_validator(mode="after")
    def all_same_child(self) -> "BulkLocationCreate":
        """Ensures all pings in a batch belong to the same child."""
        child_ids = {loc.child_id for loc in self.locations}
        if len(child_ids) > 1:
            raise ValueError("All pings in a bulk upload must belong to the same child_id")
        return self


class LocationHistoryQuery(BaseModel):
    """
    Query parameters for fetching location history for a child.
    """
    child_id: str
    start_time: Optional[datetime] = Field(None, description="UTC start of time window")
    end_time: Optional[datetime] = Field(None, description="UTC end of time window")
    limit: int = Field(100, ge=1, le=1000, description="Maximum number of records to return")
    include_address: bool = Field(False, description="Whether to include reverse-geocoded address strings")

    @model_validator(mode="after")
    def end_after_start(self) -> "LocationHistoryQuery":
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


# ─────────────────────────────────────────────────────────────
# Output Schemas
# ─────────────────────────────────────────────────────────────

class LocationResponse(BaseModel):
    """
    Full serialisation of a single location record for API responses.
    Supports ORM-mode loading from the Location SQLAlchemy model.
    """
    model_config = ConfigDict(from_attributes=True)

    id: str
    child_id: str
    device_id: Optional[str] = None

    # GPS
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    altitude: Optional[float] = None

    # Kinematics
    speed: Optional[float] = None
    heading: Optional[float] = None

    # Device
    battery_level: Optional[float] = None

    # Address
    address: Optional[str] = None

    # Timestamps
    recorded_at: datetime
    created_at: datetime


class CurrentLocationResponse(BaseModel):
    """
    Enriched safety-aware snapshot of a child's most recent location,
    including geofence status, battery state, and separation alert flags.
    """
    child_id: str
    child_name: Optional[str] = None
    avatar_url: Optional[str] = None

    # Latest GPS snapshot
    current_location: Optional[LocationResponse] = None

    # Safety context
    is_safe: bool = True
    active_zone_name: Optional[str] = None
    zone_type: Optional[str] = None                       # "circle" | "polygon"
    distance_to_zone_boundary_m: Optional[float] = None

    # Proximity
    distance_to_caregiver_meters: Optional[float] = None
    separation_alert: bool = False
    separation_threshold_meters: Optional[float] = None

    # Device health
    battery_percentage: Optional[int] = None
    battery_is_low: bool = False
    is_device_online: bool = True
    device_last_seen: Optional[datetime] = None

    # Meta
    last_updated: Optional[datetime] = None
    unacknowledged_event_count: int = 0


class LocationHistoryResponse(BaseModel):
    """
    Paginated location history result for a given child and time window.
    """
    child_id: str
    total: int
    limit: int
    locations: List[LocationResponse]


class RoutePlaybackResponse(BaseModel):
    """
    Ordered sequence of coordinates for route playback / breadcrumb trail animation.
    """
    child_id: str
    child_name: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    total_points: int
    total_distance_km: Optional[float] = None
    waypoints: List[Dict[str, Any]]   # [{lat, lng, ts, speed, battery_level}, ...]


class LocationBulkResponse(BaseModel):
    """
    Response after a successful batch location upload.
    """
    accepted: int
    rejected: int
    errors: List[str] = []
    triggered_events: List[str] = []   # IDs of any safety events fired during ingestion
