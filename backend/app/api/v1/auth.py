from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User, UserPreference, UserRole
from app.models.audit import AuditLog
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    Token,
    UserResponse,
    UserProfileUpdate
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if email exists
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )

    # Create new user
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        email=user_in.email.lower(),
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        role=user_in.role,
        workplace_or_org=user_in.workplace_or_org,
        preferred_language=user_in.preferred_language,
        is_active=True,
        is_verified=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create default preferences
    pref = UserPreference(
        user_id=user.id,
        high_heat_alerts=True,
        browser_notifications=True,
        reminder_interval_mins=45
    )
    db.add(pref)

    # Audit log
    audit = AuditLog(
        actor_id=user.id,
        actor_email=user.email,
        action="user_registered",
        target_type="user",
        target_id=str(user.id),
        details=f"Registered with role {user.role}"
    )
    db.add(audit)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )

    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.patch("/me", response_model=UserResponse)
def update_profile(
    profile_in: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name
    if profile_in.workplace_or_org is not None:
        current_user.workplace_or_org = profile_in.workplace_or_org
    if profile_in.preferred_language is not None:
        current_user.preferred_language = profile_in.preferred_language

    if profile_in.preferences is not None:
        if not current_user.preferences:
            current_user.preferences = UserPreference(user_id=current_user.id)
        current_user.preferences.high_heat_alerts = profile_in.preferences.high_heat_alerts
        current_user.preferences.browser_notifications = profile_in.preferences.browser_notifications
        current_user.preferences.audio_alerts = profile_in.preferences.audio_alerts
        current_user.preferences.reminder_interval_mins = profile_in.preferences.reminder_interval_mins
        current_user.preferences.quiet_hours_enabled = profile_in.preferences.quiet_hours_enabled
        current_user.preferences.quiet_hours_start = profile_in.preferences.quiet_hours_start
        current_user.preferences.quiet_hours_end = profile_in.preferences.quiet_hours_end
        if profile_in.preferences.manual_location_lat:
            current_user.preferences.manual_location_lat = profile_in.preferences.manual_location_lat
            current_user.preferences.manual_location_lon = profile_in.preferences.manual_location_lon
            current_user.preferences.manual_location_name = profile_in.preferences.manual_location_name

    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)
