import { describe, expect, test } from "bun:test";
import { sanitizeLoginRedirect } from "@/lib/demo-mode/redirect";

describe("login redirect sanitization", () => {
  test("accepts safe same-origin paths", () => {
    expect(sanitizeLoginRedirect("/")).toBe("/");
    expect(sanitizeLoginRedirect("/ai")).toBe("/ai");
    expect(sanitizeLoginRedirect("/suppliers/acme")).toBe("/suppliers/acme");
    expect(sanitizeLoginRedirect(" /intelligence ")).toBe("/intelligence");
  });

  test("rejects protocol-relative and absolute external URLs", () => {
    expect(sanitizeLoginRedirect("//evil.example/phish")).toBe("/");
    expect(sanitizeLoginRedirect("https://evil.example/phish")).toBe("/");
    expect(sanitizeLoginRedirect("http://evil.example/phish")).toBe("/");
    expect(sanitizeLoginRedirect("/\\evil.example/phish")).toBe("/");
    expect(sanitizeLoginRedirect("/path://evil.example")).toBe("/");
  });

  test("rejects encoded open redirects", () => {
    expect(sanitizeLoginRedirect("%2F%2Fevil.example/phish")).toBe("/");
    expect(sanitizeLoginRedirect("%2F%2F%2Fevil.example/phish")).toBe("/");
  });

  test("falls back for empty or invalid values", () => {
    expect(sanitizeLoginRedirect(undefined)).toBe("/");
    expect(sanitizeLoginRedirect(null)).toBe("/");
    expect(sanitizeLoginRedirect("")).toBe("/");
    expect(sanitizeLoginRedirect("evil.example/phish")).toBe("/");
    expect(sanitizeLoginRedirect("%")).toBe("/");
  });
});
