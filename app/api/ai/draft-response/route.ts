import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getModelFromRequest } from "@/lib/ai/provider";
import { logger } from "@/lib/logger";
import { rejectIfDemoAiOutsideChat } from "@/lib/demo-mode/guards";

export const maxDuration = 30;

export async function POST(request: Request) {
  const blocked = rejectIfDemoAiOutsideChat("/api/ai/draft-response");
  if (blocked) return blocked;

  try {
    const { caseText, language, tone, currentDraft } = await request.json();

    if (!caseText) {
      return NextResponse.json(
        { error: "Case text is required" },
        { status: 400 },
      );
    }

    const activeModel = getModelFromRequest(request);

    const prompt = `
      You are a case manager handling worker grievances.
      
      Original Worker Message:
      "${caseText}"
      
      ${currentDraft ? `Current Draft Response: "${currentDraft}"` : ""}
      
      Please write a new draft response to the worker. 
      The response MUST be in this language: ${language || "English"}.
      The tone MUST be: ${tone || "Professional"}.
      
      Keep it between 50-80 words. Be empathetic but clear about next steps. Do not include any placeholder text like [Name]. If you don't know something, use a generic sign-off like "The Case Management Team".
      
      Provide ONLY the raw text of the response, no quotes, no markdown, no preamble.
    `;

    const { text } = await generateText({ 
      model: activeModel, 
      prompt 
    });

    return NextResponse.json({ draftResponse: text.trim() });
  } catch (error) {
    logger.error("ai/draft-response", "Draft response generation failed", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
