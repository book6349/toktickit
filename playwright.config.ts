import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "artifacts/lab-04/playwright-report", open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
    acceptDownloads: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : [
        {
          command: "npm run dev -- --host 127.0.0.1",
          cwd: "client",
          url: "http://127.0.0.1:5173",
          reuseExistingServer: false,
          timeout: 120_000,
        },
        {
          command: "npm run dev",
          cwd: "server",
          url: "http://localhost:3000/api/health",
          reuseExistingServer: false,
          timeout: 120_000,
        },
      ],
  projects: [
    { name: "lab-03", testDir: "./e2e/lab-03", use: { ...devices["Desktop Chrome"] } },
    { name: "lab-02", testDir: "./e2e/lab-02", dependencies: ["lab-03"], use: { ...devices["Desktop Chrome"] } },
    { name: "lab-04", testDir: "./e2e/lab-04", dependencies: ["lab-02"], use: { ...devices["Desktop Chrome"] } },
  ],
});
