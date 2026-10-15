from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class HydrationReminder(Base):
    __tablename__ = "hydration_reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), default="Drink Water & Rest in Shade")
    interval_minutes = Column(Integer, default=45)
    is_active = Column(Boolean, default=True)
    activity_context = Column(String(100), default="moderate_outdoor")  # heavy_outdoor, moderate_outdoor, indoor, athlete
    target_sip_ml = Column(Integer, default=250)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="hydration_reminders")
    events = relationship("ReminderEvent", back_populates="reminder", cascade="all, delete-orphan")


class ReminderEvent(Base):
    __tablename__ = "reminder_events"

    id = Column(Integer, primary_key=True, index=True)
    reminder_id = Column(Integer, ForeignKey("hydration_reminders.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scheduled_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    acknowledged_at = Column(DateTime, nullable=True)
    amount_ml = Column(Integer, default=250)
    status = Column(String(50), default="acknowledged")  # acknowledged, postponed, skipped
    user_notes = Column(String(255), nullable=True)

    reminder = relationship("HydrationReminder", back_populates="events")
    user = relationship("User", back_populates="reminder_events")
