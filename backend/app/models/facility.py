import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class FacilityCategory(str, enum.Enum):
    DRINKING_WATER = "drinking_water"
    SHADED_REST = "shaded_rest"
    PUBLIC_REST_FACILITY = "public_rest_facility"
    HEAT_RELIEF_CENTRE = "heat_relief_centre"


class VerificationStatus(str, enum.Enum):
    VERIFIED = "verified"
    REPORTED_UNVERIFIED = "reported_unverified"
    TEMPORARILY_UNAVAILABLE = "temporarily_unavailable"
    CLOSED = "closed"
    UNKNOWN = "unknown"


class Facility(Base):
    __tablename__ = "facilities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(Enum(FacilityCategory), default=FacilityCategory.DRINKING_WATER, nullable=False)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    address = Column(String(500), nullable=True)
    city = Column(String(100), default="Chennai")
    state = Column(String(100), default="Tamil Nadu")
    postal_code = Column(String(20), nullable=True)
    source = Column(String(100), default="OpenStreetMap")  # OpenStreetMap, Community, Municipal
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.REPORTED_UNVERIFIED, nullable=False)
    last_verified_at = Column(DateTime, nullable=True)
    verified_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    opening_hours = Column(String(100), default="24/7")
    is_free = Column(Boolean, default=True)
    has_chilled_water = Column(Boolean, default=False)
    has_seating = Column(Boolean, default=True)
    accessibility_notes = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    reports = relationship("FacilityReport", back_populates="facility", cascade="all, delete-orphan")


class FacilityReport(Base):
    __tablename__ = "facility_reports"

    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    report_type = Column(String(50), nullable=False)  # functional, broken, dry, unavailable, location_inaccurate
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    facility = relationship("Facility", back_populates="reports")
    reporter = relationship("User", back_populates="facility_reports")
