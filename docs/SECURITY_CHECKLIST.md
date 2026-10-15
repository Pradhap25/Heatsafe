# HeatSafe AI — Security and Privacy Checklist

## 1. Authentication & Access Control
- [x] Passwords hashed with bcrypt using high-work factor salt (`bcrypt.gensalt()`).
- [x] JWT bearer tokens with standard expiration (`ACCESS_TOKEN_EXPIRE_MINUTES`) and cryptographic signing (HS256).
- [x] Backend role-based authorization guards (`get_current_user`, `get_current_active_employer`, `get_current_admin`) enforcing access boundaries on REST endpoints.
- [x] Route protection on frontend and backend preventing role escalation.

## 2. Privacy & Worker Protection Principles
- [x] **No continuous geolocation tracking**: Geolocation permissions are explicitly requested on-demand only; users can toggle between manual district selection and device GPS.
- [x] **Aggregated worksite data**: Employer dashboard presents worksite-level thermal indices and counts without exposing personal health metrics or medical history to supervisors.
- [x] **Clear medical demarcation**: Prominent disclaimers distinguishing environmental heat stress from individual clinical hydration diagnoses.

## 3. Data Protection & Input Sanitization
- [x] Pydantic V2 data validation and email syntax verification on all inbound requests.
- [x] SQLAlchemy parameterized query compilation protecting against SQL injection vulnerabilities.
- [x] CORS middleware restricting allowed origins to authorized frontend domains.
- [x] Rate-limit and in-memory TTL caching on external weather and map APIs to prevent IP exhaustion.

## 4. Production Security Checklist Before Public Launch
- [ ] Replace default `SECRET_KEY` with a cryptographically secure 256-bit entropy string via environment variable.
- [ ] Enforce HTTPS/TLS 1.3 across all production domains using Let's Encrypt or Cloudflare SSL.
- [ ] Set `ENVIRONMENT="production"` to disable FastAPI debug endpoints and Swagger docs in public view if restricted.
- [ ] Enable PostgreSQL SSL connections (`sslmode=require`).
- [ ] Schedule automated database backups and audit log archival.
