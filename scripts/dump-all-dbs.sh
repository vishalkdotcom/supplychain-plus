#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# dump-all-dbs.sh — Dump all 5 WOVO databases with logging
# Usage: bash scripts/dump-all-dbs.sh
# ──────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load .env.local (fallback to .env.example)
ENV_FILE="$PROJECT_DIR/.env.local"
[ -f "$ENV_FILE" ] || ENV_FILE="$PROJECT_DIR/.env.example"
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

# ── Config ────────────────────────────────────────────────────
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
DUMP_DIR="$PROJECT_DIR/dumps/$TIMESTAMP"
LOG_FILE="$DUMP_DIR/dump.log"

PG_HOST="${POSTGRES_HOST:-localhost}"
PG_PORT="${POSTGRES_PORT:-5432}"
PG_USER="${POSTGRES_USER:-pguser}"
PG_PASS="${POSTGRES_PASSWORD:-pgpass}"

MYSQL_H="${MYSQL_HOST:-127.0.0.1}"
MYSQL_U="${MYSQL_USER:-moodle}"
MYSQL_P="${MYSQL_PASSWORD:-moodlepass}"
MYSQL_DB="${MYSQL_DATABASE:-iomadprod}"

PG_DBS=("${POSTGRES_DATABASE_WOVO_AI:-wovo_ai}" "${POSTGRES_DATABASE:-wovo_new}" "wc_global")

SQLSERVER_CONTAINER="wovo_sqlserver"
MYSQL_CONTAINER="wovo_mysql"

# ── Helpers ───────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
PASS=0; FAIL=0; SKIP=0

log() {
  local msg="[$(date +"%H:%M:%S")] $1"
  echo -e "$msg"
  echo -e "$msg" >> "$LOG_FILE"
}

dump_ok() {
  local file="$1" label="$2"
  local size
  size=$(du -h "$file" | cut -f1)
  log "${GREEN}✓${NC} $label → $file ($size)"
  PASS=$((PASS + 1))
}

dump_fail() {
  local label="$1" err="$2"
  log "${RED}✗${NC} $label — $err"
  FAIL=$((FAIL + 1))
}

container_running() {
  docker ps --format '{{.Names}}' | grep -q "^$1$"
}

# ── Setup ─────────────────────────────────────────────────────
mkdir -p "$DUMP_DIR"
echo "" > "$LOG_FILE"
log "${CYAN}━━━ WOVO Database Dump ━━━${NC}"
log "Timestamp : $TIMESTAMP"
log "Output    : $DUMP_DIR"
log ""

# ── PostgreSQL dumps ──────────────────────────────────────────
log "${YELLOW}▸ PostgreSQL${NC}"
for db in "${PG_DBS[@]}"; do
  OUTFILE="$DUMP_DIR/$db.sql"
  if PGPASSWORD="$PG_PASS" pg_dump \
       -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$db" \
       --clean --if-exists -F p -f "$OUTFILE" 2>>"$LOG_FILE"; then
    dump_ok "$OUTFILE" "$db"
  else
    dump_fail "$db" "pg_dump failed (see log)"
  fi
done

# ── MySQL dump ────────────────────────────────────────────────
log ""
log "${YELLOW}▸ MySQL${NC}"
if ! container_running "$MYSQL_CONTAINER"; then
  dump_fail "$MYSQL_DB" "container '$MYSQL_CONTAINER' not running"
else
  OUTFILE="$DUMP_DIR/$MYSQL_DB.sql"
  if docker exec "$MYSQL_CONTAINER" \
       mysqldump -u "$MYSQL_U" -p"$MYSQL_P" \
       --databases "$MYSQL_DB" --add-drop-database --routines --triggers \
       > "$OUTFILE" 2>>"$LOG_FILE"; then
    dump_ok "$OUTFILE" "$MYSQL_DB"
  else
    dump_fail "$MYSQL_DB" "mysqldump failed (see log)"
  fi
fi

# ── SQL Server backup ────────────────────────────────────────
log ""
log "${YELLOW}▸ SQL Server${NC}"
if ! container_running "$SQLSERVER_CONTAINER"; then
  dump_fail "WOVO" "container '$SQLSERVER_CONTAINER' not running"
else
  BAK_PATH="/var/opt/mssql/backup/WOVO.bak"
  OUTFILE="$DUMP_DIR/WOVO.bak"

  # Use $SA_PASSWORD env var inside container to avoid shell quoting issues with '!'
  BACKUP_CMD="mkdir -p /var/opt/mssql/backup && /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -C -P \"\$SA_PASSWORD\" \
    -Q \"BACKUP DATABASE [WOVO] TO DISK = N'$BAK_PATH' WITH FORMAT, INIT, COMPRESSION, NAME = 'WOVO Full Backup'\""

  if MSYS_NO_PATHCONV=1 docker exec "$SQLSERVER_CONTAINER" bash -c "$BACKUP_CMD" >> "$LOG_FILE" 2>&1; then
    # docker cp needs Windows-style destination on Windows
    WIN_OUTFILE="${OUTFILE//\//\\}"
    # Convert /c/ to C:/ for docker cp destination
    WIN_OUTFILE=$(cygpath -w "$OUTFILE" 2>/dev/null || echo "$OUTFILE")
    if docker cp "$SQLSERVER_CONTAINER:$BAK_PATH" "$WIN_OUTFILE" 2>>"$LOG_FILE"; then
      dump_ok "$OUTFILE" "WOVO"
    else
      dump_fail "WOVO" "docker cp failed (see log)"
    fi
  else
    dump_fail "WOVO" "BACKUP DATABASE failed (see log)"
  fi
fi

# ── Summary ───────────────────────────────────────────────────
log ""
log "${CYAN}━━━ Summary ━━━${NC}"
log "Passed: $PASS  Failed: $FAIL"
log "Log: $LOG_FILE"

if [ "$FAIL" -gt 0 ]; then
  log "${RED}Some dumps failed — check the log above.${NC}"
  exit 1
else
  log "${GREEN}All dumps completed successfully.${NC}"

  # Symlink latest for convenience
  LATEST_LINK="$PROJECT_DIR/dumps/latest"
  rm -f "$LATEST_LINK"
  ln -s "$DUMP_DIR" "$LATEST_LINK" 2>/dev/null || true

  exit 0
fi
