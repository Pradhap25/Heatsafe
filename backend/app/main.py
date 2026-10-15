from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole, UserPreference
from app.models.organisation import Organisation, OrganisationMember, Worksite
from app.services.facility_service import FacilityService

# Import routers
from app.api.v1.auth import router as auth_router
from app.api.v1.weather import router as weather_router
from app.api.v1.heat_risk import router as heat_risk_router
from app.api.v1.hydration import router as hydration_router
from app.api.v1.facilities import router as facilities_router
from app.api.v1.assistant import router as assistant_router
from app.api.v1.organisations import router as organisations_router
from app.api.v1.admin import router as admin_router


def seed_database_defaults():
    db = SessionLocal()
    try:
        # 1. Seed initial facilities across Tamil Nadu
        FacilityService.seed_initial_facilities(db)

        # 2. Seed Default Administrator if not exists
        admin = db.query(User).filter(User.email == "admin@heatsafe.ai").first()
        if not admin:
            admin = User(
                email="admin@heatsafe.ai",
                hashed_password=get_password_hash("AdminSafety@2026"),
                full_name="HeatSafe State Administrator",
                role=UserRole.ADMIN,
                workplace_or_org="Tamil Nadu Disaster Risk Mitigation",
                preferred_language="en",
                is_active=True,
                is_verified=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            pref = UserPreference(user_id=admin.id)
            db.add(pref)
            db.commit()

        # 3. Seed Demo Employer & Worksite if not exists
        employer = db.query(User).filter(User.email == "supervisor@chennaibuild.com").first()
        if not employer:
            employer = User(
                email="supervisor@chennaibuild.com",
                hashed_password=get_password_hash("Supervisor@2026"),
                full_name="Karthik Raman (Site Safety Officer)",
                role=UserRole.EMPLOYER,
                workplace_or_org="Chennai Metro Rail Construction Infra",
                preferred_language="ta",
                is_active=True,
                is_verified=True
            )
            db.add(employer)
            db.commit()
            db.refresh(employer)
            pref = UserPreference(user_id=employer.id)
            db.add(pref)
            db.commit()

            # Create default organisation
            org = Organisation(
                name="Chennai Metro Rail Construction Infra",
                registration_code="CMRL-SAFETY-01",
                sector="Infrastructure & Civil Construction",
                contact_email="safety@chennaibuild.com",
                contact_phone="+91 44 2855 0000"
            )
            db.add(org)
            db.commit()
            db.refresh(org)

            # Link employer member
            mem = OrganisationMember(
                organisation_id=org.id,
                user_id=employer.id,
                member_role="supervisor"
            )
            db.add(mem)

            # Add sample Chennai Metro worksite
            site = Worksite(
                organisation_id=org.id,
                name="CMRL Corridor 4 - Vadapalani Elevated Pier Site",
                address="Arcot Road, Vadapalani Junction, Chennai",
                latitude=13.0500,
                longitude=80.2121,
                work_type="Heavy Civil & Steel Reinforcement",
                worker_count=45,
                has_shaded_rest_area=True,
                has_potable_water=True,
                has_electrolytes=True,
                has_first_aid_kit=True,
                safety_lead_name="Karthik Raman",
                safety_lead_phone="+91 98400 12345"
            )
            db.add(site)
            db.commit()

        # 4. Seed Demo Worker if not exists
        worker = db.query(User).filter(User.email == "worker@heatsafe.ai").first()
        if not worker:
            worker = User(
                email="worker@heatsafe.ai",
                hashed_password=get_password_hash("WorkerSafe@2026"),
                full_name="Murugan Selvam",
                role=UserRole.WORKER,
                workplace_or_org="Chennai Metro Rail Construction Infra",
                preferred_language="ta",
                is_active=True,
                is_verified=True
            )
            db.add(worker)
            db.commit()
            db.refresh(worker)
            pref = UserPreference(user_id=worker.id)
            db.add(pref)
            db.commit()

    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and seed demo records
    Base.metadata.create_all(bind=engine)
    seed_database_defaults()
    yield
    # Shutdown cleanups if needed


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Heat Protection and Hydration Platform tailored for high-heat environments.",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(weather_router, prefix=settings.API_V1_STR)
app.include_router(heat_risk_router, prefix=settings.API_V1_STR)
app.include_router(hydration_router, prefix=settings.API_V1_STR)
app.include_router(facilities_router, prefix=settings.API_V1_STR)
app.include_router(assistant_router, prefix=settings.API_V1_STR)
app.include_router(organisations_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "HeatSafe AI Backend",
        "version": settings.VERSION,
        "region_primary": "Tamil Nadu, India",
        "disclaimer": "Environmental heat risk estimates do not constitute individualized clinical diagnoses."
    }


@app.get("/")
def root():
    return {
        "message": "Welcome to HeatSafe AI Platform API",
        "docs_url": "/docs",
        "version": settings.VERSION
    }
