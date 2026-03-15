# AI Health Report Analyzer

AI Health Report Analyzer is an AI-powered healthcare report analysis platform that helps users upload medical reports, extract clinical values, analyze health data, and receive AI-driven insights in a safe, educational format.

The project combines OCR, structured lab extraction, AI-assisted report interpretation, symptom guidance, prescription explanation, longitudinal health tracking, and production-ready infrastructure for a SaaS-style deployment.

Important disclaimer:
This platform provides informational health insights only and is not a medical diagnosis. Please consult a licensed doctor.

## Overview

The platform is designed for users who want to digitize and understand medical reports more easily. It supports account creation, secure uploads, OCR-based extraction from PDF and image reports, AI-powered analysis, health dashboards, prescription review, chat assistance, and symptom exploration.

The system is built as a full-stack web application with a React frontend, Express backend, MongoDB persistence, Redis-based background infrastructure, and optional third-party integrations for AI, file storage, and email delivery.

## Features

- OCR-based medical report extraction
- AI-powered report analysis
- symptom checker
- AI health chat assistant
- prescription analyzer
- health risk scoring
- health trend dashboard
- secure report sharing
- PDF health summary export
- Redis caching and background jobs

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- react-i18next
- Recharts
- react-pdf

### Backend

- Node.js
- Express
- Mongoose
- JWT authentication with HttpOnly cookies
- Multer
- Tesseract OCR
- Zod validation
- Pino logging

### Infrastructure

- MongoDB
- Redis
- BullMQ
- Cloudinary
- Docker
- GitHub Actions CI/CD
- Prometheus metrics
- Nginx

### AI Layer

- LLM-based analysis
- medical knowledge retrieval
- vector-style context search for health guidance

## Architecture

System flow:

User -> React Frontend -> Express API -> Services Layer -> MongoDB / Redis / AI / Cloudinary

Detailed runtime architecture:

```text
Frontend (React + Vite)
  ↓
Nginx / API Gateway
  ↓
Express Backend
  ↓
Services Layer
  • AI Provider
  • Redis Cache
  • Queue Workers
  • OCR Processing
  • Cloudinary Storage
  • Email Service
  ↓
MongoDB
```

Background processing:

- report uploads can be processed inline or queued
- Redis stores cached AI responses
- BullMQ handles heavy jobs such as report analysis and prescription processing
- worker processes consume jobs independently from the web server

## Repository Structure

```text
.
├── .github/workflows/ci.yml
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── data/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── tests/
│   ├── utils/
│   ├── Dockerfile
│   ├── server.js
│   └── worker.js
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── package.json
└── README.md
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/<username>/ai-health-report-analyzer.git
cd ai-health-report-analyzer
```

### 2. Install dependencies

```bash
npm install
npm run install:all
```

### 3. Configure environment files

Create local env files from the templates:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Then update the values based on your local setup.

### 4. Run the backend

```bash
npm run backend
```

### 5. Run the frontend

```bash
npm run frontend
```

The app will be available at:

- frontend: `http://localhost:5173`
- backend API: `http://localhost:5000`

If you enable Redis queues locally, start the worker too:

```bash
npm run worker
```

## Docker Deployment

Run the full stack with Docker Compose:

```bash
docker compose up --build
```

Included services:

- frontend
- backend
- MongoDB
- Redis
- worker

The frontend will be available at:

- `http://localhost:8080`

The backend is proxied through Nginx at:

- `http://localhost:8080/api`

Stop the containers with:

```bash
docker compose down
```

## Environment Variables

### Backend

Required or commonly used backend variables:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai-health-report-analyzer
JWT_SECRET=replace-with-a-long-random-secret
SHARE_LINK_SECRET=replace-with-a-separate-share-secret
CLIENT_URL=http://localhost:5173
APP_URL=http://localhost:5173

LOG_LEVEL=info
REQUEST_BODY_LIMIT=1mb
UPLOAD_MAX_FILE_SIZE_BYTES=10485760
CREATE_INDEXES_ON_STARTUP=true

ENABLE_METRICS=false
METRICS_USERNAME=
METRICS_PASSWORD=

AI_PROVIDER=local
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=
LLM_MODEL=gpt-4o-mini

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

REDIS_URL=redis://localhost:6379
REDIS_ENABLED=false
QUEUE_ENABLED=false
QUEUE_CONCURRENCY=2
ASYNC_REPORT_PROCESSING=false

ENABLE_MALWARE_SCAN=false
ANTIVIRUS_SCAN_COMMAND=

SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=AI Doctor <noreply@example.com>
```

### Frontend

```env
VITE_API_URL=http://localhost:5000/api
```

## CI/CD Pipeline

GitHub Actions workflow file:

- `.github/workflows/ci.yml`

Pipeline stages:

1. install dependencies
2. run lint
3. run backend tests
4. run frontend tests
5. build frontend production bundle
6. build Docker images

The pipeline fails automatically if linting, tests, or builds fail.

## Monitoring and Observability

The backend includes:

- structured JSON logging with Pino
- request IDs for traceability
- health endpoints
- Prometheus metrics
- request latency metrics
- AI latency metrics
- OCR latency metrics
- queue job metrics
- application error counters
- external service failure counters

Metrics endpoint:

- `/metrics`

Health endpoint:

- `/health`

Swagger docs:

- `/api/docs`

## Screenshots

Add screenshots here after publishing:

### Dashboard

`docs/screenshots/dashboard.png`

### Report Analysis

`docs/screenshots/report-analysis.png`

### Symptom Checker

`docs/screenshots/symptom-checker.png`

### Chat Assistant

`docs/screenshots/chat-assistant.png`

## Security Notes

- `.env` files are ignored and should never be committed
- auth uses HttpOnly cookies
- secure cookie settings are enabled for production
- request and upload limits are enforced
- rate limiting is enabled on sensitive endpoints
- input sanitization is applied on incoming requests
- metrics are gated and not exposed through the frontend proxy

## Troubleshooting

- If the backend says `EADDRINUSE`, another process is already using the port.
- If AI responses fall back locally, check `AI_PROVIDER`, `LLM_API_KEY`, `LLM_BASE_URL`, and `LLM_MODEL`.
- If queues do not start, verify Redis is installed and `REDIS_ENABLED=true`.
- If password reset email fails, verify SMTP credentials and provider policy.
- If uploads fail, verify Cloudinary credentials and allowed file types.

## License

This project is licensed under the MIT License.
"# AI_Doctor" 
