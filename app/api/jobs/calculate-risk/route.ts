import { NextResponse } from "next/server";
import { withJobTracking } from "@/lib/jobs/with-job-tracking";
import { calculateRisk } from "@/lib/jobs/handlers/calculate-risk";

async function _postHandler(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await calculateRisk({ supplierId: body?.supplierId });
  if (!result.success) {
    return NextResponse.json({ error: "Risk calculation failed" }, { status: 500 });
  }
  return NextResponse.json(result);
}

export const POST = withJobTracking("calculate-risk", _postHandler);
