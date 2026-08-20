from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Tuple
from datetime import datetime

class SafeZoneCreate(BaseModel):
    child_id: str
    name: str = Field(..., example="Home", min_length=2, max_length=100)
    zone_type: str = Field("circle", example="circle")  # circle, polygon
    center_latitude: float = Field(..., ge=-90.0, le=90.0)
    center_longitude: float = Field(..., ge=-180.0, le=180.0)
    radius_meters: float = Field(150.0, ge=10.0, le=50000.0)
    polygon_coordinates: Optional[List[Tuple[float, float]]] = None
    address: Optional[str] = None
    is_active: bool = True
    alert_on_exit: bool = True
    alert_on_enter: bool = False

class SafeZoneUpdate(BaseModel):
    name: Optional[str] = None
    zone_type: Optional[str] = None
    center_latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    center_longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    radius_meters: Optional[float] = Field(None, ge=10.0, le=50000.0)
    polygon_coordinates: Optional[List[Tuple[float, float]]] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None
    alert_on_exit: Optional[bool] = None
    alert_on_enter: Optional[bool] = None

class SafeZoneResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    child_id: str
    name: str
    zone_type: str
    center_latitude: float
    center_longitude: float
    radius_meters: float
    polygon_coordinates: Optional[str] = None
    address: Optional[str] = None
    is_active: bool
    alert_on_exit: bool
    alert_on_enter: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

class SafeZoneStatusCheck(BaseModel):
    child_id: str
    latitude: float
    longitude: float
    is_inside_safe_zone: bool
    active_zone_id: Optional[str] = None
    active_zone_name: Optional[str] = None
    distance_to_boundary_meters: Optional[float] = None
