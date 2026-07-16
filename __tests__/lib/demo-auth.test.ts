import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { isAuthRequired } from "@/lib/demo-mode/profile";
import {
  DEMO_SESSION_COOKIE_NAME,
  DEMO_SESSION_MAX_AGE_SECONDS,
  getDemoCredentials,
  getSessionSecret,
  signSession,
  verifyDemoCredentials,
  verifySession,
} from "@/lib/demo-mode/session";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("demo auth session", () => {
  test("uses DEMO_SESSION_SECRET when set", () => {
    process.env.DEMO_SESSION_SECRET = "test-secret";
    expect(getSessionSecret()).toBe("test-secret");
  });

  test("falls back to dev session secret", () => {
    delete process.env.DEMO_SESSION_SECRET;
    expect(getSessionSecret()).toBe("dev-demo-session-secret-change-me");
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
    process.env.DEMO_SESSION_SECRET = "roundtrip-secret";

    const token = await signSession("demo");
    const session = await verifySession(token);

    expect(session).not.toBeNull();
    expect(session?.sub).toBe("demo");
    expect(session?.exp).toBeGreaterThan(session?.iat ?? 0);
  });

  test("rejects tampered session tokens", async () => {
    process.env.DEMO_SESSION_SECRET = "roundtrip-secret";

    const token = await signSession("demo");
    const tampered = `${token}x`;

    expect(await verifySession(tampered)).toBeNull();
  });

  test("rejects expired session tokens", async () => {
    process.env.DEMO_SESSION_SECRET = "expired-secret";

    const realNow = Date.now;
    const expiredAt =
      (Math.floor(realNow() / 1000) - DEMO_SESSION_MAX_AGE_SECONDS - 60) * 1000;
    Date.now = () => expiredAt;

    try {
      const token = await signSession("demo");
      Date.now = realNow;
      expect(await verifySession(token)).toBeNull();
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
});
