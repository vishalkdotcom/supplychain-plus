import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.execute(sql`
      SELECT DISTINCT ON (job_type)
        job_type,
        completed_at,
        duration_ms,
        result_summary
      FROM job_runs
      WHERE status = 'completed'
      ORDER BY job_type, completed_at DESC
    `);

    const freshness: Record<
      string,
      {
        jobType: string;
        completedAt: string;
        durationMs: number | null;
        resultSummary: Record<string, unknown> | null;
      }
    > = {};

    for (const row of rows) {
      const jobType = String(row.job_type);
      freshness[jobType] = {
        jobType,
        completedAt: new Date(String(row.completed_at)).toISOString(),
        durationMs: row.duration_ms != null ? Number(row.duration_ms) : null,
        resultSummary: (row.result_summary as Record<string, unknown>) ?? null,
      };
    }

    return NextResponse.json(freshness);
  } catch (error) {
    console.error("Failed to fetch freshness data:", error);
    return NextResponse.json({});
  }
}
