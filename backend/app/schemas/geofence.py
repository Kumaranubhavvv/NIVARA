from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Literal, Dict, Any
from datetime import datetime


# ─────────────────────────────────────────────────────────────
# Enums / Literals
# ─────────────────────────────────────────────────────────────

ChildStatus = Literal["safe", "out_of_bounds", "emergency", "separation", "unknown"]


# ─────────────────────────────────────────────────────────────
# Request Schemas
# ─────────────────────────────────────────────────────────────


class GeofenceEvaluateRequest(BaseModel):
    """
    Request body for evaluating a GPS coordinate against all of a child's safe zones.
    Can optionally suppress SafetyEvent creation (e.g. for dry-run / map preview).
    """

    child_id: str = Field(..., description="ID of the child whose zones to evaluate against")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="GPS latitude of the point to evaluate")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="GPS longitude of the point to evaluate")
    create_events: bool = Field(
        True,
        description=(
            "If True (default), log SafetyEvents and dispatch notifications on state transitions. "
            "Set False for dry-run containment checks without side effects."
        ),
    )


class GeofenceBatchEvaluateRequest(BaseModel):
    """
    Batch evaluate the same GPS coordinate against multiple children simultaneously.
    Useful for group monitoring scenarios (school pickup, theme park, etc.).
    """

    child_ids: List[str] = Field(
        ...,
        min_length=1,
        max_length=50,
        description="List of child IDs to evaluate (max 50 per request)",
    )
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    create_events: bool = Field(False, description="Whether to log events during batch evaluation")


class GeofenceOverviewRequest(BaseModel):
    """
    Request to retrieve a child's full geofence overview at a specific coordinate.
    current_lat/lon are optional; omitting them returns zone list without containment status.
    """

    child_id: str
    current_lat: Optional[float] = Field(None, ge=-90.0, le=90.0)
    current_lon: Optional[float] = Field(None, ge=-180.0, le=180.0)


# ─────────────────────────────────────────────────────────────
# Response Schemas — Zone-Level Detail
# ─────────────────────────────────────────────────────────────


class ZoneContainmentDetail(BaseModel):
    """
    Per-zone containment result included inside broader evaluation responses.
    """

    zone_id: str
    zone_name: str
    zone_type: str  # "circle" | "polygon"
    is_inside: bool
    distance_to_center_meters: Optional[float] = None
    distance_to_boundary_meters: Optional[float] = None


# ─────────────────────────────────────────────────────────────
# Response Schemas — Evaluation
# ─────────────────────────────────────────────────────────────


class GeofenceEvaluationResponse(BaseModel):
    """
    Full result of evaluating a single GPS coordinate against a child's safe zones.
    Returned by POST /geofence/evaluate and POST /geofence/check.
    """

    child_id: str
    latitude: float
    longitude: float

    # Containment result
    is_inside_safe_zone: bool
    status: ChildStatus

    # Active zone (if inside any zone)
    active_zone_id: Optional[str] = None
    active_zone_name: Optional[str] = None
    zone_type: Optional[str] = None  # "circle" | "polygon"

    # Distance context
    distance_to_boundary_meters: Optional[float] = None
    distance_to_center_meters: Optional[float] = None

    # Nearest zone (even when outside all zones)
    nearest_zone_id: Optional[str] = None
    nearest_zone_name: Optional[str] = None
    nearest_zone_distance_meters: Optional[float] = None

    # Alert dispatch flags
    exit_alert_triggered: bool = False
    enter_alert_triggered: bool = False

    # Error reporting (child not found, etc.)
    error: Optional[str] = None


class GeofenceBatchEvaluationResult(BaseModel):
    """
    Single child entry inside a batch evaluation response.
    """

    child_id: str
    is_inside_safe_zone: bool
    status: ChildStatus
    active_zone_name: Optional[str] = None
    nearest_zone_name: Optional[str] = None
    nearest_zone_distance_meters: Optional[float] = None
    exit_alert_triggered: bool = False
    error: Optional[str] = None


class GeofenceBatchEvaluationResponse(BaseModel):
    """
    Batch evaluation result for multiple children at the same GPS coordinate.
    Returned by POST /geofence/batch-evaluate.
    """

    latitude: float
    longitude: float
    total_evaluated: int
    children_inside: int
    children_outside: int
    results: List[GeofenceBatchEvaluationResult]


# ─────────────────────────────────────────────────────────────
# Response Schemas — Overview
# ─────────────────────────────────────────────────────────────


class GeofenceOverviewResponse(BaseModel):
    """
    Full zone-level geofence overview for a child.
    Returned by GET /geofence/overview/{child_id}.
    """

    child_id: str
    child_name: Optional[str] = None
    total_active_zones: int
    zones_inside: List[str] = []   # zone names the child is currently inside
    zones_outside: List[str] = []  # zone names the child is currently outside
    zone_details: List[ZoneContainmentDetail] = []


# ─────────────────────────────────────────────────────────────
# Response Schemas — Boundary Distance
# ─────────────────────────────────────────────────────────────


class GeofenceBoundaryDistanceResponse(BaseModel):
    """
    Signed distance from a GPS point to a specific safe zone boundary.
    Positive = outside boundary; negative = inside boundary.
    Returned by GET /geofence/distance/{zone_id}.
    """

    zone_id: str
    zone_name: str
    zone_type: str
    latitude: float
    longitude: float
    distance_to_center_meters: float
    distance_to_boundary_meters: float
    is_inside: bool


# ─────────────────────────────────────────────────────────────
# Response Schemas — Status Summary
# ─────────────────────────────────────────────────────────────


class GeofenceChildStatusSummary(BaseModel):
    """
    Lightweight geofence status summary for a single child.
    Used in dashboard cards and quick-status panels.
    """

    child_id: str
    child_name: Optional[str] = None
    current_status: ChildStatus
    is_inside_safe_zone: bool
    active_zone_name: Optional[str] = None
    nearest_zone_name: Optional[str] = None
    nearest_zone_distance_meters: Optional[float] = None
    last_evaluated_at: Optional[datetime] = None


class GeofenceCaregiverStatusResponse(BaseModel):
    """
    Aggregated geofence status for all children under a caregiver.
    Returned by GET /geofence/caregiver-status.
    """

    caregiver_id: str
    total_children: int
    children_safe: int
    children_out_of_bounds: int
    children_emergency: int
    children: List[GeofenceChildStatusSummary]
