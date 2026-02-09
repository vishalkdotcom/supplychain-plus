import { NextResponse } from "next/server";
import { llmService } from "@/lib/llm-service";

export async function POST(request: Request) {
  try {
    const { caseText } = await request.json();

    if (!caseText) {
      return NextResponse.json(
        { error: "Case text is required" },
        { status: 400 },
      );
    }

    const summary = await llmService.generateCaseSummary(caseText);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("API Error in summarization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
