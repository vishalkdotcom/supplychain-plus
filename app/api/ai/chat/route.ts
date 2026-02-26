import { streamText, convertToModelMessages, UIMessage, stepCountIs } from "ai";
import { model } from "@/lib/ai/provider";
import { CHAT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import {
  querySupplierRisk,
  queryCases,
  querySurveys,
  queryTrainingCompletion,
  getAlerts,
  markAlertRead,
  triggerRiskRecalculation,
} from "@/lib/ai/tools";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model,
    system: CHAT_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: {
      querySupplierRisk,
      queryCases,
      querySurveys,
      queryTrainingCompletion,
      getAlerts,
      markAlertRead,
      triggerRiskRecalculation,
    },
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}
