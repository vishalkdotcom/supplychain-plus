import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { supplierRiskScores } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { AIRecommendation } from "@/types";

interface RiskReason {
  factor: string;
  impact: string;
  description: string;
  module: string;
}

export async function GET() {
  try {
    // Fetch top risk suppliers from Drizzle
    const topRisk = await db
      .select()
      .from(supplierRiskScores)
      .orderBy(desc(supplierRiskScores.riskScore))
      .limit(20);

    const recommendations: AIRecommendation[] = [];
    let recId = 1;

    for (const supplier of topRisk) {
      const reasons = (supplier.reasons || []) as RiskReason[];

      // High case score → investigation recommendation
      if (supplier.caseScore && supplier.caseScore > 50) {
        const caseFactor = reasons.find((r) => r.module === "connect");
        recommendations.push({
          id: String(recId++),
          supplierId: supplier.supplierId,
          action: "Initiate investigation into worker grievances",
          reason:
            caseFactor?.description ||
            `High case score (${supplier.caseScore}/100) indicates significant worker concerns`,
          urgency: supplier.caseScore > 75 ? "immediate" : "this_week",
          category: "investigation",
          linkedModule: "connect",
        });
      }

      // Low training completion → training recommendation
      if (supplier.trainingScore && supplier.trainingScore > 60) {
        const trainingFactor = reasons.find((r) => r.module === "educate");
        recommendations.push({
          id: String(recId++),
          supplierId: supplier.supplierId,
          action: "Deploy mandatory compliance training",
          reason:
            trainingFactor?.description ||
            `Training gap score (${supplier.trainingScore}/100) suggests insufficient worker education`,
          urgency: "this_week",
          category: "training",
          linkedModule: "educate",
        });
      }

      // No survey engagement → engagement recommendation
      if (supplier.surveyScore && supplier.surveyScore > 50) {
        const surveyFactor = reasons.find((r) => r.module === "engage");
        recommendations.push({
          id: String(recId++),
          supplierId: supplier.supplierId,
          action: "Conduct worker sentiment survey",
          reason:
            surveyFactor?.description ||
            `Survey engagement score (${supplier.surveyScore}/100) indicates lack of worker voice data`,
          urgency: "this_week",
          category: "remediation",
          linkedModule: "engage",
        });
      }

      // Overall high risk → escalation recommendation
      if (supplier.riskScore >= 85) {
        recommendations.push({
          id: String(recId++),
          supplierId: supplier.supplierId,
          action: "Escalate to brand compliance team",
          reason: `Critical risk score (${supplier.riskScore}/100) requires immediate brand-level intervention per HRDD requirements`,
          urgency: "immediate",
          category: "investigation",
          linkedModule: "connect",
        });
      }
    }

    // Sort by urgency (immediate first) and limit
    const urgencyOrder: Record<string, number> = {
      immediate: 0,
      this_week: 1,
      this_month: 2,
    };
    recommendations.sort(
      (a, b) => (urgencyOrder[a.urgency] ?? 2) - (urgencyOrder[b.urgency] ?? 2),
    );

    return NextResponse.json(recommendations.slice(0, 10));
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
