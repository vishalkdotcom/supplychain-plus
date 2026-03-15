import { test, expect } from "@playwright/test";
import { mockAllAPIs } from "../helpers/setup";
import { forceTheme, getThemeFromProject } from "../helpers/theme";
import { waitForPageReady } from "../helpers/wait-for-charts";

test.beforeEach(async ({ page }, testInfo) => {
  await forceTheme(page, getThemeFromProject(testInfo.project.name));
  await mockAllAPIs(page);
});

test("connect cases list", async ({ page }) => {
  await page.goto("/connect");
  await waitForPageReady(page);
  await page.waitForSelector("text=Connect Intelligence");
  await expect(page).toHaveScreenshot("connect-cases-list.png", {
    fullPage: true,
  });
});

test("case inbox card", async ({ page }) => {
  await page.goto("/connect");
  await waitForPageReady(page);

  const caseInbox = page
    .locator("div")
    .filter({ hasText: "Case Inbox" })
    .first();
  await expect(caseInbox).toHaveScreenshot("case-inbox.png");
});

test("case detail page", async ({ page }) => {
  await page.goto("/connect/CASE-2026-001");
  await waitForPageReady(page);
  await expect(page).toHaveScreenshot("case-detail.png", {
    fullPage: true,
  });
});
