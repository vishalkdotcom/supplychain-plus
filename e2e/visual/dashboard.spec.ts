import { test, expect } from "@playwright/test";
import { mockAllAPIs } from "../helpers/setup";
import { forceTheme, getThemeFromProject } from "../helpers/theme";
import { waitForDashboardReady } from "../helpers/wait-for-charts";

test.beforeEach(async ({ page }, testInfo) => {
  await forceTheme(page, getThemeFromProject(testInfo.project.name));
  await mockAllAPIs(page);
});

test("full dashboard page", async ({ page }) => {
  await page.goto("/");
  await waitForDashboardReady(page);
  await expect(page).toHaveScreenshot("dashboard-full.png", {
    fullPage: true,
    mask: [page.locator(".animate-pulse")],
  });
});

test("metric cards section", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("text=Total Suppliers");
  const cards = page.locator(".grid.gap-4").first();
  await expect(cards).toHaveScreenshot("metric-cards.png");
});

test("geographic risk map", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("text=Geographic Risk Heatmap", {
    timeout: 15_000,
  });
  await page.waitForSelector("svg circle", { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(1000);

  const mapCard = page
    .locator("[class*='col-span']")
    .filter({ hasText: "Geographic Risk Heatmap" })
    .first();
  await expect(mapCard).toHaveScreenshot("geographic-risk-map.png", {
    mask: [page.locator(".animate-pulse")],
  });
});

test("supply chain network", async ({ page }) => {
  await page.goto("/");
  await page
    .waitForSelector(".react-flow__node", { timeout: 15_000 })
    .catch(() => {});
  await page.waitForTimeout(1000);

  const networkCard = page
    .locator("[class*='col-span']")
    .filter({ hasText: "Supply Chain Network" })
    .first();
  await expect(networkCard).toHaveScreenshot("supply-chain-network.png");
});

test("suppliers needing attention", async ({ page }) => {
  await page.goto("/");
  await waitForDashboardReady(page);

  const section = page
    .locator("div")
    .filter({ hasText: "Suppliers Needing Attention" })
    .locator("div.rounded-lg.border")
    .first();
  await expect(section).toHaveScreenshot("suppliers-needing-attention.png");
});

test("alerts center", async ({ page }) => {
  await page.goto("/");
  await waitForDashboardReady(page);

  const alertsSection = page
    .locator("div")
    .filter({ hasText: "Proactive Alerts" })
    .first();
  await expect(alertsSection).toHaveScreenshot("alerts-center.png");
});

test("AI activity stream", async ({ page }) => {
  await page.goto("/");
  await waitForDashboardReady(page);

  const activityCard = page
    .locator("div")
    .filter({ hasText: "AI Activity" })
    .locator("div")
    .filter({ hasText: "Recent automated actions" })
    .first();
  await expect(activityCard).toHaveScreenshot("ai-activity-stream.png");
});
