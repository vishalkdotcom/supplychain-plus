import { test, expect } from "@playwright/test";
import { mockAllAPIs } from "../helpers/setup";
import { forceTheme, getThemeFromProject } from "../helpers/theme";
import { waitForPageReady } from "../helpers/wait-for-charts";

test.beforeEach(async ({ page }, testInfo) => {
  await forceTheme(page, getThemeFromProject(testInfo.project.name));
  await mockAllAPIs(page);
});

test("suppliers grid view", async ({ page }) => {
  await page.goto("/suppliers");
  await waitForPageReady(page);
  await page.waitForSelector("text=Suppliers");
  await expect(page).toHaveScreenshot("suppliers-grid.png", {
    fullPage: true,
  });
});

test("suppliers header and filters", async ({ page }) => {
  await page.goto("/suppliers");
  await waitForPageReady(page);

  const header = page.locator(".space-y-6").first();
  await expect(header).toHaveScreenshot("suppliers-header-filters.png");
});

test("individual supplier card", async ({ page }) => {
  await page.goto("/suppliers");
  await waitForPageReady(page);

  const firstCard = page.locator(".grid.gap-4 > a").first();
  await expect(firstCard).toHaveScreenshot("supplier-card.png");
});
