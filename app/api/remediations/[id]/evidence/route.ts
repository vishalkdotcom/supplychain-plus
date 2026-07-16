import { NextResponse } from "next/server";
import { rejectIfDemoMutation } from "@/lib/demo-mode/guards";
import { invalidateAfterRemediationUpdate } from "@/lib/cache/invalidate";
import { db } from "@/lib/db/drizzle";
import { remediationEvidence, remediationPlans, remediationAuditLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const remediationId = parseInt(id);

    const evidence = await db
      .select()
      .from(remediationEvidence)
      .where(eq(remediationEvidence.remediationId, remediationId));

    return NextResponse.json(evidence);
  } catch (error) {
    logger.error("api/remediations/[id]/evidence", "Failed to fetch evidence", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const blocked = rejectIfDemoMutation();
  if (blocked) return blocked;

  try {
    const { id } = await params;
    const remediationId = parseInt(id);
    const body = await request.json();

    const { evidenceType, referenceId, title, description, date } = body;

    if (!evidenceType || !title || !date) {
      return NextResponse.json(
        { error: "evidenceType, title, and date are required" },
        { status: 400 },
      );
    }

    const actorId = request.headers.get("x-demo-user-id") || "system";

    const { result, supplierId } = await db.transaction(async (tx) => {
      const rows = await tx
        .insert(remediationEvidence)
        .values({
          remediationId,
          evidenceType,
          referenceId: referenceId ?? null,
          title,
          description: description ?? null,
          date,
        })
        .returning();

      await tx.insert(remediationAuditLog).values({
        remediationId,
        action: "evidence_added",
        field: "evidence",
        previousValue: null,
        newValue: title,
        actorId,
        actorType: actorId === "system" ? "system" : "user",
      });

      const [plan] = await tx
        .select({ supplierId: remediationPlans.supplierId })
        .from(remediationPlans)
        .where(eq(remediationPlans.id, remediationId))
        .limit(1);

      return { result: rows[0], supplierId: plan?.supplierId ?? "" };
    });

    invalidateAfterRemediationUpdate(remediationId, supplierId);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    logger.error("api/remediations/[id]/evidence", "Failed to create evidence", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
