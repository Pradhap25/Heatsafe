from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Organisation(Base):
    __tablename__ = "organisations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    registration_code = Column(String(100), unique=True, index=True, nullable=False)
    sector = Column(String(100), default="Construction")  # Construction, Agriculture, Logistics, Municipal
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    members = relationship("OrganisationMember", back_populates="organisation", cascade="all, delete-orphan")
    worksites = relationship("Worksite", back_populates="organisation", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="organisation", cascade="all, delete-orphan")


class OrganisationMember(Base):
    __tablename__ = "organisation_members"

    id = Column(Integer, primary_key=True, index=True)
    organisation_id = Column(Integer, ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    member_role = Column(String(50), default="worker")  # supervisor, safety_officer, worker
    joined_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organisation = relationship("Organisation", back_populates="members")
    user = relationship("User", back_populates="org_memberships")


class Worksite(Base):
    __tablename__ = "worksites"

    id = Column(Integer, primary_key=True, index=True)
    organisation_id = Column(Integer, ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    address = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    work_type = Column(String(100), default="Construction")
    worker_count = Column(Integer, default=10)
    has_shaded_rest_area = Column(Boolean, default=True)
    has_potable_water = Column(Boolean, default=True)
    has_electrolytes = Column(Boolean, default=False)
    has_first_aid_kit = Column(Boolean, default=True)
    safety_lead_name = Column(String(255), nullable=True)
    safety_lead_phone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organisation = relationship("Organisation", back_populates="worksites")
    incidents = relationship("Incident", back_populates="worksite")
