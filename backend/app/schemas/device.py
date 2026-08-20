from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class DeviceCreate(BaseModel):
    child_id: Optional[str] = None
    device_name: str = Field(..., example="GPS Safety Band V2")
    device_type: str = Field("gps_band", example="gps_band")
    serial_number: str = Field(..., example="NIVARA-BAND-98231")
    battery_level: Optional[int] = Field(100, ge=0, le=100)
    firmware_version: Optional[str] = "v1.2.0"

class DeviceUpdate(BaseModel):
    child_id: Optional[str] = None
    device_name: Optional[str] = None
    device_type: Optional[str] = None
    is_active: Optional[bool] = None
    firmware_version: Optional[str] = None

class DeviceHeartbeat(BaseModel):
    serial_number: str
    battery_level: int = Field(..., ge=0, le=100)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy: Optional[float] = 5.0
    firmware_version: Optional[str] = None

class DeviceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    child_id: Optional[str] = None
    device_name: str
    device_type: str
    serial_number: str
    battery_level: int
    is_active: bool
    is_online: bool
    firmware_version: Optional[str] = None
    last_ping_at: Optional[datetime] = None
    created_at: datetime
