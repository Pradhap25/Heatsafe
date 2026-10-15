from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.facility import FacilityCategory, VerificationStatus


class FacilityCreate(BaseModel):
    name: str
    category: FacilityCategory = FacilityCategory.DRINKING_WATER
    latitude: float
    longitude: float
    address: Optional[str] = None
    city: str = "Chennai"
    state: str = "Tamil Nadu"
    opening_hours: str = "24/7"
    is_free: bool = True
    has_chilled_water: bool = False
    has_seating: bool = True
    accessibility_notes: Optional[str] = None
    notes: Optional[str] = None


class FacilityResponse(BaseModel):
    id: int
    name: str
    category: FacilityCategory
    latitude: float
    longitude: float
    address: Optional[str]
    city: str
    state: str
    postal_code: Optional[str]
    source: str
    verification_status: VerificationStatus
    last_verified_at: Optional[datetime]
    opening_hours: str
    is_free: bool
    has_chilled_water: bool
    has_seating: bool
    accessibility_notes: Optional[str]
    notes: Optional[str]
    distance_km: Optional[float] = None
    directions_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class FacilityReportCreate(BaseModel):
    facility_id: int
    report_type: str  # functional, broken, dry, unavailable, inaccurate
    description: Optional[str] = None


class FacilityReportResponse(BaseModel):
    id: int
    facility_id: int
    reporter_id: Optional[int]
    report_type: str
    description: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FacilityVerificationUpdate(BaseModel):
    verification_status: VerificationStatus
    notes: Optional[str] = None
