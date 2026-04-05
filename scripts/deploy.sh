#!/bin/bash
# Zero-downtime deploy: build new image while old container serves, then swap.
set -euo pipefail

cd ~/wovo
git pull

# Build new image (old container still running)
docker compose -f docker-compose.prod.yml build app

# Swap container (sub-second downtime)
docker compose -f docker-compose.prod.yml up -d --no-deps app

# Clean up old images
docker image prune -f

echo "Deploy complete. Waiting for health check..."
sleep 5
curl -sf http://localhost:3030/api/health && echo " OK" || echo " FAILED"
