import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { remediationEvidence, remediationAuditLog } from "@/lib/db/schema";
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

    const [result] = await db
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

    // Write audit log entry for evidence addition
    const actorId = request.headers.get("x-demo-user-id") || "system";
    await db.insert(remediationAuditLog).values({
      remediationId,
      action: "evidence_added",
      field: "evidence",
      previousValue: null,
      newValue: title,
      actorId,
      actorType: actorId === "system" ? "system" : "user",
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    logger.error("api/remediations/[id]/evidence", "Failed to create evidence", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
