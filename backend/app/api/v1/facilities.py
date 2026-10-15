from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.facility import Facility, FacilityReport, VerificationStatus
from app.schemas.facility import (
    FacilityResponse,
    FacilityCreate,
    FacilityReportCreate,
    FacilityReportResponse
)
from app.services.facility_service import FacilityService, haversine_distance_km
from app.api.deps import get_current_user

router = APIRouter(prefix="/facilities", tags=["Drinking Water & Rest Facilities"])


@router.get("/nearby", response_model=List[FacilityResponse])
async def get_nearby_facilities(
    latitude: float = Query(13.0827, ge=-90, le=90),
    longitude: float = Query(80.2707, ge=-180, le=180),
    radius_km: float = Query(25.0, ge=1.0, le=100.0),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Search nearby verified drinking water kiosks, shaded rest spaces, and heat relief centers.
    Combines verified database points with OpenStreetMap community sources.
    """
    facilities = await FacilityService.get_nearby_facilities(
        db=db,
        latitude=latitude,
        longitude=longitude,
        radius_km=radius_km,
        category=category
    )
    return facilities


@router.get("/{id}", response_model=FacilityResponse)
def get_facility_by_id(
    id: int,
    user_lat: Optional[float] = Query(None),
    user_lon: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    facility = db.query(Facility).filter(Facility.id == id).first()
    if not facility:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Facility not found")

    dist = None
    if user_lat is not None and user_lon is not None:
        dist = haversine_distance_km(user_lat, user_lon, facility.latitude, facility.longitude)

    directions_url = f"https://www.google.com/maps/dir/?api=1&destination={facility.latitude},{facility.longitude}"

    return FacilityResponse(
        id=facility.id,
        name=facility.name,
        category=facility.category,
        latitude=facility.latitude,
        longitude=facility.longitude,
        address=facility.address,
        city=facility.city,
        state=facility.state,
        postal_code=facility.postal_code,
        source=facility.source,
        verification_status=facility.verification_status,
        last_verified_at=facility.last_verified_at,
        opening_hours=facility.opening_hours,
        is_free=facility.is_free,
        has_chilled_water=facility.has_chilled_water,
        has_seating=facility.has_seating,
        accessibility_notes=facility.accessibility_notes,
        notes=facility.notes,
        distance_km=dist,
        directions_url=directions_url
    )


@router.post("", response_model=FacilityResponse, status_code=status.HTTP_201_CREATED)
def report_new_facility(
    fac_in: FacilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_facility = Facility(
        name=fac_in.name,
        category=fac_in.category,
        latitude=fac_in.latitude,
        longitude=fac_in.longitude,
        address=fac_in.address,
        city=fac_in.city,
        state=fac_in.state,
        source=f"Community Report ({current_user.email})",
        verification_status=VerificationStatus.REPORTED_UNVERIFIED,
        last_verified_at=None,
        opening_hours=fac_in.opening_hours,
        is_free=fac_in.is_free,
        has_chilled_water=fac_in.has_chilled_water,
        has_seating=fac_in.has_seating,
        accessibility_notes=fac_in.accessibility_notes,
        notes=fac_in.notes
    )
    db.add(new_facility)
    db.commit()
    db.refresh(new_facility)

    directions_url = f"https://www.google.com/maps/dir/?api=1&destination={new_facility.latitude},{new_facility.longitude}"
    return FacilityResponse(
        id=new_facility.id,
        name=new_facility.name,
        category=new_facility.category,
        latitude=new_facility.latitude,
        longitude=new_facility.longitude,
        address=new_facility.address,
        city=new_facility.city,
        state=new_facility.state,
        postal_code=new_facility.postal_code,
        source=new_facility.source,
        verification_status=new_facility.verification_status,
        last_verified_at=new_facility.last_verified_at,
        opening_hours=new_facility.opening_hours,
        is_free=new_facility.is_free,
        has_chilled_water=new_facility.has_chilled_water,
        has_seating=new_facility.has_seating,
        accessibility_notes=new_facility.accessibility_notes,
        notes=new_facility.notes,
        distance_km=0.0,
        directions_url=directions_url
    )


@router.post("/reports", response_model=FacilityReportResponse, status_code=status.HTTP_201_CREATED)
def submit_facility_report(
    report_in: FacilityReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    facility = db.query(Facility).filter(Facility.id == report_in.facility_id).first()
    if not facility:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Facility not found")

    report = FacilityReport(
        facility_id=report_in.facility_id,
        reporter_id=current_user.id,
        report_type=report_in.report_type,
        description=report_in.description
    )
    db.add(report)

    # If reported as broken or dry, update status to temporarily unavailable
    if report_in.report_type in ["broken", "dry", "unavailable"]:
        facility.verification_status = VerificationStatus.TEMPORARILY_UNAVAILABLE

    db.commit()
    db.refresh(report)
    return report
