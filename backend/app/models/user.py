import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.config.database import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"extend_existing": True}

    id = Column(String, primary_key=True, default=lambda: f"user-{uuid.uuid4().hex[:8]}")
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="caregiver")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    caregiver_profile = relationship("Caregiver", back_populates="user", uselist=False, cascade="all, delete-orphan")
    children = relationship("Child", back_populates="caregiver", cascade="all, delete-orphan")
    emergency_contacts = relationship("EmergencyContact", back_populates="user", cascade="all, delete-orphan")

class Caregiver(Base):
    __tablename__ = "caregivers"
    __table_args__ = {"extend_existing": True}

    id = Column(String, primary_key=True, default=lambda: f"cg-{uuid.uuid4().hex[:8]}")
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    bio = Column(String, nullable=True, default="Parent caregiver")
    avatar_url = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    verification_status = Column(String, default="pending")  # pending, verified, rejected
    is_online = Column(Boolean, default=False)
    last_seen = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="caregiver_profile")
