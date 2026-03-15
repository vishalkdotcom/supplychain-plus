import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./visual",
  snapshotDir: "./screenshots",
  snapshotPathTemplate:
    "{snapshotDir}/{testFilePath}/{arg}-{projectName}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",

  use: {
    baseURL: "http://localhost:3030",
    screenshot: "off",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "desktop-light",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        colorScheme: "light",
      },
    },
    {
      name: "desktop-dark",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        colorScheme: "dark",
      },
    },
    {
      name: "tablet-light",
      use: {
        ...devices["iPad (gen 7)"],
        colorScheme: "light",
      },
    },
    {
      name: "tablet-dark",
      use: {
        ...devices["iPad (gen 7)"],
        colorScheme: "dark",
      },
    },
    {
      name: "mobile-light",
      use: {
        ...devices["iPhone 14"],
        colorScheme: "light",
      },
    },
    {
      name: "mobile-dark",
      use: {
        ...devices["iPhone 14"],
        colorScheme: "dark",
      },
    },
  ],

  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
      animations: "disabled",
    },
  },

  webServer: {
    command: "bun run dev",
    port: 3030,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
