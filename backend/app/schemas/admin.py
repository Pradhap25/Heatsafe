from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.user import UserRole


class AdminStatsResponse(BaseModel):
    total_users: int
    total_organisations: int
    total_worksites: int
    total_facilities: int
    verified_facilities: int
    pending_reports_count: int
    total_incidents_recorded: int
    system_health_status: str
    uptime_seconds: float
    active_weather_cache_entries: int


class AuditLogResponse(BaseModel):
    id: int
    actor_id: Optional[int]
    actor_email: Optional[str]
    action: str
    target_type: str
    target_id: Optional[str]
    details: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserRoleUpdate(BaseModel):
    role: UserRole
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
