import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { supplierRiskHistory } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const history = await db
      .select()
      .from(supplierRiskHistory)
      .where(eq(supplierRiskHistory.supplierId, id))
      .orderBy(desc(supplierRiskHistory.snapshotDate))
      .limit(30); // Get last 30 days
      
    // Sort chronologically for the chart
    return NextResponse.json(history.reverse());
  } catch (error) {
    logger.error("api/suppliers/[id]/history", "Failed to fetch supplier history", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
