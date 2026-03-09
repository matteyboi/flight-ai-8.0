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


Local run
 - Install Python deps (system or virtualenv):
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
export ADMIN_USER=myuser
export ADMIN_PASS=strongpassword
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
- `GET /admin/progress?limit=20` — list recent progress (Basic Auth required)
- `DELETE /admin/progress/<id>` — delete an entry (Basic Auth required)

- `GET /admin/progress.csv` — export filtered progress as CSV (Basic Auth required)
 - `GET /admin/progress.csv` — export filtered progress as CSV (Basic Auth required)
 - `GET /admin/audit.csv` — export filtered audit log as CSV (Basic Auth required)

Notes
- Development server is not for production. Use a WSGI server and secure credentials in production.

Production
- Run the backend with Gunicorn in production (example):
```bash
# from repo root
PORT=5050 python3 -m gunicorn -b 0.0.0.0:5050 wsgi:application --workers 2
```

Ensure you set secure `ADMIN_USER`/`ADMIN_PASS` or use `ADMIN_TOKEN` before exposing the service.

Security checklist
- **Set strong admin credentials**: replace the defaults by setting `ADMIN_USER` and `ADMIN_PASS`, or configure `ADMIN_TOKEN`.
- **If using `ADMIN_TOKEN_ONLY`**, ensure `ADMIN_TOKEN` is set before enabling.
- **Set `PRODUCTION=true`** in production environments to enable stricter startup checks.
- **Run behind a TLS-terminating proxy** (NGINX/Cloud provider) and avoid exposing the app directly to the internet.
 - **Enable rate-limiting and security headers**: the backend includes Flask-Limiter and Flask-Talisman to add basic rate limits and HTTP security headers. Configure limits via environment or adjust in `backend/app.py`.

Rate limiter storage
- For production, configure a Redis-backed storage for rate limiting by setting `RATELIMIT_STORAGE_URL` or `REDIS_URL` to your Redis URI (e.g. `redis://:password@redis-host:6379/0`).
- Without this the app uses an in-memory store (not suitable for multi-instance production).

Docker
 - Build and run with `docker-compose`:
```bash
docker-compose build
docker-compose up
```

 - This exposes the backend at `http://localhost:5051` and frontend at `http://localhost:8000` by default.

Docker compose notes
- The `frontend` service expects a built frontend in `frontend/react-app/dist` to be present. Build it with:

```bash
cd frontend/react-app
npm install
npm run build
```

- Then start both services:

```bash
docker-compose up --build
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

CI note: GitHub Actions includes an `e2e-docker` job that invokes the same script during CI runs.


Helper scripts
- Quick docker helper: `scripts/docker_up.sh` — will run `docker compose` or `docker-compose` when available.
- Health check: `scripts/health_check.sh` — verifies `/syllabus` and `/admin/progress` endpoints.

Environment file
- Copy `.env.example` to `.env` and edit values for local development. The backend will load `.env` automatically (via `python-dotenv`).

AI API
- To enable real lesson generation set `OPENAI_API_KEY` in your `.env` (or in the environment). The server will call the OpenAI ChatCompletion API when `OPENAI_API_KEY` is present. Optionally set `OPENAI_MODEL` (default `gpt-3.5-turbo`).

Makefile targets
- `make venv` — create virtualenv and install backend deps
- `make test` — run pytest
- `make run-backend` — run the backend on `PORT=5051`
- `make docker-up` — wrapper to run `scripts/docker_up.sh`
- `make health` — run health checks

## Structure
- `backend/`: Python backend for syllabus management
- `frontend/`: React web frontend
- `tests/`: Test suite
- `docs/`: Documentation

## Features
- AI API integration for lesson generation
- Student progress tracking

**Quick Start**
- Install backend deps and create venv (recommended):
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
```
- Run backend (loads `.env` automatically):
```bash
PORT=5051 python3 backend/app.py
```
- Start React dev server (optional):
```bash
cd frontend/react-app
npm install
npm run dev -- --host --port 5173
```

**Admin / Usage**
- Admin can authenticate using Basic auth (`ADMIN_USER`/`ADMIN_PASS`) or a Bearer token via `ADMIN_TOKEN`.
- Example API calls:
```bash
# List progress (Basic):
curl -H "Authorization: Basic $(python3 -c 'import base64;print(base64.b64encode(b"admin:password").decode())')" "http://localhost:5051/admin/progress?limit=10"

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

## License
[Add your license here]

```
