from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.user import UserRole


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.GENERAL_PUBLIC
    workplace_or_org: Optional[str] = None
    preferred_language: str = "en"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserPreferenceSchema(BaseModel):
    high_heat_alerts: bool = True
    browser_notifications: bool = True
    audio_alerts: bool = False
    reminder_interval_mins: int = 45
    quiet_hours_enabled: bool = True
    quiet_hours_start: str = "22:00"
    quiet_hours_end: str = "06:00"
    manual_location_lat: Optional[str] = None
    manual_location_lon: Optional[str] = None
    manual_location_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    workplace_or_org: Optional[str] = None
    preferred_language: str
    is_active: bool
    is_verified: bool
    preferences: Optional[UserPreferenceSchema] = None

    model_config = ConfigDict(from_attributes=True)


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    workplace_or_org: Optional[str] = None
    preferred_language: Optional[str] = None
    preferences: Optional[UserPreferenceSchema] = None


Token.model_rebuild()
