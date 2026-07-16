import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { query as pgQuery } from "@/lib/db/postgres";
import { query as sqlQuery } from "@/lib/db/sql-server";
import { query as mysqlQuery } from "@/lib/db/mysql";
import { db } from "@/lib/db/drizzle";
import { isDemoMode } from "@/lib/demo-mode/profile";

interface HealthCheck {
  status: "healthy" | "unhealthy";
  latencyMs: number;
}

async function checkDerivedDb(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    return { status: "healthy", latencyMs: Date.now() - start };
  } catch {
    return { status: "unhealthy", latencyMs: Date.now() - start };
  }
}

export async function GET() {
  const checks: Record<string, HealthCheck> = {};

  if (isDemoMode()) {
    checks.derivedDb = await checkDerivedDb();
    const healthy = checks.derivedDb.status === "healthy";

    return NextResponse.json(
      { status: healthy ? "healthy" : "degraded", checks },
      { status: healthy ? 200 : 503 },
    );
  }

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
