export const DEMO_SESSION_COOKIE_NAME = "demo_session";
export const DEMO_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

const DEV_SESSION_SECRET = "dev-demo-session-secret-change-me";

interface DemoSessionPayload {
  sub: string;
  iat: number;
  exp: number;
}

export function getSessionSecret(): string {
  return process.env.DEMO_SESSION_SECRET ?? DEV_SESSION_SECRET;
}

export function getDemoCredentials(): { username: string; password: string } | null {
  const username = process.env.DEMO_USERNAME;
  const password = process.env.DEMO_PASSWORD;
  if (!username || !password) return null;
  return { username, password };
}

export function verifyDemoCredentials(
  username: string,
  password: string,
): boolean {
  const credentials = getDemoCredentials();
  if (!credentials) return false;
  return (
    timingSafeEqual(username, credentials.username) &&
    timingSafeEqual(password, credentials.password)
  );
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: DEMO_SESSION_MAX_AGE_SECONDS,
  };
}

export async function signSession(username: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: DemoSessionPayload = {
    sub: username,
    iat: now,
    exp: now + DEMO_SESSION_MAX_AGE_SECONDS,
  };
  const payloadPart = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmacSign(payloadPart);
  return `${payloadPart}.${signature}`;
}

export async function verifySession(
  token: string,
): Promise<DemoSessionPayload | null> {
  const separatorIndex = token.lastIndexOf(".");
  if (separatorIndex <= 0) return null;

  const payloadPart = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  if (!payloadPart || !signature) return null;

  const expectedSignature = await hmacSign(payloadPart);
  if (!timingSafeEqual(signature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(payloadPart)) as DemoSessionPayload;
    if (
      typeof payload.sub !== "string" ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function base64UrlEncode(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(normalized + padding);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function hmacSign(payloadPart: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadPart),
  );
  return base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signature)),
  );
}
