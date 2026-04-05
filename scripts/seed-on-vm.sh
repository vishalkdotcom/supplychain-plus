#!/bin/bash
# ─── Seed databases on the VM ───
# Run after docker compose is up and all DBs are healthy.
# DB init scripts (schema + seed) run automatically via Docker entrypoint.
# This script handles Drizzle schema push and the AI/ML seed pipeline.
#
# Usage: bash scripts/seed-on-vm.sh

set -euo pipefail

echo "══════════════════════════════════════════════"
echo "  WOVO — Database Seeding"
echo "══════════════════════════════════════════════"

# Source bun path if needed
export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
export PATH="$BUN_INSTALL/bin:$PATH"

# Load production env vars for Drizzle
set -a
source .env.production
set +a

# ── 1. Wait for all DBs to be healthy ──
echo "→ Waiting for databases to be healthy..."
docker compose -f docker-compose.prod.yml ps --format json | head -1 > /dev/null 2>&1 || true
sleep 5

for svc in postgres sqlserver mysql; do
  echo "  Checking $svc..."
  timeout 120 bash -c "until docker compose -f docker-compose.prod.yml exec $svc echo 'ready' 2>/dev/null; do sleep 3; done" || {
    echo "  ⚠ $svc not ready after 120s — check: docker compose -f docker-compose.prod.yml logs $svc"
  }
done

echo "✓ Databases are up"

# ── 2. Push Drizzle schema to PostgreSQL (wovo_ai) ──
echo "→ Pushing Drizzle schema to wovo_ai..."
bun run db:push
echo "✓ Drizzle schema pushed"

# ── 3. Run the full seed pipeline (all 9 AI jobs) ──
echo "→ Running seed-all (this runs all 9 AI job handlers)..."
echo "  This will take 10-30 minutes depending on AI provider response times."
echo "  Progress is logged to the console."
echo ""
bun run seed-all
echo ""
echo "✓ Seed pipeline complete"

echo ""
echo "══════════════════════════════════════════════"
echo "  All databases seeded! The app is ready."
echo "══════════════════════════════════════════════"
echo ""
echo "  Visit: http://localhost:3030"
echo "  Or set up Cloudflare Tunnel for public access."
echo ""
