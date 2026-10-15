from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class HydrationReminderCreate(BaseModel):
    title: str = "Hydration & Rest Break"
    interval_minutes: int = 45
    activity_context: str = "moderate_outdoor"
    target_sip_ml: int = 250
    is_active: bool = True


class HydrationReminderUpdate(BaseModel):
    title: Optional[str] = None
    interval_minutes: Optional[int] = None
    activity_context: Optional[str] = None
    target_sip_ml: Optional[int] = None
    is_active: Optional[bool] = None


class ReminderEventAcknowledge(BaseModel):
    reminder_id: Optional[int] = None
    amount_ml: int = 250
    user_notes: Optional[str] = None


class ReminderEventResponse(BaseModel):
    id: int
    reminder_id: Optional[int]
    user_id: int
    scheduled_at: datetime
    acknowledged_at: Optional[datetime]
    amount_ml: int
    status: str
    user_notes: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class HydrationReminderResponse(BaseModel):
    id: int
    user_id: int
    title: str
    interval_minutes: int
    activity_context: str
    target_sip_ml: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HydrationSummary(BaseModel):
    total_intake_today_ml: int
    acknowledgements_count: int
    last_intake_time: Optional[str]
    reminders_active: bool
    next_reminder_due_in_mins: Optional[int]
    hydration_guidance_en: str
    hydration_guidance_ta: str
    medical_fluid_disclaimer: str
