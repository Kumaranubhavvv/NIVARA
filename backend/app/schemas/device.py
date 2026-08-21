from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime


# ─────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────

DEVICE_TYPES = Literal["gps_band", "smartwatch", "pendant", "smartphone"]
LOW_BATTERY_THRESHOLD = 20  # percent


# ─────────────────────────────────────────────────────────────
# Input Schemas
# ─────────────────────────────────────────────────────────────

class DeviceCreate(BaseModel):
    """
    Schema for registering a new hardware device in NIVARA.
    Serial numbers are normalised to uppercase.
    """
    child_id: Optional[str] = Field(None, description="Child to immediately pair this device with (optional at registration)")
    device_name: str = Field(..., min_length=2, max_length=128, description="Human-friendly device label", examples=["GPS Safety Band V2"])
    device_type: DEVICE_TYPES = Field("gps_band", description="Hardware category")
    serial_number: str = Field(..., min_length=4, max_length=64, description="Unique hardware serial", examples=["NIVARA-BAND-98231"])
    battery_level: Optional[int] = Field(100, ge=0, le=100, description="Initial battery level percentage")
    firmware_version: Optional[str] = Field("v1.2.0", max_length=32, description="Installed firmware version string")

    @field_validator("serial_number")
    @classmethod
    def normalise_serial(cls, v: str) -> str:
        """Strips whitespace and converts serial to uppercase for consistent storage."""
        return v.strip().upper()

    @field_validator("device_name")
    @classmethod
    def strip_device_name(cls, v: str) -> str:
        return v.strip()


class DeviceUpdate(BaseModel):
    """
    Schema for partially updating device metadata or re-pairing to a child.
    All fields are optional — only supplied fields are applied.
    """
    child_id: Optional[str] = Field(None, description="Re-pair to a different child or set to null to unpair")
    device_name: Optional[str] = Field(None, min_length=2, max_length=128)
    device_type: Optional[DEVICE_TYPES] = None
    is_active: Optional[bool] = Field(None, description="Deactivate (soft-delete) the device")
    firmware_version: Optional[str] = Field(None, max_length=32)


class DevicePairingRequest(BaseModel):
    """
    Schema for pairing an already-registered device to a child profile.
    Sent by the parent/caregiver from the NIVARA app.
    """
    device_id: str = Field(..., description="ID of the device to pair")
    child_id: str = Field(..., description="ID of the child to pair the device with")
    force: bool = Field(False, description="If True, unpair from current child and re-pair")


class DeviceUnpairRequest(BaseModel):
    """
    Schema for explicitly unpairing a device from its current child.
    """
    device_id: str


class DeviceHeartbeat(BaseModel):
    """
    Periodic telemetry ping sent from the wearable device firmware.
    May include an optional location snapshot for immediate ingestion.
    """
    serial_number: str = Field(..., description="Hardware serial — used to identify the device")
    battery_level: int = Field(..., ge=0, le=100, description="Current battery level percentage")

    # Optional inline location snapshot
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    accuracy: Optional[float] = Field(5.0, ge=0.0)
    speed: Optional[float] = Field(None, ge=0.0, description="Speed in m/s")
    heading: Optional[float] = Field(None, ge=0.0, le=360.0)

    # Device metadata
    firmware_version: Optional[str] = Field(None, max_length=32)
    signal_strength: Optional[int] = Field(None, ge=-120, le=0, description="RSSI signal strength in dBm")
    is_online: Optional[bool] = Field(True, description="Override online status from device")

    @field_validator("serial_number")
    @classmethod
    def normalise_serial(cls, v: str) -> str:
        return v.strip().upper()


# ─────────────────────────────────────────────────────────────
# Output Schemas
# ─────────────────────────────────────────────────────────────

class DeviceResponse(BaseModel):
    """
    Full serialisation of a device record for API responses.
    Supports ORM-mode loading from the Device SQLAlchemy model.
    """
    model_config = ConfigDict(from_attributes=True)

    id: str
    child_id: Optional[str] = None

    # Hardware
    device_name: str
    device_type: str
    serial_number: str
    firmware_version: Optional[str] = None

    # Telemetry
    battery_level: int
    is_low_battery: bool = False     # computed from battery_level <= 20
    is_active: bool
    is_online: bool

    # Timestamps
    last_ping_at: Optional[datetime] = None
    created_at: datetime


class DeviceTelemetrySummary(BaseModel):
    """
    Lightweight battery and connectivity snapshot for dashboard widgets.
    """
    device_id: str
    serial_number: str
    child_id: Optional[str] = None
    child_name: Optional[str] = None
    battery_level: int
    is_low_battery: bool
    is_online: bool
    last_ping_at: Optional[datetime] = None
    minutes_since_last_ping: Optional[float] = None


class DeviceListResponse(BaseModel):
    """
    Paginated list of devices returned for a given query.
    """
    total: int
    devices: List[DeviceResponse]


class DeviceHeartbeatResponse(BaseModel):
    """
    Server-side acknowledgment of a heartbeat ping.
    """
    accepted: bool
    device_id: str
    serial_number: str
    battery_level: Optional[int] = None
    is_low_battery: bool
    location_ingested: bool = False
    events_triggered: List[str] = []
    triggered_events: List[str] = []   # IDs of safety events fired from this ping
    message: Optional[str] = None
