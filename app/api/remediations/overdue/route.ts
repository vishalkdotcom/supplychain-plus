import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { remediationPlans } from "@/lib/db/schema";
import { ne, lt, and, isNotNull } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const overdue = await db
      .select()
      .from(remediationPlans)
      .where(
        and(
          ne(remediationPlans.status, "closed"),
          isNotNull(remediationPlans.targetDate),
          lt(remediationPlans.targetDate, today),
        ),
      );
    return NextResponse.json(overdue);
  } catch (error) {
    logger.error("api/remediations/overdue", "Failed to fetch overdue plans", error);
    return NextResponse.json([], { status: 200 });
  }
}
