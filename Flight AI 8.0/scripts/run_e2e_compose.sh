#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

KEEP_UP=false
if [[ "${1-}" == "--keep-up" ]]; then
  KEEP_UP=true
fi

echo "Building frontend..."
if [ -d frontend/react-app ]; then
  (cd frontend/react-app && npm install && npm run build)
else
  echo "frontend/react-app not found" >&2
  exit 1
fi

DOCKER_AVAILABLE=false
if command -v docker >/dev/null 2>&1; then
  DOCKER_AVAILABLE=true
fi

TEST_EXIT=0
BACKEND_PID=
FRONTEND_PID=

cleanup() {
  if [ "$DOCKER_AVAILABLE" = false ]; then
    if [ -n "${FRONTEND_PID-}" ]; then
      echo "Stopping local frontend (pid=$FRONTEND_PID)"
      kill "$FRONTEND_PID" || true
    fi
    if [ -n "${BACKEND_PID-}" ]; then
      echo "Stopping local backend (pid=$BACKEND_PID)"
      kill "$BACKEND_PID" || true
    fi
  fi
}

trap cleanup EXIT

if [ "$DOCKER_AVAILABLE" = true ]; then
  echo "Starting docker-compose services..."
  ./scripts/docker_up.sh

  echo "Waiting for backend to become healthy (http://localhost:5051/syllabus)..."
  for i in {1..60}; do
    if curl -sSf http://127.0.0.1:5051/syllabus >/dev/null 2>&1; then
      echo "backend is up"
      break
    fi
    sleep 1
  done
else
  echo "Docker not found — falling back to local mode"
  echo "Starting backend locally on port 5051..."
  PORT=5051 python3 backend/app.py &
  BACKEND_PID=$!
  sleep 0.5

  echo "Playwright will start the frontend preview; only starting backend locally"

  echo "Waiting for backend to become healthy (http://localhost:5051/syllabus)..."
  for i in {1..60}; do
    if curl -sSf http://127.0.0.1:5051/syllabus >/dev/null 2>&1; then
      echo "backend is up"
      break
    fi
    sleep 1
  done
fi

echo "Installing Playwright browsers (if needed) and running E2E tests..."
cd frontend/react-app
npx playwright install --with-deps || true
if lsof -tiTCP:5174 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Detected existing frontend on port 5174 — telling Playwright to skip starting webServer"
  export E2E_SKIP_WEBSERVER=1
fi

npx playwright test --config=playwright.config.ts || TEST_EXIT=$?

TEST_EXIT=${TEST_EXIT-0}

cd "$ROOT_DIR"
if [ "$DOCKER_AVAILABLE" = true ] && [ "$KEEP_UP" = false ]; then
  echo "Tearing down docker-compose services..."
  if docker compose version >/dev/null 2>&1; then
    docker compose down
  else
    docker-compose down
  fi
fi

if [ "$TEST_EXIT" -ne 0 ]; then
  echo "E2E tests failed (exit=$TEST_EXIT)" >&2
  exit "$TEST_EXIT"
fi

echo "E2E tests completed successfully"
