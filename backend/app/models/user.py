import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserRole(str, enum.Enum):
    WORKER = "worker"
    FARMER = "farmer"
    DELIVERY = "delivery"
    TRAFFIC_POLICE = "traffic_police"
    ATHLETE = "athlete"
    GENERAL_PUBLIC = "general_public"
    EMPLOYER = "employer"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.GENERAL_PUBLIC, nullable=False)
    workplace_or_org = Column(String(255), nullable=True)
    preferred_language = Column(String(10), default="en", nullable=False)  # 'en' or 'ta'
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    hydration_reminders = relationship("HydrationReminder", back_populates="user", cascade="all, delete-orphan")
    reminder_events = relationship("ReminderEvent", back_populates="user", cascade="all, delete-orphan")
    facility_reports = relationship("FacilityReport", back_populates="reporter")
    org_memberships = relationship("OrganisationMember", back_populates="user")


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    high_heat_alerts = Column(Boolean, default=True)
    browser_notifications = Column(Boolean, default=True)
    audio_alerts = Column(Boolean, default=False)
    reminder_interval_mins = Column(Integer, default=45)
    quiet_hours_enabled = Column(Boolean, default=True)
    quiet_hours_start = Column(String(10), default="22:00")
    quiet_hours_end = Column(String(10), default="06:00")
    manual_location_lat = Column(String(50), nullable=True)
    manual_location_lon = Column(String(50), nullable=True)
    manual_location_name = Column(String(255), nullable=True)

    user = relationship("User", back_populates="preferences")
