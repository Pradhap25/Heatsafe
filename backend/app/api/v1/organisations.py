from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.organisation import Organisation, OrganisationMember, Worksite
from app.models.incident import Incident
from app.schemas.organisation import (
    OrganisationCreate,
    OrganisationResponse,
    WorksiteCreate,
    WorksiteResponse,
    IncidentCreate,
    IncidentResponse,
    EmployerDashboardSummary
)
from app.api.deps import get_current_user, get_current_active_employer

router = APIRouter(prefix="/organisations", tags=["Employer & Worksite Management"])


@router.post("", response_model=OrganisationResponse, status_code=status.HTTP_201_CREATED)
def create_organisation(
    org_in: OrganisationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_employer)
):
    existing = db.query(Organisation).filter(Organisation.registration_code == org_in.registration_code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An organisation with this registration code already exists"
        )

    org = Organisation(
        name=org_in.name,
        registration_code=org_in.registration_code,
        sector=org_in.sector,
        contact_email=org_in.contact_email,
        contact_phone=org_in.contact_phone
    )
    db.add(org)
    db.commit()
    db.refresh(org)

    # Link creator as supervisor member
    member = OrganisationMember(
        organisation_id=org.id,
        user_id=current_user.id,
        member_role="supervisor"
    )
    db.add(member)
    db.commit()
    return org


@router.get("/{id}/dashboard", response_model=EmployerDashboardSummary)
def get_employer_dashboard(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_employer)
):
    org = db.query(Organisation).filter(Organisation.id == id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organisation not found")

    worksites = db.query(Worksite).filter(Worksite.organisation_id == id).all()
    incidents = db.query(Incident).filter(Incident.organisation_id == id).order_by(Incident.created_at.desc()).all()

    total_sites = len(worksites)
    total_workers = sum(w.worker_count for w in worksites)
    
    shaded_count = sum(1 for w in worksites if w.has_shaded_rest_area)
    water_count = sum(1 for w in worksites if w.has_potable_water)

    shade_pct = (shaded_count / total_sites * 100.0) if total_sites > 0 else 100.0
    water_pct = (water_count / total_sites * 100.0) if total_sites > 0 else 100.0

    compliance = round((shade_pct + water_pct) / 2.0, 1)

    return EmployerDashboardSummary(
        organisation=OrganisationResponse.model_validate(org),
        total_worksites=total_sites,
        total_workers_monitored=total_workers,
        active_heat_alerts_count=1 if total_sites > 0 else 0,
        open_incidents_count=sum(1 for i in incidents if i.status == "open"),
        worksites_with_shade_coverage_pct=round(shade_pct, 1),
        worksites_with_water_access_pct=round(water_pct, 1),
        safety_compliance_score=compliance,
        recent_incidents=[IncidentResponse.model_validate(i) for i in incidents[:10]]
    )


@router.get("/{id}/worksites", response_model=List[WorksiteResponse])
def get_worksites(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_employer)
):
    return db.query(Worksite).filter(Worksite.organisation_id == id).all()


@router.post("/{id}/worksites", response_model=WorksiteResponse, status_code=status.HTTP_201_CREATED)
def add_worksite(
    id: int,
    site_in: WorksiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_employer)
):
    org = db.query(Organisation).filter(Organisation.id == id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organisation not found")

    worksite = Worksite(
        organisation_id=id,
        name=site_in.name,
        address=site_in.address,
        latitude=site_in.latitude,
        longitude=site_in.longitude,
        work_type=site_in.work_type,
        worker_count=site_in.worker_count,
        has_shaded_rest_area=site_in.has_shaded_rest_area,
        has_potable_water=site_in.has_potable_water,
        has_electrolytes=site_in.has_electrolytes,
        has_first_aid_kit=site_in.has_first_aid_kit,
        safety_lead_name=site_in.safety_lead_name,
        safety_lead_phone=site_in.safety_lead_phone
    )
    db.add(worksite)
    db.commit()
    db.refresh(worksite)
    return worksite


@router.get("/{id}/incidents", response_model=List[IncidentResponse])
def get_organisation_incidents(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_employer)
):
    return db.query(Incident).filter(Incident.organisation_id == id).order_by(Incident.created_at.desc()).all()


@router.post("/{id}/incidents", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def report_incident(
    id: int,
    inc_in: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = Incident(
        organisation_id=id,
        worksite_id=inc_in.worksite_id,
        reported_by_id=current_user.id,
        incident_type=inc_in.incident_type,
        severity=inc_in.severity,
        worker_role=inc_in.worker_role,
        symptoms=inc_in.symptoms,
        actions_taken=inc_in.actions_taken,
        first_aid_administered=inc_in.first_aid_administered,
        medical_referral=inc_in.medical_referral,
        occurred_at=datetime.now(timezone.utc),
        status="open"
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident
