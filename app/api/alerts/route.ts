import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { alerts, remediationPlans } from "@/lib/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") !== "false";
    const limit = parseInt(searchParams.get("limit") || "20");
    const severity = searchParams.get("severity");
    const hasRemediation = searchParams.get("hasRemediation");

    const conditions = [];
    if (unreadOnly) conditions.push(eq(alerts.isRead, false));
    if (severity && severity !== "all") conditions.push(eq(alerts.severity, severity));

    const results = await db
      .select()
      .from(alerts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(alerts.createdAt))
      .limit(limit);

    // Filter by remediation linkage if requested
    if (hasRemediation === "false" || hasRemediation === "true") {
      const linkedAlertIds = await db
        .select({ sourceId: remediationPlans.sourceId })
        .from(remediationPlans)
        .where(eq(remediationPlans.sourceType, "alert"));

      const linkedIds = new Set(linkedAlertIds.map((r) => r.sourceId));

      const filtered =
        hasRemediation === "false"
          ? results.filter((a) => !linkedIds.has(a.id))
          : results.filter((a) => linkedIds.has(a.id));

      return NextResponse.json(filtered);
    }

    return NextResponse.json(results);
  } catch (error) {
    logger.error("api/alerts", "Failed to fetch alerts", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { alertId, isRead, resolvedAt, resolve } = body;

    if (!alertId) {
      return NextResponse.json(
        { error: "alertId is required" },
        { status: 400 },
      );
    }

    const updates: Record<string, unknown> = {};
    if (isRead !== undefined) updates.isRead = isRead;
    if (resolve) updates.resolvedAt = new Date();
    else if (resolvedAt !== undefined) updates.resolvedAt = new Date(resolvedAt);

    await db
      .update(alerts)
      .set(updates)
      .where(eq(alerts.id, alertId));

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("api/alerts", "Failed to update alert", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
