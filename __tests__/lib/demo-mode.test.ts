import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  areJobsExecutable,
  areMutationsAllowed,
  daysAgo,
  getDemoAsOf,
  getDemoAsOfLabel,
  isAuthRequired,
  isDemoMode,
  isRouteAllowed,
  isToolAllowed,
  now,
  subtractDays,
} from "@/lib/demo-mode/profile";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("demo mode profile", () => {
  describe("when demo mode is off", () => {
    test("uses wall clock for now()", () => {
      delete process.env.DEMO_MODE;
      delete process.env.DEMO_AS_OF;

      const before = Date.now();
      const current = now().getTime();
      const after = Date.now();

      expect(current).toBeGreaterThanOrEqual(before);
      expect(current).toBeLessThanOrEqual(after);
    });

    test("allows all routes, mutations, jobs, and tools", () => {
      delete process.env.DEMO_MODE;

      expect(isRouteAllowed("/connect")).toBe(true);
      expect(isRouteAllowed("/educate")).toBe(true);
      expect(areMutationsAllowed()).toBe(true);
      expect(areJobsExecutable()).toBe(true);
      expect(isAuthRequired()).toBe(false);
      expect(isToolAllowed("queryCases")).toBe(true);
      expect(isToolAllowed("markAlertRead")).toBe(true);
    });
  });

  describe("when demo mode is on", () => {
    beforeEach(() => {
      process.env.DEMO_MODE = "true";
      process.env.DEMO_AS_OF = "2025-06-15T12:00:00.000Z";
    });

    test("reads demo mode and as-of configuration", () => {
      expect(isDemoMode()).toBe(true);
      expect(getDemoAsOf()?.toISOString()).toBe("2025-06-15T12:00:00.000Z");
      expect(getDemoAsOfLabel()).toBe("June 15, 2025");
    });

    test("uses demo as-of for now() and window helpers", () => {
      expect(now().toISOString()).toBe("2025-06-15T12:00:00.000Z");
      expect(daysAgo(7).toISOString()).toBe("2025-06-08T12:00:00.000Z");

      const base = new Date("2025-06-15T12:00:00.000Z");
      expect(subtractDays(base, 3).toISOString()).toBe("2025-06-12T12:00:00.000Z");
    });

    test("allows intelligence-first routes and blocks source-backed routes", () => {
      expect(isRouteAllowed("/")).toBe(true);
      expect(isRouteAllowed("/ai")).toBe(true);
      expect(isRouteAllowed("/connect/clusters")).toBe(true);
      expect(isRouteAllowed("/connect/payslip-anomalies")).toBe(true);
      expect(isRouteAllowed("/engage/voice-trends")).toBe(true);
      expect(isRouteAllowed("/intelligence/regional-insights")).toBe(true);
      expect(isRouteAllowed("/remediation/plan-1")).toBe(true);
      expect(isRouteAllowed("/operations/jobs")).toBe(true);
      expect(isRouteAllowed("/login")).toBe(true);

      expect(isRouteAllowed("/connect")).toBe(false);
      expect(isRouteAllowed("/engage")).toBe(false);
      expect(isRouteAllowed("/educate")).toBe(false);
      expect(isRouteAllowed("/connect/inbox")).toBe(false);
      expect(isRouteAllowed("/engage/surveys/1")).toBe(false);
    });

    test("normalizes trailing slashes and query strings", () => {
      expect(isRouteAllowed("/ai/")).toBe(true);
      expect(isRouteAllowed("/connect/?tab=inbox")).toBe(false);
      expect(isRouteAllowed("/connect/clusters?page=2")).toBe(true);
    });

    test("disables mutations, jobs, and requires auth", () => {
      expect(areMutationsAllowed()).toBe(false);
      expect(areJobsExecutable()).toBe(false);
      expect(isAuthRequired()).toBe(true);
    });

    test("allows derived read tools only", () => {
      expect(isToolAllowed("querySupplierRisk")).toBe(true);
      expect(isToolAllowed("queryClusters")).toBe(true);
      expect(isToolAllowed("queryRemediations")).toBe(true);

      expect(isToolAllowed("queryCases")).toBe(false);
      expect(isToolAllowed("querySurveys")).toBe(false);
      expect(isToolAllowed("queryTrainingCompletion")).toBe(false);
      expect(isToolAllowed("markAlertRead")).toBe(false);
      expect(isToolAllowed("triggerRiskRecalculation")).toBe(false);
    });
  });

  test('treats DEMO_MODE="1" as enabled', () => {
    process.env.DEMO_MODE = "1";
    process.env.DEMO_AS_OF = "2025-01-01T00:00:00.000Z";

    expect(isDemoMode()).toBe(true);
  });
});
