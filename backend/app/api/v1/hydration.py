from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.hydration import HydrationReminder, ReminderEvent
from app.schemas.hydration import (
    HydrationReminderCreate,
    HydrationReminderUpdate,
    HydrationReminderResponse,
    ReminderEventAcknowledge,
    ReminderEventResponse,
    HydrationSummary
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/hydration", tags=["Hydration Support"])


@router.get("/reminders", response_model=List[HydrationReminderResponse])
def get_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reminders = db.query(HydrationReminder).filter(HydrationReminder.user_id == current_user.id).all()
    if not reminders:
        # Create a default reminder for the user if none exists
        default_rem = HydrationReminder(
            user_id=current_user.id,
            title="Drink Clean Water & Rest in Shade",
            interval_minutes=45,
            activity_context="moderate_outdoor",
            target_sip_ml=250,
            is_active=True
        )
        db.add(default_rem)
        db.commit()
        db.refresh(default_rem)
        reminders = [default_rem]
    return reminders


@router.post("/reminders", response_model=HydrationReminderResponse, status_code=status.HTTP_201_CREATED)
def create_reminder(
    reminder_in: HydrationReminderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reminder = HydrationReminder(
        user_id=current_user.id,
        title=reminder_in.title,
        interval_minutes=reminder_in.interval_minutes,
        activity_context=reminder_in.activity_context,
        target_sip_ml=reminder_in.target_sip_ml,
        is_active=reminder_in.is_active
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.patch("/reminders/{id}", response_model=HydrationReminderResponse)
def update_reminder(
    id: int,
    reminder_in: HydrationReminderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reminder = db.query(HydrationReminder).filter(
        HydrationReminder.id == id,
        HydrationReminder.user_id == current_user.id
    ).first()
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

    if reminder_in.title is not None:
        reminder.title = reminder_in.title
    if reminder_in.interval_minutes is not None:
        reminder.interval_minutes = reminder_in.interval_minutes
    if reminder_in.activity_context is not None:
        reminder.activity_context = reminder_in.activity_context
    if reminder_in.target_sip_ml is not None:
        reminder.target_sip_ml = reminder_in.target_sip_ml
    if reminder_in.is_active is not None:
        reminder.is_active = reminder_in.is_active

    db.commit()
    db.refresh(reminder)
    return reminder


@router.post("/reminders/{id}/acknowledge", response_model=ReminderEventResponse)
def acknowledge_reminder(
    id: int,
    ack_in: ReminderEventAcknowledge,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reminder = db.query(HydrationReminder).filter(
        HydrationReminder.id == id,
        HydrationReminder.user_id == current_user.id
    ).first()
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

    event = ReminderEvent(
        reminder_id=reminder.id,
        user_id=current_user.id,
        scheduled_at=datetime.now(timezone.utc),
        acknowledged_at=datetime.now(timezone.utc),
        amount_ml=ack_in.amount_ml,
        status="acknowledged",
        user_notes=ack_in.user_notes
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/summary", response_model=HydrationSummary)
def get_hydration_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    events = db.query(ReminderEvent).filter(
        ReminderEvent.user_id == current_user.id,
        ReminderEvent.status == "acknowledged"
    ).all()

    total_ml = sum(e.amount_ml for e in events)
    count = len(events)
    last_time = events[-1].acknowledged_at.strftime("%I:%M %p") if events and events[-1].acknowledged_at else None

    reminders = db.query(HydrationReminder).filter(
        HydrationReminder.user_id == current_user.id,
        HydrationReminder.is_active == True
    ).all()

    active = len(reminders) > 0
    next_due = reminders[0].interval_minutes if active else None

    return HydrationSummary(
        total_intake_today_ml=total_ml,
        acknowledgements_count=count,
        last_intake_time=last_time,
        reminders_active=active,
        next_reminder_due_in_mins=next_due,
        hydration_guidance_en="Drink approximately 250mL of clean drinking water every 20-30 minutes during high heat exposure. Do not wait until thirst occurs.",
        hydration_guidance_ta="வெப்பத்தின் போது தாகம் எடுக்கும் வரை காத்திருக்காமல், ஒவ்வொரு 20-30 நிமிடங்களுக்கும் சுமார் 250 மி.லி. சுத்தமான குடிநீர் குடிக்கவும்.",
        medical_fluid_disclaimer="Fluid guidelines are occupational estimates. Individuals with heart/renal conditions or medical fluid restrictions must adhere strictly to physician orders."
    )
