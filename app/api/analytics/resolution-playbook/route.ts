import { NextResponse } from "next/server";
import { resilientGenerateText } from "@/lib/ai/resilient-generate";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const caseType = searchParams.get("type") || "General Inquiry";
  const region = searchParams.get("region") || "Global";

  try {
    // 1. In a real scenario, we'd query SQL Server for Case + CaseNote data here.
    // For this demo, we simulate fetching aggregated stats to pass to the AI.
    const averageDays = Math.floor(Math.random() * 15) + 10; // 10-25 days avg
    const bestDays = Math.max(1, Math.floor(averageDays * 0.3)); // 30% of avg

    // 2. Generate playbook using resilient AI
    const prompt = `You are a labor rights expert analyzing supply chain grievance cases.
We analyzed historical data for cases of type "${caseType}" in "${region}".
The average resolution time is ${averageDays} days, but our top-performing factories resolved similar cases in just ${bestDays} days.

Based on best practices, write a concise, 3-point playbook on how factory management can achieve this faster resolution time. 
Format as a bulleted list. Keep sentences short. Do not use markdown headers, just return the list.`;

    const { text } = await resilientGenerateText({
      prompt,
      system: "You are a supply chain compliance expert.",
      temperature: 0.4,
      maxTokens: 250,
    });

    return NextResponse.json({
      playbook: {
        averageDays,
        bestDays,
        aiBestPractices: text.trim(),
        caseType,
        region,
      },
    });
  } catch (error) {
    console.error(`[GET /api/analytics/resolution-playbook] Error:`, error);
    return NextResponse.json(
      { error: "Failed to generate resolution playbook" },
      { status: 500 }
    );
  }
}
