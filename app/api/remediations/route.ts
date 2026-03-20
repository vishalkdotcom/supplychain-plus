import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { remediationPlans, remediationAuditLog } from "@/lib/db/schema";
import { desc, eq, and, count } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplierId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("perPage") || "20");

    const conditions = [];
    if (supplierId) {
      conditions.push(eq(remediationPlans.supplierId, supplierId));
    }
    if (status && status !== "all") {
      conditions.push(eq(remediationPlans.status, status));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [results, totalResult] = await Promise.all([
      db
        .select()
        .from(remediationPlans)
        .where(where)
        .orderBy(desc(remediationPlans.createdAt))
        .limit(perPage)
        .offset((page - 1) * perPage),
      db
        .select({ count: count() })
        .from(remediationPlans)
        .where(where),
    ]);

    const total = totalResult[0]?.count ?? 0;

    return NextResponse.json({
      data: results,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    });
  } catch (error) {
    logger.error("api/remediations", "Failed to fetch remediations", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      supplierId,
      title,
      sourceType,
      sourceId,
      rootCause,
      actionPlan,
      assignedTo,
      targetDate,
    } = body;

    if (!supplierId || !title || !sourceType) {
      return NextResponse.json(
        { error: "supplierId, title, and sourceType are required" },
        { status: 400 },
      );
    }

    const [result] = await db
      .insert(remediationPlans)
      .values({
        supplierId,
        title,
        sourceType,
        sourceId: sourceId ?? null,
        rootCause: rootCause ?? null,
        actionPlan: actionPlan ?? null,
        assignedTo: assignedTo ?? null,
        targetDate: targetDate ?? null,
        status: "detected",
      })
      .returning();

    // Write audit log entry for creation
    const actorId = request.headers.get("x-demo-user-id") || "system";
    await db.insert(remediationAuditLog).values({
      remediationId: result.id,
      action: "status_change",
      field: "status",
      previousValue: null,
      newValue: "detected",
      actorId,
      actorType: actorId === "system" ? "system" : "user",
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    logger.error("api/remediations", "Failed to create remediation", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
