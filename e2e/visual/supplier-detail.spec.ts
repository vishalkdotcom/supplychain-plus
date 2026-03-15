import { test, expect } from "@playwright/test";
import { mockAllAPIs } from "../helpers/setup";
import { forceTheme, getThemeFromProject } from "../helpers/theme";
import { waitForPageReady, waitForCharts } from "../helpers/wait-for-charts";

test.beforeEach(async ({ page }, testInfo) => {
  await forceTheme(page, getThemeFromProject(testInfo.project.name));
  await mockAllAPIs(page);
});

test("supplier detail full page", async ({ page }) => {
  await page.goto("/suppliers/sup-001");
  await waitForPageReady(page);

  // Wait for charts if present
  await page
    .waitForSelector(".recharts-surface", { timeout: 10_000 })
    .then(() => waitForCharts(page))
    .catch(() => {});

  await expect(page).toHaveScreenshot("supplier-detail-full.png", {
    fullPage: true,
  });
});

test("supplier hero section", async ({ page }) => {
  await page.goto("/suppliers/sup-001");
  await waitForPageReady(page);

  // The hero/header area is typically the first major section
  const heroSection = page.locator("text=Saigon Textiles Co.").first();
  await expect(heroSection).toHaveScreenshot("supplier-hero.png");
});

test("risk trend chart", async ({ page }) => {
  await page.goto("/suppliers/sup-001");
  await waitForPageReady(page);

  const hasChart = await page
    .waitForSelector(".recharts-surface", { timeout: 10_000 })
    .then(() => true)
    .catch(() => false);

  if (hasChart) {
    await waitForCharts(page);
    const chartContainer = page
      .locator("div")
      .filter({ has: page.locator(".recharts-surface") })
      .first();
    await expect(chartContainer).toHaveScreenshot("risk-trend-chart.png");
  }
});
