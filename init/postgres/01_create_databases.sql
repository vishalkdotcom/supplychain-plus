-- Auto-runs on first container start via /docker-entrypoint-initdb.d
-- Creates both app databases hosted on this PostgreSQL instance

SELECT 'CREATE DATABASE wovo_new'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'wovo_new')\gexec

SELECT 'CREATE DATABASE wovo_ai'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'wovo_ai')\gexec
