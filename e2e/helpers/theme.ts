import { Page } from "@playwright/test";

/**
 * Force a specific theme before navigating.
 * Must be called BEFORE page.goto() so the init script runs first.
 */
export async function forceTheme(page: Page, theme: "light" | "dark") {
  await page.addInitScript((t) => {
    window.localStorage.setItem("theme", t);
  }, theme);
}

/**
 * Derive the theme from the Playwright project name.
 * Project names follow the pattern: "desktop-light", "mobile-dark", etc.
 */
export function getThemeFromProject(
  projectName: string | undefined,
): "light" | "dark" {
  if (projectName?.includes("dark")) return "dark";
  return "light";
}
