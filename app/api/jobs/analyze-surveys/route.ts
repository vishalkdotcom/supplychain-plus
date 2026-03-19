import { NextResponse } from "next/server";
import { withJobTracking } from "@/lib/jobs/with-job-tracking";
import { analyzeSurveys } from "@/lib/jobs/handlers/analyze-surveys";

async function _postHandler(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await analyzeSurveys({ surveyId: body?.surveyId });
  if (!result.success) {
    return NextResponse.json({ error: "Survey analysis failed" }, { status: 500 });
  }
  return NextResponse.json(result);
}

export const POST = withJobTracking("analyze-surveys", _postHandler);
