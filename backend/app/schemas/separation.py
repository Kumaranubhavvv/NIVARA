from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, Literal
from datetime import datetime

ProximityZone = Literal["immediate", "near", "caution", "critical"]
SafetySeverity = Literal["info", "warning", "critical"]


class SeparationEvaluateRequest(BaseModel):
    """Request schema for evaluating live separation between child and caregiver coordinates."""
    child_id: str = Field(..., description="ID of the child being monitored")
    child_latitude: float = Field(..., ge=-90.0, le=90.0, description="Child's GPS latitude")
    child_longitude: float = Field(..., ge=-180.0, le=180.0, description="Child's GPS longitude")
    caregiver_latitude: float = Field(..., ge=-90.0, le=90.0, description="Caregiver's GPS latitude")
    caregiver_longitude: float = Field(..., ge=-180.0, le=180.0, description="Caregiver's GPS longitude")
    custom_threshold_meters: Optional[float] = Field(
        None, ge=5.0, le=5000.0, description="Optional custom threshold in meters (defaults to system setting)"
    )
    create_event: bool = Field(True, description="Whether to log SafetyEvent and dispatch alerts on breach")


class SeparationCheckRequest(BaseModel):
    """Request schema for checking separation using child's latest recorded location ping."""
    child_id: str = Field(..., description="ID of the child to evaluate")
    caregiver_latitude: float = Field(..., ge=-90.0, le=90.0, description="Caregiver's GPS latitude")
    caregiver_longitude: float = Field(..., ge=-180.0, le=180.0, description="Caregiver's GPS longitude")
    custom_threshold_meters: Optional[float] = Field(None, ge=5.0, le=5000.0)
    create_event: bool = Field(False, description="Defaults to False for passive polling")


class SeparationEvaluationResponse(BaseModel):
    """Comprehensive evaluation response schema for proximity and separation monitoring."""
    child_id: str
    child_name: Optional[str] = None
    distance_meters: Optional[float] = None
    threshold_meters: float
    is_separated: bool
    severity: SafetySeverity
    proximity_zone: ProximityZone
    status: str
    triggered_event_id: Optional[str] = None
    child_coordinates: Optional[Dict[str, float]] = None
    caregiver_coordinates: Optional[Dict[str, float]] = None
    error: Optional[str] = None
