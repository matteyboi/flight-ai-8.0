.PHONY: help venv install test build-frontend docker-up e2e-compose

help:
	@echo "Makefile targets:"
	@echo "  make venv           # create and activate a python venv (manual activate)"
	@echo "  make install        # install backend python deps into venv (or user site)"
	@echo "  make test           # run pytest"
	@echo "  make build-frontend # build the React frontend (Vite)"
	@echo "  make docker-up      # run docker compose (requires Docker)"
	@echo "  make e2e-compose    # run scripts/run_e2e_compose.sh (requires Docker)"

venv:
	python3 -m venv .venv

install: venv
	. .venv/bin/activate && pip install --upgrade pip && pip install -r backend/requirements.txt

test:
	python3 -m pytest -q

build-frontend:
	cd frontend/react-app && npm install && npm run build

docker-up:
	./scripts/docker_up.sh

e2e-compose:
	./scripts/run_e2e_compose.sh
VENV?=.venv

.PHONY: venv test run-backend serve-frontend docker-up health

venv:
	python3 -m venv $(VENV)
	. $(VENV)/bin/activate && python3 -m pip install --upgrade pip
	. $(VENV)/bin/activate && python3 -m pip install -r backend/requirements.txt

test:
	python3 -m pytest -q

run-backend:
	PORT=5051 python3 backend/app.py

serve-frontend:
	python3 -m http.server 8000 --directory frontend

docker-up:
	./scripts/docker_up.sh

health:
	./scripts/health_check.sh
