import { NextResponse } from "next/server";
import { withJobTracking } from "@/lib/jobs/with-job-tracking";
import { payslipAnomaly } from "@/lib/jobs/handlers/payslip-anomaly";

export const maxDuration = 300;

async function _postHandler(_request: Request) {
  const result = await payslipAnomaly();
  if (!result.success) {
    return NextResponse.json({ error: "Payslip anomaly detection failed" }, { status: 500 });
  }
  return NextResponse.json(result);
}

export const POST = withJobTracking("payslip-anomaly", _postHandler);
