#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${1:-http://localhost:5051}

echo "Checking $BASE_URL/syllabus"
curl -fsS "$BASE_URL/syllabus" | head -n 40 || echo "Failed to fetch /syllabus"

echo
echo "Checking $BASE_URL/admin/progress (expect 401/403 without credentials)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin/progress") || STATUS=000
echo "HTTP $STATUS"

echo
echo "Health check complete."
