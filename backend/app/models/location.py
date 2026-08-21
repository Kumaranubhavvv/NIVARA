import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Tuple, Optional
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.config.database import Base


class Location(Base):
    """
    SQLAlchemy ORM Model representing a GPS Coordinate Ping in NIVARA.
    Indexed on (child_id, created_at) for high-performance chronological queries,
    breadcrumb trails, and animated route playback.
    """
    __tablename__ = "locations"
    __table_args__ = (
        Index("idx_child_created_at", "child_id", "created_at"),
        {"extend_existing": True}
    )

    # Primary Identifier: loc-xxxxxxxx
    id = Column(String, primary_key=True, default=lambda: f"loc-{uuid.uuid4().hex[:8]}")
    child_id = Column(String, ForeignKey("children.id"), nullable=False, index=True)
    device_id = Column(String, ForeignKey("devices.id"), nullable=True, index=True)

    # GPS Coordinates
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    # Telemetry & Kinematics
    accuracy = Column(Float, default=5.0)    # accuracy radius in metres
    altitude = Column(Float, nullable=True)  # metres above sea level
    speed = Column(Float, default=0.0)       # speed in m/s
    heading = Column(Float, default=0.0)     # compass heading in degrees [0, 360)
    battery_level = Column(Float, nullable=True)
    address = Column(String, nullable=True)

    # Timestamps
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # ORM Relationships
    child = relationship("Child", back_populates="locations")
    device = relationship("Device", back_populates="locations")

    @property
    def coordinates(self) -> Tuple[float, float]:
        """Returns (latitude, longitude) as a tuple."""
        return (self.latitude, self.longitude)

    def to_dict(self) -> Dict[str, Any]:
        """Serializes Location record to dictionary."""
        return {
            "id": self.id,
            "child_id": self.child_id,
            "device_id": self.device_id,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "accuracy": self.accuracy,
            "altitude": self.altitude,
            "speed": self.speed,
            "heading": self.heading,
            "battery_level": self.battery_level,
            "address": self.address,
            "recorded_at": self.recorded_at.isoformat() if self.recorded_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
