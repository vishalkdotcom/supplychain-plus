import { streamText } from "ai";
import { getModelFromRequest } from "@/lib/ai/provider";
import { logger } from "@/lib/logger";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { sourceType, sourceContext, supplierInfo, mode } = await request.json();

    const isActionPlan = mode === "action_plan";
    const activeModel = getModelFromRequest(request);

    const systemPrompt = isActionPlan
      ? `You are an expert in supply chain compliance and remediation planning. Given a root cause analysis, draft a specific, actionable remediation plan. Include concrete steps, assign responsibilities (use generic roles like "Compliance Officer", "Factory Manager"), and suggest timelines. Be specific and practical. Do not use markdown headers. Use numbered lists for steps.`
      : `You are an expert in supply chain compliance and human rights due diligence. Given a detected issue, draft a root cause analysis. Cover: (1) What happened — describe the specific violation or pattern, (2) Why it likely happened — systemic factors, management failures, economic pressures, (3) Who is affected — workers, suppliers, communities, (4) Contributing factors — regulatory gaps, supply chain pressure, lack of training. Be specific based on the context provided. Do not use markdown headers. Write in clear paragraphs.`;

    const userPrompt = isActionPlan
      ? `Root cause analysis:\n${sourceContext}\n\nDraft a remediation action plan with specific steps, responsible parties, and timeline.`
      : `Issue type: ${sourceType}\n${supplierInfo ? `Supplier context: ${supplierInfo}\n` : ""}Issue details:\n${sourceContext}\n\nDraft a root cause analysis.`;

    const result = streamText({
      model: activeModel,
      system: systemPrompt,
      prompt: userPrompt,
      maxOutputTokens: 800,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    logger.error("api/ai/remediation-root-cause", "Failed to generate", error);
    return new Response("Failed to generate analysis", { status: 500 });
  }
}
