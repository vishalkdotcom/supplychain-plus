import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { remediationPlans, remediationEvidence } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const remediationId = parseInt(id);

    const [remediation] = await db
      .select()
      .from(remediationPlans)
      .where(eq(remediationPlans.id, remediationId))
      .limit(1);

    if (!remediation) {
      return NextResponse.json(
        { error: "Remediation not found" },
        { status: 404 },
      );
    }

    // Get associated evidence
    const evidence = await db
      .select()
      .from(remediationEvidence)
      .where(eq(remediationEvidence.remediationId, remediationId));

    return NextResponse.json({ ...remediation, evidence });
  } catch (error) {
    logger.error("api/remediations/[id]", "Failed to fetch remediation", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

const VALID_STATUSES = [
  "detected",
  "root_cause",
  "action_plan",
  "implementing",
  "verifying",
  "closed",
];

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const remediationId = parseInt(id);
    const body = await request.json();

    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (body.status) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json(
          {
            error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
          },
          { status: 400 },
        );
      }
      updates.status = body.status;
      if (body.status === "closed") {
        updates.closedAt = new Date();
      }
    }

    if (body.rootCause !== undefined) updates.rootCause = body.rootCause;
    if (body.actionPlan !== undefined) updates.actionPlan = body.actionPlan;
    if (body.assignedTo !== undefined) updates.assignedTo = body.assignedTo;
    if (body.targetDate !== undefined) updates.targetDate = body.targetDate;
    if (body.title !== undefined) updates.title = body.title;

    const [result] = await db
      .update(remediationPlans)
      .set(updates)
      .where(eq(remediationPlans.id, remediationId))
      .returning();

    if (!result) {
      return NextResponse.json(
        { error: "Remediation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error("api/remediations/[id]", "Failed to update remediation", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
