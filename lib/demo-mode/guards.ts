import { NextResponse } from "next/server";
import {
  areJobsExecutable,
  areMutationsAllowed,
  evaluateDemoApiPolicy,
  isDemoMode,
  normalizePathname,
} from "@/lib/demo-mode/profile";

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

export function rejectIfDemoApiNotAllowed(pathname: string): NextResponse | null {
  if (!isDemoMode()) return null;

  if (!evaluateDemoApiPolicy(pathname)) {
    return NextResponse.json(
      { error: "Not available in Demo Mode" },
      { status: 403 },
    );
  }
  return null;
}

/** Blocks AI routes that spend LLM quota outside the intended chat assistant flow. */
export function rejectIfDemoAiOutsideChat(pathname: string): NextResponse | null {
  if (!isDemoMode()) return null;

  const path = normalizePathname(pathname);
  if (path.startsWith("/api/ai/") && path !== "/api/ai/chat") {
    return NextResponse.json(
      { error: "AI feature not available in Demo Mode" },
      { status: 403 },
    );
  }
  return null;
}
