import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { DEMO_SESSION_COOKIE_NAME } from "@/lib/demo-mode/session";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ ok: true });
}
