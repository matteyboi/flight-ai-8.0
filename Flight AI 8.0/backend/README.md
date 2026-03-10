# Backend

## Overview
This is the backend for Flight AI 8.0, built with Python and Flask. It includes:
- app.py: Main application
- wsgi.py: WSGI entry point
- requirements.txt: Python dependencies
- Dockerfile: Container setup

## Setup
1. Create and activate Python virtual environment
2. Install dependencies from requirements.txt
3. Build and run Docker container if needed

## Usage

## Production Setup

1. Copy `.env.production.example` to `.env` and update values for your deployment:
	- Set strong `ADMIN_USER` and `ADMIN_PASS` or use `ADMIN_TOKEN` for admin access.
	- Set `ADMIN_TOKEN_ONLY=true` for token-only admin authentication.
	- Set `PRODUCTION=true` to enable strict startup checks.
	- Configure `RATELIMIT_STORAGE_URL` with your Redis URI for production-grade rate limiting.
2. Use a WSGI server (e.g., Gunicorn) for production:
	- The Dockerfile is pre-configured for Gunicorn and WSGI entrypoint.
3. Review security checklist in the main README.md.

For more details, see the main project README.md and `.env.production.example`.
