# AI Health Report Analyzer

AI Health Report Analyzer is an AI-powered healthcare report analysis platform that helps users upload medical reports, extract clinical values, analyze health data, and receive AI-driven insights in a safe, educational format.

The project combines OCR, structured lab extraction, AI-assisted report interpretation, symptom guidance, prescription explanation, longitudinal health tracking, and production-ready infrastructure for a SaaS-style deployment.

Important disclaimer:
This platform provides informational health insights only and is not a medical diagnosis. Please consult a licensed doctor.

## Overview

The platform is designed for users who want to digitize and understand medical reports more easily. It supports account creation, secure uploads, OCR-based extraction from PDF and image reports, AI-powered analysis, health dashboards, prescription review, chat assistance, and symptom exploration.

The system is built as a full-stack web application with a React frontend, Express backend, MongoDB persistence, Redis-based background infrastructure, and optional third-party integrations for AI, file storage, and email delivery.

## ✨ Advanced Features

### 🔬 Dual-Model AI Analysis Pipeline
- **Async medical report pipeline** using BullMQ + Redis with dual-model AI comparison (Gemini 1.5 Flash + LLaMA 3 70B via Groq)
- **Parallel Promise.allSettled execution** with agreement scoring and divergent clinical finding detection
- Consensus-based analysis combining multiple AI models for higher accuracy and reliability

### 📊 Longitudinal Health Trend Tracking
- **10 biomarkers tracking**: glucose, cholesterol, hemoglobin, blood pressure, TSH, creatinine, WBC, HDL/LDL, and more
- **Recharts time-series visualization** with normal range shading and trend indicators
- **Automatic metric extraction** from AI analysis with deduplication and status classification (normal/low/high/critical)

### 🔒 Secure Doctor Share Links
- **64-character crypto.randomBytes tokens** for maximum security
- **QR code generation** for easy mobile access
- **MongoDB TTL auto-expiry** with configurable expiration periods
- **Capped access logging** (last 50 entries) to prevent unbounded growth
- **PII-stripped public endpoints** ensuring patient privacy

### ⚡ Real-Time WebSocket Pipeline
- **Socket.IO WebSocket pipeline** replacing traditional polling for instant updates
- **8 processing stages** with real-time push notifications (OCR, AI analysis, comparison, etc.)
- **JWT socket authentication middleware** with per-user private rooms
- **10-second polling fallback** for network reliability

### 🛡️ Production-Ready Infrastructure
- **HttpOnly JWT cookies** for secure authentication
- **503 health degradation** responses when services are unhealthy
- **Generic error responses** in production to prevent information leakage
- **Prometheus metrics** for monitoring and alerting
- **Docker + Nginx** containerization with reverse proxy
- **GitHub Actions CI/CD** with automated testing and deployment

## Features

- OCR-based medical report extraction
- AI-powered report analysis
- Symptom checker with AI guidance
- AI health chat assistant
- Prescription analyzer
- Health risk scoring
- Health trend dashboard with biomarker tracking
- Secure report sharing with doctor links
- PDF health summary export
- Redis caching and background jobs
- Real-time processing status updates
- Multi-language support (i18n)
- Responsive mobile-first design

## Tech Stack

### Frontend

- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API communication
- react-i18next for internationalization
- Recharts for data visualization
- react-pdf for document generation
- Socket.IO client for real-time updates

### Backend

- Node.js with Express
- Mongoose for MongoDB integration
- JWT authentication with HttpOnly cookies
- Multer for file uploads
- Tesseract.js for OCR processing
- Zod for runtime validation
- Pino for structured logging
- Socket.IO for WebSocket communication

### Infrastructure

- MongoDB for data persistence
- Redis for caching and queues
- BullMQ for background job processing
- Cloudinary for file storage
- Docker for containerization
- GitHub Actions for CI/CD
- Prometheus for metrics collection
- Nginx as reverse proxy

### AI Layer

- Google Gemini 1.5 Flash for primary analysis
- Groq LLaMA 3 70B for comparative analysis
- Parallel AI execution with consensus scoring
- Medical knowledge base integration
- Vector-style context search for health guidance

## Architecture

System flow:

```
User → React Frontend → Nginx → Express API → Services Layer → MongoDB/Redis/AI/Cloudinary
```

Detailed runtime architecture:

```text
Frontend (React + Vite + Socket.IO)
  ↓
Nginx Reverse Proxy + Static Serving
  ↓
Express Backend + Socket.IO Server
  ↓
Services Layer
  • AI Provider Service (Gemini + Groq)
  • Redis Cache Service
  • BullMQ Queue Workers
  • OCR Processing Service
  • Cloudinary Storage Service
  • Email Service
  • Socket Service
  ↓
MongoDB + Redis Cluster
```

Background processing pipeline:

```text
Report Upload → Queue Job → OCR Extraction → AI Analysis (Parallel) → Comparison → Storage → Real-time Notification
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Redis
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-health-report-analyzer.git
cd ai-health-report-analyzer
```

2. Install dependencies:
```bash
npm install:all
```

3. Set up environment variables (see `.env.example`)

4. Start development servers:
```bash
npm run dev
```

### Docker Deployment

```bash
docker-compose up --build
```

## API Documentation

API documentation is available at `/api/docs` when the server is running.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security

This application implements multiple security measures:
- JWT authentication with secure cookies
- Rate limiting and request validation
- Input sanitization and XSS protection
- Secure file upload handling
- Generic error responses in production
- Access logging with privacy considerations

## Disclaimer

This platform is for educational and informational purposes only. The AI analysis provided should not be considered medical advice or diagnosis. Always consult with qualified healthcare professionals for medical decisions.

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
