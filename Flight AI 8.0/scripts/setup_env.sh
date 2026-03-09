#!/usr/bin/env bash
set -euo pipefail

# Create and activate a virtualenv, then install backend deps
python3 -m venv .venv
# shellcheck source=/dev/null
source .venv/bin/activate
python3 -m pip install --upgrade pip
python3 -m pip install -r backend/requirements.txt

echo "Virtualenv created and dependencies installed."
echo "Activate with: source .venv/bin/activate"
