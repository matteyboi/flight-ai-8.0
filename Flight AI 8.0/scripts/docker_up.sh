#!/usr/bin/env bash
set -euo pipefail

if command -v docker >/dev/null 2>&1; then
  echo "Found docker"
  if docker compose version >/dev/null 2>&1; then
    echo "Using 'docker compose' to build and start services..."
    docker compose build
    docker compose up -d
    docker compose ps
  else
    if command -v docker-compose >/dev/null 2>&1; then
      echo "Using legacy 'docker-compose' to build and start services..."
      docker-compose build
      docker-compose up -d
      docker-compose ps
    else
      echo "Docker is installed but the Compose plugin is not available."
      echo "Please enable the Compose plugin or install docker-compose."
      exit 1
    fi
  fi
else
  echo "Docker not found. Install Docker Desktop for macOS and try again."
  exit 1
fi
