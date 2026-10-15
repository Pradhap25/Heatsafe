from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    organisation_id = Column(Integer, ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False)
    worksite_id = Column(Integer, ForeignKey("worksites.id", ondelete="CASCADE"), nullable=True)
    reported_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    incident_type = Column(String(100), nullable=False)  # heat_exhaustion, heat_cramps, dizziness, near_miss, heat_rash
    severity = Column(String(50), default="moderate")  # minor, moderate, severe_emergency
    worker_role = Column(String(100), nullable=True)  # mason, helper, driver, field_worker
    symptoms = Column(Text, nullable=False)
    actions_taken = Column(Text, nullable=False)
    first_aid_administered = Column(Boolean, default=True)
    medical_referral = Column(Boolean, default=False)
    occurred_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String(50), default="open")  # open, reviewed, closed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organisation = relationship("Organisation", back_populates="incidents")
    worksite = relationship("Worksite", back_populates="incidents")


class SafetyGuidance(Base):
    __tablename__ = "safety_guidance"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False)  # emergency, symptoms, precautions, hydration, workplace_guidelines
    title_en = Column(String(255), nullable=False)
    title_ta = Column(String(255), nullable=False)
    content_en = Column(Text, nullable=False)
    content_ta = Column(Text, nullable=False)
    source_reference = Column(String(255), nullable=False)  # NDMA India, WHO, OSHA, Tamil Nadu State Disaster Management
    is_emergency_flag = Column(Boolean, default=False)
    priority = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    actor_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)
    target_type = Column(String(100), nullable=False)
    target_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
