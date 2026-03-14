#!/bin/bash

# Start SQL Server in the background
/opt/mssql/bin/sqlservr &
MSSQL_PID=$!

# Find sqlcmd (path differs between mssql-tools and mssql-tools18)
SQLCMD=""
for candidate in /opt/mssql-tools18/bin/sqlcmd /opt/mssql-tools/bin/sqlcmd; do
  if [ -f "$candidate" ]; then
    SQLCMD="$candidate"
    break
  fi
done

if [ -z "$SQLCMD" ]; then
  echo "ERROR: sqlcmd not found. Keeping SQL Server running without init."
  wait $MSSQL_PID
  exit $?
fi

echo "Using sqlcmd: $SQLCMD"
echo "Waiting for SQL Server to be ready..."

for i in $(seq 1 30); do
  # -C trusts the self-signed cert (required by mssql-tools18)
  if "$SQLCMD" -S localhost -U sa -P "$SA_PASSWORD" -C -Q "SELECT 1" -b &>/dev/null; then
    echo "SQL Server is ready."
    break
  fi
  echo "  attempt $i/30..."
  sleep 2
done

echo "Creating database [${MSSQL_DATABASE}] if not exists..."
"$SQLCMD" -S localhost -U sa -P "$SA_PASSWORD" -C \
  -Q "IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '${MSSQL_DATABASE}') CREATE DATABASE [${MSSQL_DATABASE}]" -b \
  && echo "Database [${MSSQL_DATABASE}] ready." \
  || echo "WARNING: Could not create database (may already exist or server not ready)."

# Apply schema only if tables haven't been created yet (idempotent)
if [ -f /init/01_schema.sql ]; then
  TABLES=$("$SQLCMD" -S localhost -U sa -P "$SA_PASSWORD" -C -d "$MSSQL_DATABASE" \
    -Q "SET NOCOUNT ON; SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Case'" -h -1 2>/dev/null | tr -d '[:space:]')
  if [ "$TABLES" = "0" ]; then
    echo "Applying schema..."
    "$SQLCMD" -S localhost -U sa -P "$SA_PASSWORD" -C -d "$MSSQL_DATABASE" -i /init/01_schema.sql \
      && echo "Schema applied." \
      || echo "Schema applied with warnings."
  else
    echo "Schema already present, skipping."
  fi
fi

# Seed data only if Company table is empty (idempotent)
if [ -f /init/02_seed_data.sql ]; then
  ROWS=$("$SQLCMD" -S localhost -U sa -P "$SA_PASSWORD" -C -d "$MSSQL_DATABASE" \
    -Q "SET NOCOUNT ON; SELECT COUNT(*) FROM Company" -h -1 2>/dev/null | tr -d '[:space:]')
  if [ "$ROWS" = "0" ]; then
    echo "Seeding data..."
    "$SQLCMD" -S localhost -U sa -P "$SA_PASSWORD" -C -d "$MSSQL_DATABASE" -i /init/02_seed_data.sql \
      && echo "Seed data applied." \
      || echo "Seed data applied with warnings."
  else
    echo "Data already seeded ($ROWS companies), skipping."
  fi
fi

wait $MSSQL_PID
