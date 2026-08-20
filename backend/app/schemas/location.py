from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class LocationCreate(BaseModel):
    child_id: str
    device_id: Optional[str] = None
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    accuracy: Optional[float] = 5.0
    altitude: Optional[float] = None
    speed: Optional[float] = 0.0
    heading: Optional[float] = 0.0
    battery_level: Optional[float] = None
    address: Optional[str] = None
    recorded_at: Optional[datetime] = None

class LocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    child_id: str
    device_id: Optional[str] = None
    latitude: float
    longitude: float
    accuracy: Optional[float] = 5.0
    altitude: Optional[float] = None
    speed: Optional[float] = 0.0
    heading: Optional[float] = 0.0
    battery_level: Optional[float] = None
    address: Optional[str] = None
    recorded_at: datetime
    created_at: datetime

class CurrentLocationResponse(BaseModel):
    child_id: str
    child_name: Optional[str] = None
    current_location: Optional[LocationResponse] = None
    is_safe: bool = True
    active_zone_name: Optional[str] = None
    distance_to_caregiver_meters: Optional[float] = None
    separation_alert: bool = False
    battery_percentage: Optional[int] = None
    is_device_online: bool = True
    last_updated: Optional[datetime] = None

class LocationHistoryQuery(BaseModel):
    child_id: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    limit: int = Field(100, le=1000)
