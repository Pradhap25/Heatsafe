import time
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.organisation import Organisation, Worksite
from app.models.facility import Facility, FacilityReport, VerificationStatus
from app.models.incident import Incident, AuditLog
from app.schemas.admin import AdminStatsResponse, AuditLogResponse, UserRoleUpdate
from app.schemas.facility import FacilityReportResponse, FacilityResponse, FacilityVerificationUpdate
from app.schemas.auth import UserResponse
from app.services.weather_service import WEATHER_CACHE
from app.api.deps import get_current_admin

router = APIRouter(prefix="/admin", tags=["Administrator Management"])

APP_START_TIME = time.time()


@router.get("/stats", response_model=AdminStatsResponse)
def get_system_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    total_users = db.query(User).count()
    total_orgs = db.query(Organisation).count()
    total_sites = db.query(Worksite).count()
    total_facs = db.query(Facility).count()
    verified_facs = db.query(Facility).filter(Facility.verification_status == VerificationStatus.VERIFIED).count()
    pending_reports = db.query(FacilityReport).count()
    total_incidents = db.query(Incident).count()
    uptime = time.time() - APP_START_TIME

    return AdminStatsResponse(
        total_users=total_users,
        total_organisations=total_orgs,
        total_worksites=total_sites,
        total_facilities=total_facs,
        verified_facilities=verified_facs,
        pending_reports_count=pending_reports,
        total_incidents_recorded=total_incidents,
        system_health_status="Operational (All APIs healthy)",
        uptime_seconds=round(uptime, 1),
        active_weather_cache_entries=len(WEATHER_CACHE)
    )


@router.get("/facility-reports", response_model=List[FacilityReportResponse])
def list_facility_reports(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    return db.query(FacilityReport).order_by(FacilityReport.created_at.desc()).all()


@router.patch("/facilities/{id}/verification", response_model=FacilityResponse)
def verify_facility(
    id: int,
    ver_in: FacilityVerificationUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    facility = db.query(Facility).filter(Facility.id == id).first()
    if not facility:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Facility not found")

    facility.verification_status = ver_in.verification_status
    facility.last_verified_at = datetime.now(timezone.utc)
    facility.verified_by_user_id = current_admin.id
    if ver_in.notes:
        facility.notes = f"{facility.notes or ''}\nAdmin Note: {ver_in.notes}".strip()

    # Log audit
    audit = AuditLog(
        actor_id=current_admin.id,
        actor_email=current_admin.email,
        action="facility_verification_updated",
        target_type="facility",
        target_id=str(facility.id),
        details=f"Status set to {ver_in.verification_status}"
    )
    db.add(audit)
    db.commit()
    db.refresh(facility)

    return FacilityResponse.model_validate(facility)


@router.get("/users", response_model=List[UserResponse])
def list_all_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    return db.query(User).order_by(User.created_at.desc()).limit(100).all()


@router.patch("/users/{id}/role", response_model=UserResponse)
def update_user_role(
    id: int,
    update_in: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    target_user = db.query(User).filter(User.id == id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    target_user.role = update_in.role
    if update_in.is_active is not None:
        target_user.is_active = update_in.is_active
    if update_in.is_verified is not None:
        target_user.is_verified = update_in.is_verified

    audit = AuditLog(
        actor_id=current_admin.id,
        actor_email=current_admin.email,
        action="user_role_updated",
        target_type="user",
        target_id=str(target_user.id),
        details=f"Changed role to {update_in.role}"
    )
    db.add(audit)
    db.commit()
    db.refresh(target_user)
    return UserResponse.model_validate(target_user)


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def list_audit_logs(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
