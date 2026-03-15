import { Page } from "@playwright/test";

/**
 * Wait for the dashboard to be fully rendered:
 * metric cards, geographic map markers, and ReactFlow network nodes.
 */
export async function waitForDashboardReady(page: Page) {
  // Wait for metric cards content
  await page.waitForSelector("text=Total Suppliers", { timeout: 15_000 });

  // Wait for map SVG circles (supplier markers)
  await page
    .waitForSelector("svg circle", { timeout: 15_000 })
    .catch(() => {
      // Map may not render on very small viewports — that's ok
    });

  // Wait for ReactFlow nodes
  await page
    .waitForSelector(".react-flow__node", { timeout: 15_000 })
    .catch(() => {
      // Network graph may not render on small viewports
    });

  // Wait for fonts and settle rendering
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);
}

/**
 * Wait for Recharts SVG surfaces to finish rendering.
 * Recharts uses JS-based animations (requestAnimationFrame),
 * so we need a timeout after the surface appears.
 */
export async function waitForCharts(page: Page) {
  await page.waitForSelector(".recharts-surface", { timeout: 15_000 });
  await page.waitForTimeout(1500);
}

/**
 * Wait for basic page content to load (non-dashboard pages).
 * Waits for the loading spinner to disappear and fonts to load.
 */
export async function waitForPageReady(page: Page) {
  // Wait for the loading spinner to be gone
  await page.waitForSelector(".animate-spin", {
    state: "hidden",
    timeout: 15_000,
  }).catch(() => {
    // Page may have loaded so fast the spinner was never visible
  });

  // Wait for fonts
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
}
