import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { jobRuns } from "@/lib/db/schema";
import { desc, eq, and, type SQL } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const jobType = searchParams.get("jobType");
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const conditions: SQL[] = [];
  if (jobType) conditions.push(eq(jobRuns.jobType, jobType));
  if (status) conditions.push(eq(jobRuns.status, status));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [runs, countResult] = await Promise.all([
    db
      .select()
      .from(jobRuns)
      .where(where)
      .orderBy(desc(jobRuns.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: jobRuns.id })
      .from(jobRuns)
      .where(where),
  ]);

  return NextResponse.json({
    runs,
    total: countResult.length,
    limit,
    offset,
  });
}
