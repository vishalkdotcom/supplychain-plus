import { NextResponse } from "next/server";
import { generateText } from "ai";
import { model } from "@/lib/ai/provider";
import type { RiskReason } from "@/lib/db/schema";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { supplier, regulatoryFramework } = await request.json();

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier data is required" },
        { status: 400 },
      );
    }

    const frameworkName =
      regulatoryFramework === "csddd"
        ? "EU Corporate Sustainability Due Diligence Directive (CSDDD)"
        : "UK Modern Slavery Act";

    const prompt = `
      You are an expert compliance auditor generating an executive summary for an HRDD (Human Rights Due Diligence) report.
      
      Write a professional, objective 3-paragraph executive narrative about the following supplier, specifically tailored for the ${frameworkName}.
      
      Supplier Details:
      Name: ${supplier.name}
      Location: ${supplier.location}
      Overall Risk Score: ${supplier.riskScore}/100
      Risk Level: ${supplier.riskLevel}
      
      Risk Breakdown:
      - Grievance Cases: ${supplier.riskBreakdown.caseScore}/100
      - Worker Surveys: ${supplier.riskBreakdown.surveyScore}/100
      - Compliance Training: ${supplier.riskBreakdown.trainingScore}/100
      - Engagement: ${supplier.riskBreakdown.engagementScore}/100
      
      Key Risk Factors identified by our system:
      ${supplier.riskBreakdown.reasons.map((r: RiskReason) => `- [${r.impact.toUpperCase()}] ${r.factor}: ${r.description}`).join("\n")}
      
      Structure the 3 paragraphs as follows:
      1. Supplier Overview & General Risk Posture
      2. Specific Findings (Grievances, Worker Voice, and Training gaps based on the risk breakdown)
      3. Regulatory Alignment & Recommended Next Steps (Tailored to ${frameworkName})
      
      Do not include greetings or sign-offs. Write only the narrative content.
    `;

    const result = await generateText({
      model,
      system:
        "You are an expert compliance auditor. You write objective, professional, and clear executive summaries based on raw supplier data.",
      prompt,
    });

    return NextResponse.json({ narrative: result.text });
  } catch (error) {
    console.error("Narrative generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate narrative" },
      { status: 500 },
    );
  }
}
