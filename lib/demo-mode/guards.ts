import { NextResponse } from "next/server";
import { areJobsExecutable, areMutationsAllowed } from "@/lib/demo-mode/profile";

export function rejectIfDemoMutation(): NextResponse | null {
  if (!areMutationsAllowed()) {
    return NextResponse.json(
      { error: "Demo Mode is read-only" },
      { status: 403 },
    );
  }
  return null;
}

export function rejectIfDemoJobExecution(): NextResponse | null {
  if (!areJobsExecutable()) {
    return NextResponse.json(
      { error: "Jobs cannot run in Demo Mode" },
      { status: 403 },
    );
  }
  return null;
}
