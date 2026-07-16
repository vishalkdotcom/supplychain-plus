import { NextResponse } from "next/server";
import { rejectIfDemoMutation } from "@/lib/demo-mode/guards";
import { invalidateAfterRemediationUpdate } from "@/lib/cache/invalidate";
import { db } from "@/lib/db/drizzle";
import { remediationPlans, remediationEvidence, remediationAuditLog } from "@/lib/db/schema";
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
  const blocked = rejectIfDemoMutation();
  if (blocked) return blocked;

  try {
    const { id } = await params;
    const remediationId = parseInt(id);
    const body = await request.json();
    const actorId = request.headers.get("x-demo-user-id") || "system";

    // Fetch current state for audit comparison
    const [current] = await db
      .select()
      .from(remediationPlans)
      .where(eq(remediationPlans.id, remediationId))
      .limit(1);

    if (!current) {
      return NextResponse.json(
        { error: "Remediation not found" },
        { status: 404 },
      );
    }

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

    // Build audit entries by diffing current vs incoming
    const auditEntries: Array<{
      remediationId: number;
      action: string;
      field: string;
      previousValue: string | null;
      newValue: string | null;
      actorId: string;
      actorType: string;
    }> = [];
    const actorType = actorId === "system" ? "system" : "user";

    if (body.status && body.status !== current.status) {
      auditEntries.push({
        remediationId,
        action: "status_change",
        field: "status",
        previousValue: current.status,
        newValue: body.status,
        actorId,
        actorType,
      });
    }
    if (body.rootCause !== undefined && body.rootCause !== current.rootCause) {
      auditEntries.push({
        remediationId,
        action: "field_edit",
        field: "rootCause",
        previousValue: current.rootCause,
        newValue: body.rootCause,
        actorId,
        actorType,
      });
    }
    if (body.actionPlan !== undefined && body.actionPlan !== current.actionPlan) {
      auditEntries.push({
        remediationId,
        action: "field_edit",
        field: "actionPlan",
        previousValue: current.actionPlan,
        newValue: body.actionPlan,
        actorId,
        actorType,
      });
    }
    if (body.assignedTo !== undefined && body.assignedTo !== current.assignedTo) {
      auditEntries.push({
        remediationId,
        action: "field_edit",
        field: "assignedTo",
        previousValue: current.assignedTo,
        newValue: body.assignedTo,
        actorId,
        actorType,
      });
    }
    if (body.targetDate !== undefined && body.targetDate !== current.targetDate) {
      auditEntries.push({
        remediationId,
        action: "field_edit",
        field: "targetDate",
        previousValue: current.targetDate,
        newValue: body.targetDate,
        actorId,
        actorType,
      });
    }
    if (body.title !== undefined && body.title !== current.title) {
      auditEntries.push({
        remediationId,
        action: "field_edit",
        field: "title",
        previousValue: current.title,
        newValue: body.title,
        actorId,
        actorType,
      });
    }

    const [result] = await db.transaction(async (tx) => {
      const rows = await tx
        .update(remediationPlans)
        .set(updates)
        .where(eq(remediationPlans.id, remediationId))
        .returning();

      if (auditEntries.length > 0) {
        await tx.insert(remediationAuditLog).values(auditEntries);
      }

      return rows;
    });

    invalidateAfterRemediationUpdate(remediationId, current.supplierId);

    return NextResponse.json(result);
  } catch (error) {
    logger.error("api/remediations/[id]", "Failed to update remediation", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
