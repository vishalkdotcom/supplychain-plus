import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isAuthRequired } from "@/lib/demo-mode/profile";
import {
  DEMO_SESSION_COOKIE_NAME,
  getSessionCookieOptions,
  signSession,
  verifyDemoCredentials,
} from "@/lib/demo-mode/session";

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  if (!isAuthRequired()) {
    return NextResponse.json({ error: "Demo auth is disabled" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  const { username, password } = parsed.data;

  if (!verifyDemoCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await signSession(username);
  const cookieStore = await cookies();
  cookieStore.set(DEMO_SESSION_COOKIE_NAME, token, getSessionCookieOptions());

  return NextResponse.json({ ok: true, username });
}
