import { test, expect } from "@playwright/test";
import { mockAllAPIs } from "../helpers/setup";
import { forceTheme, getThemeFromProject } from "../helpers/theme";
import { waitForDashboardReady } from "../helpers/wait-for-charts";

test.beforeEach(async ({ page }, testInfo) => {
  await forceTheme(page, getThemeFromProject(testInfo.project.name));
  await mockAllAPIs(page);
});

test("sidebar expanded", async ({ page }) => {
  await page.goto("/");
  await waitForDashboardReady(page);

  // Sidebar is expanded by default on desktop
  await expect(page).toHaveScreenshot("sidebar-expanded.png", {
    mask: [page.locator(".animate-pulse")],
  });
});

test("sidebar collapsed", async ({ page }, testInfo) => {
  // Only meaningful on desktop viewports where sidebar is visible
  if (testInfo.project.name.includes("mobile")) {
    test.skip();
    return;
  }

  await page.goto("/");
  await waitForDashboardReady(page);

  // Click the sidebar rail to collapse
  const rail = page.locator('[data-sidebar="rail"]');
  if (await rail.isVisible()) {
    await rail.click();
    await page.waitForTimeout(500); // transition
  }

  await expect(page).toHaveScreenshot("sidebar-collapsed.png", {
    mask: [page.locator(".animate-pulse")],
  });
});
