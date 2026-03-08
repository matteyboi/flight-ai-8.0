#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

# load .env if present
if [ -f .env ]; then
  set -o allexport
  # shellcheck disable=SC1091
  source .env
  set +o allexport
fi

API=${API_BASE:-http://localhost:5051}
TS=$(date +%s)
STUDENT="demo_${TS}"

echo "Demo admin script — API=$API, student=$STUDENT"

echo "Requesting lesson..."
LESSON_JSON=$(curl -sS -X POST "$API/lesson" -H "Content-Type: application/json" -d '{"topic":"stall recovery","level":"beginner","duration":10}')
echo "Lesson response: $LESSON_JSON"

echo "Posting progress..."
PROG_BODY=$(printf '{"student_id":"%s","data":{"lesson":"stall recovery","notes":"demo progress %s"}}' "$STUDENT" "$TS")
curl -sS -X POST "$API/progress" -H "Content-Type: application/json" -d "$PROG_BODY" >/dev/null
echo "Posted progress for $STUDENT"

# Prepare auth header (prefer ADMIN_TOKEN)
if [ -n "${ADMIN_TOKEN-}" ]; then
  AUTH_HDR="Authorization: Bearer $ADMIN_TOKEN"
elif [ -n "${ADMIN_USER-}" ] && [ -n "${ADMIN_PASS-}" ]; then
  B64=$(python3 - <<PY
import base64
import os
u=os.environ.get('ADMIN_USER','')
p=os.environ.get('ADMIN_PASS','')
print(base64.b64encode(f"{u}:{p}".encode()).decode())
PY
)
  AUTH_HDR="Authorization: Basic $B64"
else
  echo "No admin credentials found in environment (.env). Exiting."
  exit 1
fi

echo "Fetching created entry id..."
Q=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$STUDENT")
LIST=$(curl -sS -H "$AUTH_HDR" "$API/admin/progress?student_id=${Q}&limit=1&offset=0")
ID=$(printf '%s' "$LIST" | python3 -c 'import sys,json; j=json.load(sys.stdin); entries=j.get("entries",[]); print(entries[0]["id"] if entries else "")')

if [ -z "$ID" ]; then
  echo "Could not find entry. Response: $LIST"
  exit 1
fi

echo "Found entry id: $ID"

echo "Deleting entry $ID..."
DEL=$(curl -sS -X DELETE -H "$AUTH_HDR" "$API/admin/progress/$ID")
echo "Delete response: $DEL"

echo "Confirming deletion..."
LIST2=$(curl -sS -H "$AUTH_HDR" "$API/admin/progress?student_id=${Q}&limit=1&offset=0")
CNT=$(printf '%s' "$LIST2" | python3 -c 'import sys,json; j=json.load(sys.stdin); print(len(j.get("entries",[])))')

echo "Entries remaining for $STUDENT: $CNT"

echo "Demo complete." 
