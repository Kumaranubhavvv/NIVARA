from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
import json


# ─────────────────────────────────────────────────────────────
# Constants — mirror SafetyEvent ORM model constants
# ─────────────────────────────────────────────────────────────

EVENT_TYPES = Literal[
    "geofence_exit",
    "geofence_entry",
    "separation_alert",
    "low_battery",
    "device_offline",
    "sos_triggered",
    "speed_alert",
]

EVENT_SEVERITIES = Literal["info", "warning", "critical"]

# Default severity for each event type
_DEFAULT_SEVERITY: Dict[str, str] = {
    "geofence_exit":    "warning",
    "geofence_entry":   "info",
    "separation_alert": "critical",
    "low_battery":      "warning",
    "device_offline":   "warning",
    "sos_triggered":    "critical",
    "speed_alert":      "warning",
}


# ─────────────────────────────────────────────────────────────
# Typed Metadata Payload Schemas
# (used internally by the service layer to build metadata_json)
# ─────────────────────────────────────────────────────────────

class GeofenceEventMetadata(BaseModel):
    """Metadata payload for geofence_exit / geofence_entry events."""
    zone_id: str
    zone_name: str
    zone_type: str                          # "circle" | "polygon"
    distance_to_boundary_m: Optional[float] = None


class SeparationEventMetadata(BaseModel):
    """Metadata payload for separation_alert events."""
    distance_to_caregiver_m: float
    threshold_m: float
    caregiver_id: Optional[str] = None


class LowBatteryEventMetadata(BaseModel):
    """Metadata payload for low_battery events."""
    battery_level: int                      # 0-100
    device_id: str
    serial_number: Optional[str] = None


class SpeedAlertEventMetadata(BaseModel):
    """Metadata payload for speed_alert events."""
    speed_ms: float                         # speed in m/s
    speed_kmh: float                        # speed in km/h
    threshold_kmh: float


class DeviceOfflineMetadata(BaseModel):
    """Metadata payload for device_offline events."""
    device_id: str
    serial_number: Optional[str] = None
    minutes_offline: Optional[float] = None


# ─────────────────────────────────────────────────────────────
# Input Schemas
# ─────────────────────────────────────────────────────────────

class SafetyEventCreate(BaseModel):
    """
    Schema for creating a new safety audit event.
    Severity auto-defaults based on event_type if not supplied.
    metadata can be supplied as a plain dict — it is serialised server-side.
    """
    child_id: str = Field(..., description="ID of the child this event relates to")
    event_type: EVENT_TYPES = Field(..., description="Classified type of safety event")
    severity: Optional[EVENT_SEVERITIES] = Field(
        None, description="Severity level — auto-inferred from event_type if omitted"
    )

    # Human-readable content
    title: str = Field(..., min_length=2, max_length=256, description="Short event title", examples=["Safe Zone Exit Detected"])
    description: Optional[str] = Field(None, max_length=2000, description="Detailed description of what occurred")

    # Location at time of event
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)

    # Flexible event payload (dict; serialised to JSON by service layer)
    metadata: Optional[Dict[str, Any]] = Field(
        None, description="Typed event-specific payload dict (zone info, distance, battery level, etc.)"
    )

    @field_validator("title")
    @classmethod
    def strip_title(cls, v: str) -> str:
        return v.strip()

    @model_validator(mode="after")
    def apply_default_severity(self) -> "SafetyEventCreate":
        """If severity is not explicitly set, infer it from the event_type."""
        if self.severity is None:
            self.severity = _DEFAULT_SEVERITY.get(self.event_type, "warning")
        return self


class SafetyEventAcknowledge(BaseModel):
    """
    Schema for acknowledging a single safety event.
    acknowledged_by carries the caregiver user ID for audit trail.
    """
    acknowledged_by: Optional[str] = Field(
        None, description="User ID of the caregiver acknowledging — set server-side from JWT if omitted"
    )


