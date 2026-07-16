import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { formatAge, formatFreshnessAge } from "@/lib/format-age";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("format-age with demo as-of", () => {
  test("formatAge uses wall clock when demo mode is off", () => {
    delete process.env.DEMO_MODE;
    delete process.env.DEMO_AS_OF;

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    expect(formatAge(threeDaysAgo.toISOString())).toBe("3 days ago");
  });

  test("formatAge uses demo as-of when demo mode is on", () => {
    process.env.DEMO_MODE = "true";
    process.env.DEMO_AS_OF = "2025-06-15T12:00:00.000Z";

    expect(formatAge("2025-06-12T12:00:00.000Z")).toBe("3 days ago");
    expect(formatAge("2025-06-15T12:00:00.000Z")).toBe("today");
  });

  test("formatFreshnessAge classifies relative to demo as-of", () => {
    process.env.DEMO_MODE = "true";
    process.env.DEMO_AS_OF = "2025-06-15T12:00:00.000Z";

    const recent = formatFreshnessAge("2025-06-15T10:00:00.000Z");
    expect(recent.text).toBe("2h ago");
    expect(recent.level).toBe("fresh");

    const aging = formatFreshnessAge("2025-06-10T12:00:00.000Z");
    expect(aging.level).toBe("aging");
  });
});
