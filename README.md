# HeatSafe AI — Intelligent Heat Protection & Hydration Platform

> **A comprehensive public-health and occupational-safety web application designed for outdoor workforces exposed to extreme ambient thermal stress in Tamil Nadu, India.**

---

## 🌟 Key Capabilities & Architectural Highlights

1. **Live Heat-Safety Telemetry & Dashboard**:
   - Integrates live meteorological data from **Open-Meteo API** (under CC BY 4.0).
   - Real-time Dry Bulb Temperature, Relative Humidity, Dew Point, Wind Speed, and Solar Irradiance.
   - Built-in TTL in-memory caching and stale-observation recovery handling API outages gracefully without fabricating data.

2. **Scientific Heat Risk & WBGT Engine**:
   - Transparent, deterministic evaluation based on **NOAA / Steadman Heat Index** with Rothfusz adjustments.
   - **Wet Bulb Globe Temperature (WBGT)** estimation via Stull psychrometric natural wet bulb and Liljegren solar radiation-wind dissipation formula.
   - *Strict Product Principle*: When solar radiation flux data is unavailable, outdoor WBGT is explicitly reported as `Unavailable` rather than substituting raw ambient temperature.
   - Automatically outputs **OSHA / NIOSH Work-Rest cycles** (e.g. 45 min work / 15 min shade rest) and hydration volumes.

3. **Smart Hydration Support**:
   - Context-aware drinking water guidance adjusted to metabolic intensity (heavy construction, agriculture, delivery, general public).
   - Configurable schedules, quick one-tap drink logging (250 mL, 350 mL, 500 mL), and quiet-hours protection.
   - Medical disclaimers distinguishing atmospheric guidance from individual medical fluid restrictions.

4. **Interactive Potable Water & Rest Points**:
   - Interactive **Leaflet / OpenStreetMap** discovery engine.
   - Pre-seeded verified municipal drinking water kiosks, shaded thatched chhavnis, and heat-relief centres across **Chennai, Madurai, Coimbatore, Tiruchirappalli, Salem, and Vellore**.
   - Community reporting interface for dry taps or broken pumps, with administrator verification queue.
   - One-click Google Maps directions link with real-time distance calculations.

5. **Tamil & English Voice Safety Assistant**:
   - Accessible Web Speech API synthesis (`speechSynthesis.speak`) and recognition with text fallback.
   - **Zero-Latency Emergency Triage**: Instant deterministic detection of life-threatening heat stroke symptoms (collapse, seizures, lack of sweating, delirium) triggering immediate **108 Emergency Ambulance** protocols.
   - Curated bilingual occupational safety knowledge base retrieved from NDMA, WHO, and OSHA guidelines.

6. **Employer & Worksite Dashboard**:
   - Site-level weather tracking protecting worker privacy (no continuous individual tracking).
   - Worksite shade and potable water compliance scoring.
   - Heat illness and near-miss incident logging for proactive occupational safety interventions.

7. **State Health Administrator Console**:
   - Facility verification queue, system telemetry, cache monitors, and tamper-resistant audit logs.

---

## 🚀 Quick Start Instructions

### Prerequisites
- Python 3.11+ or 3.13
- Node.js 20.18+ or 22+
- npm 10+

### 1. Backend Setup
```bash
# In the root directory:
python -m venv venv
.\venv\Scripts\activate   # On Windows
# source venv/bin/activate # On Linux/macOS

# Install dependencies
pip install -r backend/requirements.txt

# Run automated tests
cd backend
python -m pytest tests -v

# Start the FastAPI server (runs on http://127.0.0.1:8000)
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup
```bash
# In a new terminal:
cd frontend

# Install dependencies
npm install

# Build production bundle
npm run build

# Start the Vite development server (runs on http://127.0.0.1:5173)
npm run dev
```

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Outdoor Worker** | `worker@heatsafe.ai` | `WorkerSafe@2026` | Worker Dashboard, Hydration, Facilities, Voice Assistant |
| **Site Supervisor / Employer** | `supervisor@chennaibuild.com` | `Supervisor@2026` | Employer Portal, Worksite Registration, Incident Logs |
| **Health Administrator** | `admin@heatsafe.ai` | `AdminSafety@2026` | Admin Telemetry, Facility Verification Queue, Audit Logs |

---

## 🧪 Automated Test Suite

Run the full pytest suite from `backend`:
```bash
python -m pytest tests -v
```
**Coverage includes:**
- Health check & API versioning
- User registration, JWT login, and session validation
- Deterministic Heat Index & Stull-Liljegren WBGT calculations
- Live Open-Meteo weather integration and error resilience
- Hydration reminder creation and sip acknowledgement
- Facility discovery, distance calculation, and community issue reporting
- Bilingual Tamil/English assistant and instant 108 emergency triage
- Role-based authorization boundaries (RBAC guards)

---

## 📄 License & Attribution
- Weather data provided under **CC BY 4.0** by [Open-Meteo](https://open-meteo.com).
- Map data & Cartography © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
- Health guidance curated from NDMA India, WHO, and OSHA standards.
