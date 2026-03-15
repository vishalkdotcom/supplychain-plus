import { test, expect } from "@playwright/test";
import { mockAllAPIs } from "../helpers/setup";
import { forceTheme, getThemeFromProject } from "../helpers/theme";
import { waitForPageReady } from "../helpers/wait-for-charts";

test.beforeEach(async ({ page }, testInfo) => {
  await forceTheme(page, getThemeFromProject(testInfo.project.name));
  await mockAllAPIs(page);
});

test("engage surveys page", async ({ page }) => {
  await page.goto("/engage");
  await waitForPageReady(page);
  await page.waitForSelector("text=Engage Insights");
  await expect(page).toHaveScreenshot("engage-surveys.png", {
    fullPage: true,
  });
});

test("AI survey designer card", async ({ page }) => {
  await page.goto("/engage");
  await waitForPageReady(page);

  const designerCard = page
    .locator("div")
    .filter({ hasText: "AI Survey Designer" })
    .first();
  await expect(designerCard).toHaveScreenshot("ai-survey-designer.png");
});

test("recent surveys list", async ({ page }) => {
  await page.goto("/engage");
  await waitForPageReady(page);

  const surveysList = page
    .locator("div")
    .filter({ hasText: "Recent Surveys" })
    .first();
  await expect(surveysList).toHaveScreenshot("recent-surveys.png");
});
