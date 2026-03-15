import { NextResponse } from "next/server";
import { query as pgQuery } from "@/lib/db/postgres";
import { query as sqlQuery } from "@/lib/db/sql-server";
import { query as mysqlQuery } from "@/lib/db/mysql";

interface HealthCheck {
  status: "healthy" | "unhealthy";
  latencyMs: number;
}

export async function GET() {
  const checks: Record<string, HealthCheck> = {};

  // PostgreSQL
  const pgStart = Date.now();
  try {
    await pgQuery("SELECT 1");
    checks.postgres = { status: "healthy", latencyMs: Date.now() - pgStart };
  } catch {
    checks.postgres = { status: "unhealthy", latencyMs: Date.now() - pgStart };
  }

  // SQL Server
  const sqlStart = Date.now();
  try {
    await sqlQuery("SELECT 1");
    checks.sqlServer = { status: "healthy", latencyMs: Date.now() - sqlStart };
  } catch {
    checks.sqlServer = { status: "unhealthy", latencyMs: Date.now() - sqlStart };
  }

  // MySQL
  const myStart = Date.now();
  try {
    await mysqlQuery("SELECT 1");
    checks.mysql = { status: "healthy", latencyMs: Date.now() - myStart };
  } catch {
    checks.mysql = { status: "unhealthy", latencyMs: Date.now() - myStart };
  }

  const allHealthy = Object.values(checks).every(
    (c) => c.status === "healthy",
  );

  return NextResponse.json(
    { status: allHealthy ? "healthy" : "degraded", checks },
    { status: allHealthy ? 200 : 503 },
  );
}
