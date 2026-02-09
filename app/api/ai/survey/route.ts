import { NextResponse } from "next/server";
import { llmService } from "@/lib/llm-service";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const questions = await llmService.generateSurveyQuestions(prompt);
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("API Error in survey generation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
