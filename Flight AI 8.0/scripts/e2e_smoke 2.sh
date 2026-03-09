#!/usr/bin/env bash
set -euo pipefail

FRONTEND=${FRONTEND:-http://localhost:8001}
BACKEND=${BACKEND:-http://localhost:5051}

echo "E2E smoke test — frontend=$FRONTEND backend=$BACKEND"

echo "Checking frontend index..."
if curl -sS -I "$FRONTEND/" | head -n1 | grep -q "200"; then
  echo "Frontend OK"
else
  echo "Frontend FAILED"; exit 2
fi

echo "Checking backend /syllabus..."
if curl -sS -f "$BACKEND/syllabus" >/dev/null; then
  echo "Backend /syllabus OK"
else
  echo "Backend /syllabus FAILED"; exit 2
fi

echo "Checking admin/progress auth (expect 401/403)..."
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND/admin/progress")
echo "Status $HTTP"
if [ "$HTTP" = "401" ] || [ "$HTTP" = "403" ]; then
  echo "Auth check OK"
else
  echo "Auth check unexpected: $HTTP"; exit 2
fi

echo "E2E smoke test passed"
