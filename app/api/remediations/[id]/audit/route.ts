import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { remediationAuditLog } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const entries = await db
      .select()
      .from(remediationAuditLog)
      .where(eq(remediationAuditLog.remediationId, parseInt(id)))
      .orderBy(desc(remediationAuditLog.createdAt));
    return NextResponse.json(entries);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
