import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { model } from "@/lib/ai/provider";
import { surveyQuestionSchema } from "@/lib/ai/schemas";
import { SURVEY_GENERATION_PROMPT } from "@/lib/ai/prompts";
import { logger } from "@/lib/logger";
import { rejectIfDemoAiOutsideChat } from "@/lib/demo-mode/guards";

export const maxDuration = 60;

export async function POST(request: Request) {
  const blocked = rejectIfDemoAiOutsideChat("/api/ai/survey");
  if (blocked) return blocked;

  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const { output } = await generateText({
      model,
      system: SURVEY_GENERATION_PROMPT,
      prompt,
      output: Output.array({ element: surveyQuestionSchema }),
    });

    return NextResponse.json({ questions: output || [] });
  } catch (error) {
    logger.error("ai/survey", "Survey generation failed", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
