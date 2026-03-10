import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { model } from "@/lib/ai/provider";
import { surveyQuestionSchema } from "@/lib/ai/schemas";
import { SURVEY_GENERATION_PROMPT } from "@/lib/ai/prompts";

export const maxDuration = 60;

export async function POST(request: Request) {
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
    console.error("API Error in survey generation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
