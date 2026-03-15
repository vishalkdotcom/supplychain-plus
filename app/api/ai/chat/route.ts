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
  queryPlaybook,
} from "@/lib/ai/tools";
import { db } from "@/lib/db/drizzle";
import { aiChatHistory } from "@/lib/db/schema";
import { logger } from "@/lib/logger";

export const maxDuration = 30;

const SESSION_ID_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;

export async function POST(req: Request) {
  const { messages, sessionId: rawSessionId }: { messages: UIMessage[]; sessionId?: string } =
    await req.json();

  // Validate sessionId format to prevent injection and session hijacking
  const sessionId = rawSessionId && SESSION_ID_PATTERN.test(rawSessionId) ? rawSessionId : undefined;

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
        logger.error("ai/chat", "Failed to save user message", e);
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
      queryPlaybook,
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
          logger.error("ai/chat", "Failed to save assistant message", e);
        }
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
