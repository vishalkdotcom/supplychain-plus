import { Page } from "@playwright/test";
import * as fixtures from "../fixtures/mock-data";

/**
 * Intercept all /api/* routes and return deterministic mock data.
 * Call this in beforeEach before any page.goto().
 */
export async function mockAllAPIs(page: Page) {
  // Dashboard metrics
  await page.route("**/api/metrics", (route) =>
    route.fulfill({ json: fixtures.mockMetrics }),
  );

  // Activities
  await page.route("**/api/activities", (route) =>
    route.fulfill({ json: fixtures.mockActivities }),
  );

  // Alerts (supports query params)
  await page.route("**/api/alerts*", (route) => {
    if (route.request().method() === "PATCH") {
      return route.fulfill({ status: 200, json: { ok: true } });
    }
    return route.fulfill({ json: fixtures.mockAlerts });
  });

  // Recommendations
  await page.route("**/api/recommendations*", (route) =>
    route.fulfill({ json: fixtures.mockRecommendations }),
  );

  // Supplier training
  await page.route("**/api/suppliers/*/training", (route) =>
    route.fulfill({ json: fixtures.mockSupplierTraining }),
  );

  // Supplier history
  await page.route("**/api/suppliers/*/history", (route) =>
    route.fulfill({ json: fixtures.mockRiskHistory }),
  );

  // Individual supplier
  await page.route(/\/api\/suppliers\/[^/]+$/, (route) => {
    const url = route.request().url();
    const id = url.split("/").pop();
    return route.fulfill({ json: fixtures.mockSupplier(id) });
  });

  // Suppliers list (must come after more-specific supplier routes)
  await page.route("**/api/suppliers?*", (route) => {
    const url = new URL(route.request().url());
    const pg = parseInt(url.searchParams.get("page") || "1");
    const perPage = parseInt(url.searchParams.get("perPage") || "12");
    return route.fulfill({
      json: fixtures.mockSuppliersResponse(pg, perPage),
    });
  });
  await page.route("**/api/suppliers", (route) => {
    if (route.request().url().includes("?")) return route.fallback();
    return route.fulfill({ json: fixtures.mockSuppliersResponse() });
  });

  // Cases
  await page.route(/\/api\/cases\/[^/]+$/, (route) =>
    route.fulfill({ json: fixtures.mockCase }),
  );
  await page.route("**/api/cases*", (route) => {
    if (/\/api\/cases\/[^/?]/.test(route.request().url()))
      return route.fallback();
    const url = new URL(route.request().url());
    const pg = parseInt(url.searchParams.get("page") || "1");
    const perPage = parseInt(url.searchParams.get("perPage") || "8");
    return route.fulfill({
      json: fixtures.mockCasesResponse(pg, perPage),
    });
  });

  // Surveys
  await page.route("**/api/surveys*", (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 200,
        json: { message: "Draft saved", id: "survey-new" },
      });
    }
    const url = new URL(route.request().url());
    const pg = parseInt(url.searchParams.get("page") || "1");
    const perPage = parseInt(url.searchParams.get("perPage") || "8");
    return route.fulfill({
      json: fixtures.mockSurveysResponse(pg, perPage),
    });
  });

  // Courses
  await page.route("**/api/courses*", (route) => {
    const url = new URL(route.request().url());
    const pg = parseInt(url.searchParams.get("page") || "1");
    const perPage = parseInt(url.searchParams.get("perPage") || "8");
    return route.fulfill({
      json: fixtures.mockCoursesResponse(pg, perPage),
    });
  });

  // Timeline
  await page.route("**/api/timeline*", (route) =>
    route.fulfill({ json: fixtures.mockTimeline }),
  );

  // AI endpoints — return empty/mock responses
  await page.route("**/api/ai/**", (route) =>
    route.fulfill({ status: 200, json: { message: "mock" } }),
  );

  // Jobs endpoints
  await page.route("**/api/jobs/**", (route) =>
    route.fulfill({ status: 200, json: { ok: true } }),
  );
}
