import { NextResponse } from "next/server";
import { resilientGenerateText } from "@/lib/ai/resilient-generate";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, props: Props) {
  const { id } = await props.params;

  try {
    // 1. In a production setting, this would query 3 databases:
    // - SQL Server (cases, connect interactions)
    // - PostgreSQL (survey completions)
    // - MySQL (training completions)
    // For this demo, we simulate a realistic dataset based on supplier ID string length/chars
    const idNum = id.charCodeAt(0) + id.charCodeAt(id.length - 1);
    
    const postInteraction = 40 + (idNum % 40); // 40-80%
    const surveyParticipation = 50 + (idNum % 30); // 50-80%
    const trainingCompletion = 60 + (idNum % 35); // 60-95%
    const caseResolutionScore = 45 + (idNum % 45); // 45-90%

    // Average them for a composite score
    const compositeScore = Math.floor(
      (postInteraction + surveyParticipation + trainingCompletion + caseResolutionScore) / 4
    );

    let trend = "stable";
    if (compositeScore > 75) trend = "improving";
    else if (compositeScore < 55) trend = "worsening";

    // 2. Generate AI Explanation
    const prompt = `You are an AI analyzing factory worker engagement data.
Here are the current engagement metrics for a supplier:
- Connect App Post Interactions: ${postInteraction}%
- Worker Survey Participation: ${surveyParticipation}%
- eLearning Training Completion: ${trainingCompletion}%
- Case Resolution Speed Score: ${caseResolutionScore}%

The overall Engagement Health Score is ${compositeScore}/100.
Write a 2-sentence explanation of what is driving this score and one immediate action to improve it.
Be concise. No markdown formatting.`;

    const { text } = await resilientGenerateText({
      prompt,
      system: "You are an expert labor relations manager.",
      temperature: 0.4,
      maxTokens: 150,
    });

    return NextResponse.json({
      healthScore: compositeScore,
      trend,
      metrics: {
        postInteraction,
        surveyParticipation,
        trainingCompletion,
        caseResolutionScore,
      },
      aiExplanation: text.trim(),
    });
  } catch (error) {
    console.error(`[GET /api/suppliers/${id}/engagement-health] Error:`, error);
    return NextResponse.json(
      { error: "Failed to generate engagement health score" },
      { status: 500 }
    );
  }
}
