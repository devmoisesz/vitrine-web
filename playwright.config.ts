import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./test/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 120000,
  expect: { timeout: 30000 },
  reporter: "list",
  outputDir: "test-results",
  use: { baseURL: "http://127.0.0.1:3100", screenshot: "only-on-failure", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "mobile", use: { ...devices["Pixel 7"], defaultBrowserType: "chromium", channel: "chrome" } },
  ],
  webServer: [
    { command: "node test/e2e/fixture-api.mjs", url: "http://127.0.0.1:4101/segments", reuseExistingServer: false },
    { command: "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3100",
      url: "http://127.0.0.1:3100/api/catalog/stores", timeout: 120000, reuseExistingServer: false,
      env: { NEXT_PUBLIC_API_URL: "http://127.0.0.1:4101", NEXT_PUBLIC_GOOGLE_CLIENT_ID: "" } },
  ],
});
