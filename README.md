# CyberSafe Africa

Cybersecurity awareness platform for African learners — client-side safety checkers, POPIA incident reporting, AI-assisted threat analysis, and an admin threat dashboard.

## Stack

- **Frontend:** React 18 + Vite + Tailwind + Socket.IO client
- **Backend:** Express + MongoDB + JWT admin auth + OpenAI (optional) + Socket.IO

## Quick start

### Backend

```bash
cd backend
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, optional OPENAI_API_KEY
npm install
npm run dev            # http://localhost:5001
```

Bootstrap the first admin (allowed when no admins exist yet):

```bash
curl -X POST http://localhost:5001/api/admin/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Admin\",\"email\":\"admin@example.com\",\"password\":\"your-secure-password\"}"
```

Later registrations require `ADMIN_REGISTER_SECRET` in `.env` and header `X-Admin-Register-Secret`.

### Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173 (proxies /api → :5001)
```

Optional env (`frontend/.env`):

```
VITE_API_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001
```

## Features

| Feature | Notes |
|---------|--------|
| Scam Message Checker | Browser-only heuristics (SA banks, SARS, WhatsApp, USSD) |
| Link Checker | Typosquat / shortener / trusted SA domain checks |
| Password Checker | Entropy scoring; password never leaves the browser |
| Wi‑Fi / Connection Checker | Local checklist + browser signals |
| Incident Report | PDF + EmailJS alerts for high/critical POPIA cases |
| Chat assistant | `POST /api/chat` with OpenAI + local knowledge fallback |
| Admin dashboard | Live Socket.IO threats, AI insights, status updates |

## Security notes

- Do **not** commit real `.env` secrets. Rotate any keys that were previously committed.
- Dashboard and AI insight routes require an admin JWT.
- Public write endpoints (`POST /api/incidents`, `/api/activity`, `/api/chat`) are rate-limited.
