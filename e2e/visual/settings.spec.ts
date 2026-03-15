import { test, expect } from "@playwright/test";
import { mockAllAPIs } from "../helpers/setup";
import { forceTheme, getThemeFromProject } from "../helpers/theme";
import { waitForPageReady } from "../helpers/wait-for-charts";

test.beforeEach(async ({ page }, testInfo) => {
  await forceTheme(page, getThemeFromProject(testInfo.project.name));
  await mockAllAPIs(page);
});

test("settings page", async ({ page }) => {
  await page.goto("/settings");
  await waitForPageReady(page);
  await expect(page).toHaveScreenshot("settings-page.png", {
    fullPage: true,
  });
});
