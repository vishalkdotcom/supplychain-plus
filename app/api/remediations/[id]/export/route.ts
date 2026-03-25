import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import {
  remediationPlans,
  remediationEvidence,
  remediationAuditLog,
  supplierRiskScores,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const remediationId = parseInt(id);

    // Fetch plan, evidence, and audit log in parallel
    const [planResult, evidence, auditLog] = await Promise.all([
      db
        .select()
        .from(remediationPlans)
        .where(eq(remediationPlans.id, remediationId))
        .limit(1),
      db
        .select()
        .from(remediationEvidence)
        .where(eq(remediationEvidence.remediationId, remediationId)),
      db
        .select()
        .from(remediationAuditLog)
        .where(eq(remediationAuditLog.remediationId, remediationId))
        .orderBy(desc(remediationAuditLog.createdAt)),
    ]);

    const plan = planResult[0];
    if (!plan) {
      return NextResponse.json(
        { error: "Remediation not found" },
        { status: 404 },
      );
    }

    // Fetch supplier name
    let supplierName = `Supplier ${plan.supplierId}`;
    const supplierResult = await db
      .select({ supplierName: supplierRiskScores.supplierName })
      .from(supplierRiskScores)
      .where(eq(supplierRiskScores.supplierId, plan.supplierId))
      .limit(1);
    if (supplierResult[0]?.supplierName) {
      supplierName = supplierResult[0].supplierName;
    }

    const exportDate = new Date().toISOString();
    const dateStr = exportDate.slice(0, 10);

    // Build human-readable summary
    const summaryLines = [
      `EVIDENCE PACKAGE — ${plan.title}`,
      `${"=".repeat(60)}`,
      ``,
      `Export Date:    ${new Date(exportDate).toLocaleString("en-US")}`,
      `Platform:       WOVO Ethical Supply Chain Intelligence`,
      ``,
      `REMEDIATION SUMMARY`,
      `${"─".repeat(40)}`,
      `Title:          ${plan.title}`,
      `Supplier:       ${supplierName} (ID: ${plan.supplierId})`,
      `Status:         ${plan.status.replace(/_/g, " ").toUpperCase()}`,
      `Source:         ${plan.sourceType.replace(/_/g, " ")}`,
      `Created:        ${new Date(plan.createdAt).toLocaleDateString("en-US")}`,
      plan.closedAt
        ? `Closed:         ${new Date(plan.closedAt).toLocaleDateString("en-US")}`
        : `Target Date:    ${plan.targetDate ? new Date(plan.targetDate).toLocaleDateString("en-US") : "Not set"}`,
      plan.assignedTo ? `Assigned To:    ${plan.assignedTo}` : null,
      ``,
      `Evidence Items: ${evidence.length}`,
      `Audit Entries:  ${auditLog.length}`,
      ``,
      plan.rootCause ? `ROOT CAUSE\n${plan.rootCause}` : null,
      plan.actionPlan ? `\nACTION PLAN\n${plan.actionPlan}` : null,
      ``,
      `${"=".repeat(60)}`,
      `Full structured data follows below.`,
    ]
      .filter(Boolean)
      .join("\n");

    const exportPackage = {
      _summary: summaryLines,
      metadata: {
        exportDate,
        platform: "WOVO Ethical Supply Chain Intelligence",
        version: "1.0",
        remediationId,
      },
      plan: {
        id: plan.id,
        title: plan.title,
        supplierId: plan.supplierId,
        supplierName,
        status: plan.status,
        sourceType: plan.sourceType,
        sourceId: plan.sourceId,
        rootCause: plan.rootCause,
        actionPlan: plan.actionPlan,
        assignedTo: plan.assignedTo,
        targetDate: plan.targetDate,
        createdAt: plan.createdAt,
        closedAt: plan.closedAt,
      },
      evidence: evidence.map((e) => ({
        id: e.id,
        type: e.evidenceType,
        title: e.title,
        description: e.description,
        referenceId: e.referenceId,
        date: e.date,
        collectedAt: e.createdAt,
      })),
      auditTrail: auditLog.map((a) => ({
        action: a.action,
        field: a.field,
        previousValue: a.previousValue,
        newValue: a.newValue,
        actorId: a.actorId,
        actorType: a.actorType,
        timestamp: a.createdAt,
      })),
    };

    const filename = `evidence-package-${remediationId}-${dateStr}.json`;

    return new NextResponse(JSON.stringify(exportPackage, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    logger.error(
      "api/remediations/[id]/export",
      "Failed to export evidence package",
      error,
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
