import pytest
from app.services.heat_risk_engine import HeatRiskEngine
from app.services.assistant_service import AssistantService


def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "disclaimer" in data


def test_user_registration_and_login(client):
    # Register worker
    reg_payload = {
        "email": "chennai_worker@example.com",
        "password": "Password123!",
        "full_name": "Ravi Kumar",
        "role": "worker",
        "workplace_or_org": "Metro Construction Site",
        "preferred_language": "ta"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "chennai_worker@example.com"
    assert data["user"]["preferred_language"] == "ta"

    # Duplicate registration should fail
    dup_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_res.status_code == 400

    # Login
    login_payload = {
        "email": "chennai_worker@example.com",
        "password": "Password123!"
    }
    l_res = client.post("/api/v1/auth/login", json=login_payload)
    assert l_res.status_code == 200
    token = l_res.json()["access_token"]

    # Read me
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["full_name"] == "Ravi Kumar"


def test_heat_risk_engine_deterministic_calculations():
    # 1. Mild temperature (25°C, 50% RH)
    res_low = HeatRiskEngine.evaluate_heat_risk(
        air_temperature_c=25.0,
        relative_humidity_pct=50.0,
        wind_speed_kmh=10.0,
        solar_radiation_wm2=None,
        activity_category="general_public"
    )
    assert res_low.risk_level_code == 1
    assert "Low" in res_low.risk_category
    # WBGT should be explicitly unavailable because solar radiation is None
    assert res_low.wbgt_is_available is False
    assert "unavailable" in res_low.wbgt_method.lower()

    # 2. High heat conditions (38°C, 65% RH) with live solar radiation
    res_high = HeatRiskEngine.evaluate_heat_risk(
        air_temperature_c=38.0,
        relative_humidity_pct=65.0,
        wind_speed_kmh=8.0,
        solar_radiation_wm2=750.0,
        activity_category="outdoor_worker"
    )
    assert res_high.risk_level_code in [4, 5]
    assert res_high.wbgt_is_available is True
    assert res_high.wbgt_estimated_c is not None
    assert res_high.work_rest_cycle.rest_minutes_per_hour >= 30
    assert len(res_high.precautions_ta) > 0
    assert len(res_high.precautions_en) > 0
    assert "medical" in res_high.medical_disclaimer.lower()


def test_heat_risk_api_endpoint(client):
    res = client.get("/api/v1/heat-risk?latitude=13.0827&longitude=80.2707&activity_category=construction")
    assert res.status_code in [200, 503]
    if res.status_code == 200:
        data = res.json()
        assert "air_temperature_c" in data
        assert "risk_category" in data
        assert "work_rest_cycle" in data
        assert "medical_disclaimer" in data


def test_hydration_reminders_and_acknowledgement(client):
    # Login worker
    l_res = client.post("/api/v1/auth/login", json={"email": "worker@heatsafe.ai", "password": "WorkerSafe@2026"})
    assert l_res.status_code == 200
    token = l_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get reminders
    rem_res = client.get("/api/v1/hydration/reminders", headers=headers)
    assert rem_res.status_code == 200
    reminders = rem_res.json()
    assert len(reminders) >= 1
    rem_id = reminders[0]["id"]

    # Acknowledge reminder
    ack_res = client.post(
        f"/api/v1/hydration/reminders/{rem_id}/acknowledge",
        json={"amount_ml": 300, "user_notes": "Drank cool water from site kiosk"},
        headers=headers
    )
    assert ack_res.status_code == 200
    assert ack_res.json()["amount_ml"] == 300

    # Summary
    sum_res = client.get("/api/v1/hydration/summary", headers=headers)
    assert sum_res.status_code == 200
    summary = sum_res.json()
    assert summary["total_intake_today_ml"] >= 300
    assert "fluid guidelines" in summary["medical_fluid_disclaimer"].lower()


def test_nearby_facilities_and_reporting(client):
    res = client.get("/api/v1/facilities/nearby?latitude=13.0827&longitude=80.2755&radius_km=30")
    assert res.status_code == 200
    facilities = res.json()
    assert len(facilities) > 0
    first_fac = facilities[0]
    assert "name" in first_fac
    assert "verification_status" in first_fac
    assert first_fac["distance_km"] is not None

    # Post facility report as authenticated user
    l_res = client.post("/api/v1/auth/login", json={"email": "worker@heatsafe.ai", "password": "WorkerSafe@2026"})
    token = l_res.json()["access_token"]
    report_res = client.post(
        "/api/v1/facilities/reports",
        json={
            "facility_id": first_fac["id"],
            "report_type": "verified_working",
            "description": "Cold potable water running smoothly"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert report_res.status_code == 201


def test_voice_assistant_bilingual_and_emergency(client):
    # 1. Normal question in English
    q1 = client.post(
        "/api/v1/assistant/message",
        json={"message": "What should I do during high heat exposure outdoors?", "language": "en"}
    )
    assert q1.status_code == 200
    ans1 = q1.json()
    assert ans1["is_emergency"] is False
    assert len(ans1["sources"]) > 0
    assert "shade" in ans1["reply_text"].lower() or "water" in ans1["reply_text"].lower()

    # 2. Normal question in Tamil
    q2 = client.post(
        "/api/v1/assistant/message",
        json={"message": "வெளியில் அதிக வெயில் இருக்கிறது. நான் என்ன செய்ய வேண்டும்?", "language": "ta"}
    )
    assert q2.status_code == 200
    ans2 = q2.json()
    assert ans2["is_emergency"] is False
    assert ans2["detected_language"] == "ta"
    assert "நிழல்" in ans2["reply_text"] or "குடிநீர்" in ans2["reply_text"]

    # 3. CRITICAL EMERGENCY TRIAGE (English)
    q_em_en = client.post(
        "/api/v1/assistant/message",
        json={"message": "Worker collapsed and had a seizure on the pavement!", "language": "en"}
    )
    assert q_em_en.status_code == 200
    ans_em_en = q_em_en.json()
    assert ans_em_en["is_emergency"] is True
    assert "108" in ans_em_en["emergency_contact"]
    assert len(ans_em_en["emergency_immediate_steps"]) > 0

    # 4. CRITICAL EMERGENCY TRIAGE (Tamil)
    q_em_ta = client.post(
        "/api/v1/assistant/message",
        json={"message": "பணியாளர் மயக்கம் அடைந்து கீழே விழுந்துவிட்டார்", "language": "ta"}
    )
    assert q_em_ta.status_code == 200
    ans_em_ta = q_em_ta.json()
    assert ans_em_ta["is_emergency"] is True
    assert "108" in ans_em_ta["emergency_contact"]


def test_role_based_access_control(client):
    # 1. Worker trying to access Employer worksites should be denied (403)
    worker_login = client.post("/api/v1/auth/login", json={"email": "worker@heatsafe.ai", "password": "WorkerSafe@2026"})
    worker_token = worker_login.json()["access_token"]
    res_worker = client.get("/api/v1/organisations/1/worksites", headers={"Authorization": f"Bearer {worker_token}"})
    assert res_worker.status_code == 403

    # 2. Worker trying to access Admin stats should be denied (403)
    res_admin_forbidden = client.get("/api/v1/admin/stats", headers={"Authorization": f"Bearer {worker_token}"})
    assert res_admin_forbidden.status_code == 403

    # 3. Employer accessing Employer dashboard should succeed (200)
    emp_login = client.post("/api/v1/auth/login", json={"email": "supervisor@chennaibuild.com", "password": "Supervisor@2026"})
    emp_token = emp_login.json()["access_token"]
    res_emp = client.get("/api/v1/organisations/1/dashboard", headers={"Authorization": f"Bearer {emp_token}"})
    assert res_emp.status_code == 200
    assert "total_worksites" in res_emp.json()

    # 4. Admin accessing Admin stats should succeed (200)
    admin_login = client.post("/api/v1/auth/login", json={"email": "admin@heatsafe.ai", "password": "AdminSafety@2026"})
    admin_token = admin_login.json()["access_token"]
    res_admin = client.get("/api/v1/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_admin.status_code == 200
    assert res_admin.json()["system_health_status"].startswith("Operational")
