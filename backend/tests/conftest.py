import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # Ensures all SQLAlchemy models are registered in Base.metadata
from app.core.database import Base, get_db
from app.main import app
from app.services.facility_service import FacilityService
from app.core.security import get_password_hash
from app.models.user import User, UserRole, UserPreference
from app.models.organisation import Organisation, OrganisationMember, Worksite

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def seed_test_database(db):
    # 1. Seed facilities
    FacilityService.seed_initial_facilities(db)

    # 2. Seed Admin
    admin = db.query(User).filter(User.email == "admin@heatsafe.ai").first()
    if not admin:
        admin = User(
            email="admin@heatsafe.ai",
            hashed_password=get_password_hash("AdminSafety@2026"),
            full_name="HeatSafe Administrator",
            role=UserRole.ADMIN,
            workplace_or_org="Tamil Nadu SDMA",
            preferred_language="en",
            is_active=True,
            is_verified=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        db.add(UserPreference(user_id=admin.id))
        db.commit()

    # 3. Seed Employer & Worksite
    emp = db.query(User).filter(User.email == "supervisor@chennaibuild.com").first()
    if not emp:
        emp = User(
            email="supervisor@chennaibuild.com",
            hashed_password=get_password_hash("Supervisor@2026"),
            full_name="Karthik Raman",
            role=UserRole.EMPLOYER,
            workplace_or_org="Chennai Metro Infra",
            preferred_language="ta",
            is_active=True,
            is_verified=True
        )
        db.add(emp)
        db.commit()
        db.refresh(emp)
        db.add(UserPreference(user_id=emp.id))

        org = Organisation(
            name="Chennai Metro Infra",
            registration_code="CMRL-01",
            sector="Civil Infra",
            contact_email="safety@chennaibuild.com"
        )
        db.add(org)
        db.commit()
        db.refresh(org)

        mem = OrganisationMember(
            organisation_id=org.id,
            user_id=emp.id,
            member_role="supervisor"
        )
        db.add(mem)

        site = Worksite(
            organisation_id=org.id,
            name="Vadapalani Site",
            address="Arcot Road, Chennai",
            latitude=13.05,
            longitude=80.21,
            worker_count=30
        )
        db.add(site)
        db.commit()

    # 4. Seed Worker
    worker = db.query(User).filter(User.email == "worker@heatsafe.ai").first()
    if not worker:
        worker = User(
            email="worker@heatsafe.ai",
            hashed_password=get_password_hash("WorkerSafe@2026"),
            full_name="Murugan Selvam",
            role=UserRole.WORKER,
            workplace_or_org="Chennai Metro Infra",
            preferred_language="ta",
            is_active=True,
            is_verified=True
        )
        db.add(worker)
        db.commit()
        db.refresh(worker)
        db.add(UserPreference(user_id=worker.id))
        db.commit()


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_test_database(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
