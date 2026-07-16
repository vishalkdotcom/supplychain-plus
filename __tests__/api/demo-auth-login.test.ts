import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

mock.module("next/headers", () => ({
  cookies: mock(() =>
    Promise.resolve({
      set: mock(() => {}),
    }),
  ),
}));

import { POST } from "@/app/api/demo-auth/login/route";

const ORIGINAL_ENV = { ...process.env };
const STRONG_SECRET = "01234567890123456789012345678901";

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("demo auth login route", () => {
  test("returns 404 when demo auth is disabled", async () => {
    delete process.env.DEMO_MODE;

    const res = await POST(
      new Request("http://localhost/api/demo-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "demo", password: "secret" }),
      }),
    );

    expect(res.status).toBe(404);
  });

  test("returns 503 when production demo mode has no strong session secret", async () => {
    process.env.DEMO_MODE = "true";
    process.env.NODE_ENV = "production";
    process.env.DEMO_USERNAME = "demo";
    process.env.DEMO_PASSWORD = "secret";
    delete process.env.DEMO_SESSION_SECRET;

    const res = await POST(
      new Request("http://localhost/api/demo-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "demo", password: "secret" }),
      }),
    );
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.error).toContain("not configured");
  });

  test("returns 401 for invalid credentials when demo sessions are operational", async () => {
    process.env.DEMO_MODE = "true";
    process.env.NODE_ENV = "production";
    process.env.DEMO_USERNAME = "demo";
    process.env.DEMO_PASSWORD = "secret";
    process.env.DEMO_SESSION_SECRET = STRONG_SECRET;

    const res = await POST(
      new Request("http://localhost/api/demo-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "demo", password: "wrong" }),
      }),
    );

    expect(res.status).toBe(401);
  });

  test("returns 200 for valid credentials when demo sessions are operational", async () => {
    process.env.DEMO_MODE = "true";
    process.env.NODE_ENV = "production";
    process.env.DEMO_USERNAME = "demo";
    process.env.DEMO_PASSWORD = "secret";
    process.env.DEMO_SESSION_SECRET = STRONG_SECRET;

    const res = await POST(
      new Request("http://localhost/api/demo-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "demo", password: "secret" }),
      }),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true, username: "demo" });
  });
});