class SafetyEventBulkAcknowledge(BaseModel):
    """
    Schema for acknowledging multiple safety events in one request.
    Maximum 100 events per batch.
    """
    event_ids: List[str] = Field(..., min_length=1, max_length=100, description="List of event IDs to acknowledge")
    acknowledged_by: Optional[str] = Field(None, description="User ID of the acknowledging caregiver")

    @field_validator("event_ids")
    @classmethod
    def unique_ids(cls, v: List[str]) -> List[str]:
        return list(dict.fromkeys(v))    # deduplicate while preserving order


class SafetyEventFilterQuery(BaseModel):
    """
    Query parameters for filtering the safety event feed for a given child.
    """
    child_id: str
    event_type: Optional[EVENT_TYPES] = Field(None, description="Filter by specific event type")
    severity: Optional[EVENT_SEVERITIES] = Field(None, description="Filter by severity level")
    is_acknowledged: Optional[bool] = Field(None, description="None = all, True = acked, False = unacked")
    start_time: Optional[datetime] = Field(None, description="UTC start of time window")
    end_time: Optional[datetime] = Field(None, description="UTC end of time window")
    limit: int = Field(50, ge=1, le=200, description="Max events to return")

    @model_validator(mode="after")
    def end_after_start(self) -> "SafetyEventFilterQuery":
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


# ─────────────────────────────────────────────────────────────
# Output Schemas
# ─────────────────────────────────────────────────────────────

class SafetyEventResponse(BaseModel):
    """
    Full serialisation of a safety event record.
    Supports ORM-mode loading from the SafetyEvent SQLAlchemy model.
    metadata_json is surfaced as a parsed dict in the 'metadata' field.
    """
    model_config = ConfigDict(from_attributes=True)

    id: str
    child_id: str

    # Classification
    event_type: str
    severity: str
    is_critical: bool = False              # True when severity == "critical"

    # Content
    title: str
    description: Optional[str] = None

    # Location
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # Payload (raw JSON string from ORM — deserialise client-side or via helper)
    metadata_json: Optional[str] = None

    # Acknowledgement
    is_acknowledged: bool
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None

    # Timestamps
    created_at: datetime

    # Enrichment (populated by service layer)
    child_name: Optional[str] = None

    @property
    def parsed_metadata(self) -> Optional[Dict[str, Any]]:
        """Deserialises metadata_json → dict for use in Python response handlers."""
        if not self.metadata_json:
            return None
        try:
            return json.loads(self.metadata_json)
        except Exception:
            return None


class SafetyEventFeedResponse(BaseModel):
    """
    Paginated safety event feed for a given child.
    Includes unacknowledged count for badge rendering.
    """
    child_id: str
    total: int
    unacknowledged_count: int = 0
    limit: int
    events: List[SafetyEventResponse]


class SafetyEventBulkAckResponse(BaseModel):
    """
    Result of a bulk-acknowledge operation.
    """
    acknowledged: int
    skipped: int             # already-acknowledged events that were in the batch
    not_found: int           # IDs not found in DB
    event_ids: List[str]     # IDs of successfully acknowledged events


class SafetyOverviewSummary(BaseModel):
    """
    High-level child safety dashboard summary.
    Aggregates real-time safety signals into a single API response
    consumed by the caregiver's home screen.
    """
    child_id: str
    child_name: str
    avatar_url: Optional[str] = None

    # Overall safety signal
    status: str                                       # "safe" | "warning" | "critical"
    is_safe: bool

    # Device health
    battery_level: int
    battery_is_low: bool = False
    is_device_online: bool

    # Location snapshot
    last_known_location: Optional[Dict[str, Any]] = None
    last_location_updated: Optional[datetime] = None

    # Zone summary
    active_safe_zones_count: int
    zones_currently_inside: List[str] = []            # zone names child is inside

    # Alert counters
    unacknowledged_alerts_count: int
    active_emergency_count: int

    # Most recent unacknowledged event
    latest_alert: Optional[SafetyEventResponse] = None

