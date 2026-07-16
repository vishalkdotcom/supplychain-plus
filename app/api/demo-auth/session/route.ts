import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAuthRequired } from "@/lib/demo-mode/profile";
import {
  DEMO_SESSION_COOKIE_NAME,
  verifySession,
} from "@/lib/demo-mode/session";

export async function GET() {
  if (!isAuthRequired()) {
    return NextResponse.json({ authenticated: false, demoMode: false });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(DEMO_SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    return NextResponse.json({ authenticated: false, demoMode: true });
  }

  return NextResponse.json({
    authenticated: true,
    demoMode: true,
    username: session.sub,
    expiresAt: session.exp,
  });
}
