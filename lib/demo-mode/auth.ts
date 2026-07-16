import type { NextRequest } from "next/server";
import { normalizePathname } from "@/lib/demo-mode/profile";
import {
  DEMO_SESSION_COOKIE_NAME,
  verifySession,
} from "@/lib/demo-mode/session";

const PUBLIC_APP_PATHS = new Set(["/login", "/not-in-demo"]);

const PUBLIC_API_PATHS = new Set([
  "/api/demo-auth/login",
  "/api/health",
]);

export function isPublicAppPath(pathname: string): boolean {
  return PUBLIC_APP_PATHS.has(normalizePathname(pathname));
}

export function isPublicApiPath(pathname: string): boolean {
  return PUBLIC_API_PATHS.has(normalizePathname(pathname));
}

export function isApiPath(pathname: string): boolean {
  return normalizePathname(pathname).startsWith("/api/");
}

export async function hasValidDemoSession(
  request: NextRequest,
): Promise<boolean> {
  const token = request.cookies.get(DEMO_SESSION_COOKIE_NAME)?.value;
  if (!token) return false;
  const session = await verifySession(token);
  return session !== null;
}
