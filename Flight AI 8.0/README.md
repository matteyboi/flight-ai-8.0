<<<<<<< HEAD
# flight-ai-8.0
=======
# Flight AI 8.0

CI status (replace with your repo details):

![CI](https://github.com/<OWNER>/<REPO>/actions/workflows/ci.yml/badge.svg)

To display a working badge replace `<OWNER>/<REPO>` with your GitHub repo path.


Run docker-compose E2E (local smoke test)

````markdown
# Flight AI 8.0

CI status (replace with your repo details):

![CI](https://github.com/<OWNER>/<REPO>/actions/workflows/ci.yml/badge.svg)

To display a working badge replace `<OWNER>/<REPO>` with your GitHub repo path.


# Flight AI 8.0

## Overview
Flight AI 8.0 is a full-stack project for flight syllabus management and AI-driven expo features. It includes:

- Backend (Python, Flask, Docker)
- Frontend (React, Vite, Playwright, Docker)
- Scripts for automation and testing
- Documentation and test suites

## Structure
- backend/: Python backend, Dockerfiles, requirements
- frontend/: React app, Vite config, Playwright tests
- scripts/: Shell scripts for setup, health checks, e2e
- tests/: Python test files
- docs/: Project documentation

## Setup
1. Create and activate Python virtual environment
2. Install backend dependencies from requirements.txt
3. Build and run Docker containers as needed
4. Install frontend dependencies and run tests

## Usage
Refer to docs/overview.md for detailed instructions.

## License
Specify license here.
```bash
python3 -m pip install -r backend/requirements.txt
python3 -m pip install pytest
```

 - Quick virtualenv setup (recommended):
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
```

 - Run backend (default port 5050):
```bash
PORT=5050 python3 backend/app.py
```

 - Serve frontend (static demo):
```bash
python3 -m http.server 8000 --directory frontend
```

Admin credentials
- By default the admin username/password are `admin`/`password`.
- For security set env vars before starting the server:
```bash
PORT=5051 python3 backend/app.py
```

 - Alternatively, set an `ADMIN_TOKEN` environment variable and use Bearer auth from the frontend or API clients:
```bash
export ADMIN_TOKEN=your_long_secret_token
PORT=5051 python3 backend/app.py
```

 - To enforce token-only admin access (disable Basic auth), set `ADMIN_TOKEN_ONLY=true` in your `.env` or environment. This is recommended for production when you distribute a single secret token to trusted admins.

Endpoints
- `GET /syllabus` — sample syllabus
- `POST /lesson` — generate lesson (JSON body: `{ "topic": "..." }`)
- `POST /progress` — record progress (JSON body with `student_id`)
 - `GET /admin/audit.csv` — export filtered audit log as CSV (Basic Auth required)
Notes
- Development server is not for production. Use a WSGI server and secure credentials in production.

Production
```bash
# from repo root
```


## Production Setup

1. Copy `.env.production.example` to `.env` and update values for your deployment:
	- Set strong `ADMIN_USER` and `ADMIN_PASS` or use `ADMIN_TOKEN` for admin access.
	- Set `ADMIN_TOKEN_ONLY=true` for token-only admin authentication.
	- Set `PRODUCTION=true` to enable strict startup checks.
	- Configure `RATELIMIT_STORAGE_URL` with your Redis URI for production-grade rate limiting.
2. Use a WSGI server (e.g., Gunicorn) for production:
	- The backend Dockerfile is pre-configured for Gunicorn and WSGI entrypoint.
3. Review security checklist below.

For more details, see `.env.production.example` and backend/README.md.

Security checklist
- **Set strong admin credentials**: replace the defaults by setting `ADMIN_USER` and `ADMIN_PASS`, or configure `ADMIN_TOKEN`.
- **If using `ADMIN_TOKEN_ONLY`**, ensure `ADMIN_TOKEN` is set before enabling.
- **Set `PRODUCTION=true`** in production environments to enable stricter startup checks.
- For production, configure a Redis-backed storage for rate limiting by setting `RATELIMIT_STORAGE_URL` or `REDIS_URL` to your Redis URI (e.g. `redis://:password@redis-host:6379/0`).
- Without this the app uses an in-memory store (not suitable for multi-instance production).

```bash
docker-compose build
docker-compose up
```

 - This exposes the backend at `http://localhost:5051` and frontend at `http://localhost:8001` by default.

Docker compose notes
- The `frontend` service expects a built frontend in `frontend/react-app/dist` to be present. Build it with:

```bash
npm install
npm run build
```

- Then start both services:

```bash
```

Run docker-compose E2E (local smoke test)

This project includes a helper script to build the frontend, start the compose stack (including Redis for rate-limiting), run Playwright E2E, and tear down the services:

```bash
# from repo root
./scripts/run_e2e_compose.sh
```

Options:
- `./scripts/run_e2e_compose.sh --keep-up` will leave the compose services running after tests.
- Ensure Docker Desktop / Docker Engine is installed and running before executing this script.


Helper scripts
- Quick docker helper: `scripts/docker_up.sh` — will run `docker compose` or `docker-compose` when available.
- Health check: `scripts/health_check.sh` — verifies `/syllabus` and `/admin/progress` endpoints.


AI API

Makefile targets
- `make test` — run pytest
- `make run-backend` — run the backend on `PORT=5051`
- `frontend/`: React web frontend
- `tests/`: Test suite
- Student progress tracking

```bash
python3 -m venv .venv
pip install --upgrade pip
pip install -r backend/requirements.txt
```
- Run backend (loads `.env` automatically):
```bash
PORT=5051 python3 backend/app.py
- Start React dev server (optional):
```bash
cd frontend/react-app
npm run dev -- --host --port 5173
```

**Admin / Usage**
- Admin can authenticate using Basic auth (`ADMIN_USER`/`ADMIN_PASS`) or a Bearer token via `ADMIN_TOKEN`.
- Example API calls:
```bash

# List progress (Bearer):
curl -H "Authorization: Bearer $ADMIN_TOKEN" "http://localhost:5051/admin/progress?limit=10"
```

If you want, I can also add a short demo script that exercises the admin UI (create lesson, post progress, list, delete). Say the word and I'll add it.

## Setup
1. Backend: Python (install dependencies in backend/)
2. Frontend: React (install dependencies in frontend/)
3. Tests: Python/JS as appropriate

## Development
- Use the copilot-instructions.md for workflow guidance.
- Replace placeholders with actual assets/data as needed.


```
