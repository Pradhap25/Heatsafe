from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class WorksiteCreate(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    work_type: str = "Construction"
    worker_count: int = 10
    has_shaded_rest_area: bool = True
    has_potable_water: bool = True
    has_electrolytes: bool = False
    has_first_aid_kit: bool = True
    safety_lead_name: Optional[str] = None
    safety_lead_phone: Optional[str] = None


class WorksiteResponse(BaseModel):
    id: int
    organisation_id: int
    name: str
    address: str
    latitude: float
    longitude: float
    work_type: str
    worker_count: int
    has_shaded_rest_area: bool
    has_potable_water: bool
    has_electrolytes: bool
    has_first_aid_kit: bool
    safety_lead_name: Optional[str]
    safety_lead_phone: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrganisationCreate(BaseModel):
    name: str
    registration_code: str
    sector: str = "Construction"
    contact_email: str
    contact_phone: Optional[str] = None


class OrganisationResponse(BaseModel):
    id: int
    name: str
    registration_code: str
    sector: str
    contact_email: str
    contact_phone: Optional[str]
    created_at: datetime
    worksites: List[WorksiteResponse] = []

    model_config = ConfigDict(from_attributes=True)


class IncidentCreate(BaseModel):
    worksite_id: Optional[int] = None
    incident_type: str
    severity: str = "moderate"
    worker_role: Optional[str] = "Worker"
    symptoms: str
    actions_taken: str
    first_aid_administered: bool = True
    medical_referral: bool = False


class IncidentResponse(BaseModel):
    id: int
    organisation_id: int
    worksite_id: Optional[int]
    reported_by_id: Optional[int]
    incident_type: str
    severity: str
    worker_role: Optional[str]
    symptoms: str
    actions_taken: str
    first_aid_administered: bool
    medical_referral: bool
    occurred_at: datetime
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EmployerDashboardSummary(BaseModel):
    organisation: OrganisationResponse
    total_worksites: int
    total_workers_monitored: int
    active_heat_alerts_count: int
    open_incidents_count: int
    worksites_with_shade_coverage_pct: float
    worksites_with_water_access_pct: float
    safety_compliance_score: float
    recent_incidents: List[IncidentResponse]
