import { test, expect } from "@playwright/test";
import { mockAllAPIs } from "../helpers/setup";
import { forceTheme, getThemeFromProject } from "../helpers/theme";
import { waitForDashboardReady, waitForPageReady } from "../helpers/wait-for-charts";

test.beforeEach(async ({ page }, testInfo) => {
  await forceTheme(page, getThemeFromProject(testInfo.project.name));
  await mockAllAPIs(page);
});

test("app sidebar navigation", async ({ page }, testInfo) => {
  if (testInfo.project.name.includes("mobile")) {
    test.skip();
    return;
  }

  await page.goto("/");
  await waitForDashboardReady(page);

  const sidebar = page.locator('[data-sidebar="sidebar"]').first();
  if (await sidebar.isVisible()) {
    await expect(sidebar).toHaveScreenshot("sidebar-nav.png");
  }
});

test("app header", async ({ page }) => {
  await page.goto("/");
  await waitForDashboardReady(page);

  const header = page.locator("header").first();
  if (await header.isVisible()) {
    await expect(header).toHaveScreenshot("app-header.png");
  }
});

test("supplier card component", async ({ page }) => {
  await page.goto("/suppliers");
  await waitForPageReady(page);

  const cards = page.locator(".grid.gap-4 > a");
  const count = await cards.count();

  if (count > 0) {
    // Screenshot first card (high risk)
    await expect(cards.first()).toHaveScreenshot("supplier-card-first.png");
  }

  if (count > 2) {
    // Screenshot a different card for variety
    await expect(cards.nth(2)).toHaveScreenshot("supplier-card-third.png");
  }
});

test("case list item", async ({ page }) => {
  await page.goto("/connect");
  await waitForPageReady(page);

  const firstCase = page
    .locator("a.flex.items-start")
    .first();
  if (await firstCase.isVisible()) {
    await expect(firstCase).toHaveScreenshot("case-list-item.png");
  }
});

test("survey list item", async ({ page }) => {
  await page.goto("/engage");
  await waitForPageReady(page);

  const firstSurvey = page
    .locator(".rounded-lg.border")
    .filter({ hasText: "Risk:" })
    .first();
  if (await firstSurvey.isVisible()) {
    await expect(firstSurvey).toHaveScreenshot("survey-list-item.png");
  }
});
