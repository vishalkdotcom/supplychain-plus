import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { isAuthRequired } from "@/lib/demo-mode/profile";
import {
  DEMO_SESSION_COOKIE_NAME,
  DEMO_SESSION_MAX_AGE_SECONDS,
  getDemoCredentials,
  getSessionSecret,
  isDemoSessionOperational,
  isWeakSessionSecret,
  resolveSessionSecret,
  signSession,
  verifyDemoCredentials,
  verifySession,
} from "@/lib/demo-mode/session";

const ORIGINAL_ENV = { ...process.env };
const STRONG_SECRET = "01234567890123456789012345678901";

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("demo auth session", () => {
  test("uses DEMO_SESSION_SECRET when set to a strong value", () => {
    process.env.DEMO_SESSION_SECRET = STRONG_SECRET;
    expect(getSessionSecret()).toBe(STRONG_SECRET);
  });

  test("falls back to dev session secret outside production demo", () => {
    delete process.env.DEMO_SESSION_SECRET;
    delete process.env.DEMO_MODE;
    process.env.NODE_ENV = "test";

    expect(resolveSessionSecret()).toBe("dev-demo-session-secret-change-me");
    expect(getSessionSecret()).toBe("dev-demo-session-secret-change-me");
  });

  test("treats missing, short, and committed dev secrets as weak", () => {
    expect(isWeakSessionSecret(undefined)).toBe(true);
    expect(isWeakSessionSecret("")).toBe(true);
    expect(isWeakSessionSecret("short-secret")).toBe(true);
    expect(isWeakSessionSecret("dev-demo-session-secret-change-me")).toBe(true);
    expect(isWeakSessionSecret(STRONG_SECRET)).toBe(false);
  });

  test("fails closed in production demo mode without a strong secret", () => {
    process.env.DEMO_MODE = "true";
    process.env.NODE_ENV = "production";
    delete process.env.DEMO_SESSION_SECRET;

    expect(resolveSessionSecret()).toBeNull();
    expect(isDemoSessionOperational()).toBe(false);
    expect(() => getSessionSecret()).toThrow(
      "Demo session secret is missing or too weak for production Demo Mode",
    );
  });

  test("fails closed in production demo mode with the committed dev secret", () => {
    process.env.DEMO_MODE = "true";
    process.env.NODE_ENV = "production";
    process.env.DEMO_SESSION_SECRET = "dev-demo-session-secret-change-me";

    expect(resolveSessionSecret()).toBeNull();
    expect(isDemoSessionOperational()).toBe(false);
  });

  test("allows strong secrets in production demo mode", () => {
    process.env.DEMO_MODE = "true";
    process.env.NODE_ENV = "production";
    process.env.DEMO_SESSION_SECRET = STRONG_SECRET;

    expect(resolveSessionSecret()).toBe(STRONG_SECRET);
    expect(isDemoSessionOperational()).toBe(true);
  });

  test("reads demo credentials from env", () => {
    process.env.DEMO_USERNAME = "demo";
    process.env.DEMO_PASSWORD = "secret";

    expect(getDemoCredentials()).toEqual({
      username: "demo",
      password: "secret",
    });
  });

  test("returns null when demo credentials are incomplete", () => {
    process.env.DEMO_USERNAME = "demo";
    delete process.env.DEMO_PASSWORD;

    expect(getDemoCredentials()).toBeNull();
  });

  test("verifies configured demo credentials", () => {
    process.env.DEMO_USERNAME = "demo";
    process.env.DEMO_PASSWORD = "secret";

    expect(verifyDemoCredentials("demo", "secret")).toBe(true);
    expect(verifyDemoCredentials("demo", "wrong")).toBe(false);
    expect(verifyDemoCredentials("other", "secret")).toBe(false);
  });

  test("signs and verifies a demo session token", async () => {
    process.env.DEMO_SESSION_SECRET = STRONG_SECRET;

    const token = await signSession("demo");
    expect(token).not.toBeNull();

    const session = await verifySession(token!);

    expect(session).not.toBeNull();
    expect(session?.sub).toBe("demo");
    expect(session?.exp).toBeGreaterThan(session?.iat ?? 0);
  });

  test("does not mint sessions when production demo secret is unavailable", async () => {
    process.env.DEMO_MODE = "true";
    process.env.NODE_ENV = "production";
    delete process.env.DEMO_SESSION_SECRET;

    expect(await signSession("demo")).toBeNull();
    expect(await verifySession("payload.sig")).toBeNull();
  });

  test("rejects tampered session tokens", async () => {
    process.env.DEMO_SESSION_SECRET = STRONG_SECRET;

    const token = await signSession("demo");
    const tampered = `${token}x`;

    expect(await verifySession(tampered)).toBeNull();
  });

  test("rejects expired session tokens", async () => {
    process.env.DEMO_SESSION_SECRET = STRONG_SECRET;

    const realNow = Date.now;
    const expiredAt =
      (Math.floor(realNow() / 1000) - DEMO_SESSION_MAX_AGE_SECONDS - 60) * 1000;
    Date.now = () => expiredAt;

    try {
      const token = await signSession("demo");
      Date.now = realNow;
      expect(await verifySession(token!)).toBeNull();
    } finally {
      Date.now = realNow;
    }
  });

  test("exports stable cookie constants", () => {
    expect(DEMO_SESSION_COOKIE_NAME).toBe("demo_session");
    expect(DEMO_SESSION_MAX_AGE_SECONDS).toBe(60 * 60 * 24);
  });
});

describe("demo auth gate profile integration", () => {
  test("requires auth only when demo mode is on", () => {
    delete process.env.DEMO_MODE;
    expect(isAuthRequired()).toBe(false);

    process.env.DEMO_MODE = "true";
    expect(isAuthRequired()).toBe(true);
  });

  test("does not require demo login when demo mode is off", () => {
    delete process.env.DEMO_MODE;
    delete process.env.NEXT_PUBLIC_DEMO_MODE;

    expect(isAuthRequired()).toBe(false);
    expect(isDemoSessionOperational()).toBe(true);
  });
});
