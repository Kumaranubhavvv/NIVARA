import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.config.database import Base


class Device(Base):
    """
    SQLAlchemy ORM Model representing a Hardware Wearable / GPS Band in NIVARA.
    Maintains battery telemetry, pairing to a child profile, and online status.
    """
    __tablename__ = "devices"
    __table_args__ = {"extend_existing": True}

    # Device Type Constants
    TYPE_GPS_BAND = "gps_band"
    TYPE_SMARTWATCH = "smartwatch"
    TYPE_PENDANT = "pendant"
    TYPE_SMARTPHONE = "smartphone"

    # Primary Identifier: dev-xxxxxxxx
    id = Column(String, primary_key=True, default=lambda: f"dev-{uuid.uuid4().hex[:8]}")
    child_id = Column(String, ForeignKey("children.id"), nullable=True, index=True)

    # Hardware Specifications
    device_name = Column(String, nullable=False, default="GPS Safety Band")
    device_type = Column(String, default="gps_band")  # gps_band, smartwatch, pendant, smartphone
    serial_number = Column(String, unique=True, index=True, nullable=False)

    # Telemetry & Status
    battery_level = Column(Integer, default=100)  # 0 - 100 percentage
    is_active = Column(Boolean, default=True)
    is_online = Column(Boolean, default=True)
    firmware_version = Column(String, default="v1.2.0")

    # Timestamps
    last_ping_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # ORM Relationships
    child = relationship("Child", back_populates="devices")
    locations = relationship("Location", back_populates="device", cascade="all, delete-orphan")

    @property
    def is_low_battery(self) -> bool:
        """Returns True if battery is below or equal to the critical threshold of 20%."""
        return self.battery_level is not None and self.battery_level <= 20

    def to_dict(self) -> Dict[str, Any]:
        """Serializes Device record to dictionary."""
        return {
            "id": self.id,
            "child_id": self.child_id,
            "device_name": self.device_name,
            "device_type": self.device_type,
            "serial_number": self.serial_number,
            "battery_level": self.battery_level,
            "is_low_battery": self.is_low_battery,
            "is_active": self.is_active,
            "is_online": self.is_online,
            "firmware_version": self.firmware_version,
            "last_ping_at": self.last_ping_at.isoformat() if self.last_ping_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
