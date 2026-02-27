# LiLy Stoica Platform - Deployment Guide

## Architecture

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Django 4.2 + Django REST Framework + SimpleJWT
- **Database**: SQLite (dev) / PostgreSQL 15 (prod)
- **AI**: Google Gemini 2.0 Flash for the virtual assistant
- **Video**: WebRTC peer-to-peer with HTTP-polling signalling
- **Email**: Resend SMTP
- **Deployment**: Docker, Nginx Proxy Manager, private registry, GitHub Actions


## Local Development

### Frontend
```bash
cd lily-stoica-platform
npm install
npm run dev        # http://localhost:8081
```

### Backend
```bash
cd lily-stoica-platform/backend
python -m venv venv
venv\Scripts\activate    # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver 8000
```


## Production Deployment

### Prerequisites on VPS
1. Docker and Docker Compose installed
2. Nginx Proxy Manager running (shared with SNF)
3. Private Docker registry running on port 5000

### GitHub Secrets Required
| Secret              | Description                          |
|---------------------|--------------------------------------|
| VPS_HOST            | Server IP or hostname                |
| VPS_USER            | SSH username                         |
| VPS_SSH_KEY         | SSH private key                      |
| REGISTRY_URL        | Private registry (e.g. localhost:5000) |

### Initial Server Setup
```bash
# On the VPS
mkdir -p /opt/lily-stoica
cd /opt/lily-stoica

# Copy docker-compose.prod.yml and .env
# Adjust .env with production values

docker compose -f docker-compose.prod.yml up -d
```

### Nginx Proxy Manager Configuration
Create a proxy host:
- **Domain**: lilystoica.com
- **Scheme**: http
- **Forward Hostname**: lily-frontend (or localhost)
- **Forward Port**: 8091
- **SSL**: Request Let's Encrypt certificate
- **Force SSL**: Yes

### DNS
Point lilystoica.com A record to the VPS IP.


## Credentials (Development)

- **Admin**: lily@lilystoica.com / admin1234
- **Client**: client@example.com / client1234
