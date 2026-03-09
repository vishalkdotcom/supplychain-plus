import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { supplierRiskHistory } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

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
    console.error("Error fetching supplier history:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
