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
import { db } from "@/lib/db/drizzle";
import { aiChatHistory } from "@/lib/db/schema";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, sessionId }: { messages: UIMessage[]; sessionId?: string } =
    await req.json();

  // Save the latest user message
  const latestUserMessage = messages[messages.length - 1];
  if (sessionId && latestUserMessage?.role === "user") {
    const textContent = latestUserMessage.parts
      ?.filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("\n");
    if (textContent) {
      try {
        await db.insert(aiChatHistory).values({
          sessionId,
          role: "user",
          content: textContent,
        });
      } catch (e) {
        console.error("Failed to save user message:", e);
      }
    }
  }

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
    onFinish: async ({ text }) => {
      // Save assistant response to chat history
      if (sessionId && text) {
        try {
          await db.insert(aiChatHistory).values({
            sessionId,
            role: "assistant",
            content: text,
          });
        } catch (e) {
          console.error("Failed to save assistant message:", e);
        }
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
