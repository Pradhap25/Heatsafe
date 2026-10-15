# HeatSafe AI — Deployment & Operations Guide

## 1. System Requirements
- **OS**: Linux (Ubuntu 22.04 LTS / Debian 12 recommended) or Windows Server
- **Python**: 3.11+ or 3.13
- **Node.js**: 20.18+ or 22+
- **Database**: PostgreSQL 15+ (Production) or SQLite 3 (Development fallback)

## 2. Local Development Setup

### Backend Setup
```bash
# 1. Create and activate virtual environment
python -m venv venv
# Linux/macOS:
source venv/bin/activate
# Windows:
.\venv\Scripts\activate

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Run automated tests
cd backend
python -m pytest tests -v

# 4. Start backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend Setup
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install packages
npm install

# 3. Start development server
npm run dev

# App runs on http://127.0.0.1:5173
```

## 3. Production Deployment with Docker & Nginx

### Dockerfile (Backend)
```dockerfile
FROM python:3.13-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ /app/
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Production Build (Frontend)
```bash
cd frontend
npm run build
# Serve dist/ using Nginx or Caddy
```

### Nginx Reverse Proxy & SSL Configuration
```nginx
server {
    listen 80;
    server_name heatsafe.example.org;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name heatsafe.example.org;

    ssl_certificate /etc/letsencrypt/live/heatsafe.example.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/heatsafe.example.org/privkey.pem;

    # Frontend static files
    location / {
        root /var/www/heatsafe/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 4. Production Health Checks
- `GET /api/health` -> Returns `{"status": "healthy", ...}`
- Automated monitoring: Configure Prometheus / Uptime Kuma to poll `/api/health` every 60 seconds.
