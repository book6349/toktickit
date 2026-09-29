import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..", "..", "..");
const output = path.join(repo, "artifacts", "lab-03", "screenshots", "authentication", "responsive-auth-gates");
const baseURL = process.env.EVIDENCE_BASE_URL ?? "http://127.0.0.1:5173";
const viewports = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "tablet", width: 900, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// These routes deliberately replace only the API. Screenshots show the real
// React application UI, but are layout evidence—not authentication/E2E proof.
await page.route("**/api/**", async (route) => {
  const request = route.request();
  const url = new URL(request.url());
  if (url.pathname === "/api/auth/me" && request.method() === "GET") {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: { message: "Not signed in" } }) });
    return;
  }
  if (url.pathname === "/api/auth/csrf" && request.method() === "GET") {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ csrfToken: "evidence-only-token" }) });
    return;
  }
  if (url.pathname === "/api/auth/login" && request.method() === "POST") {
    const timestamp = "2026-09-29T00:00:00.000Z";
    const user = {
      id: 9001,
      name: "Evidence Requester",
      email: "evidence.requester@example.test",
      role: "REQUESTER",
      isActive: true,
      mustChangePassword: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user, mustChangePassword: true }) });
    return;
  }
  await route.fulfill({ status: 501, contentType: "application/json", body: JSON.stringify({ error: { message: "Unmocked endpoint in visual-only capture" } }) });
});

async function assertNoHorizontalOverflow(viewportName) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  if (dimensions.scrollWidth > dimensions.clientWidth) {
    throw new Error(`${viewportName}: horizontal overflow ${dimensions.scrollWidth} > ${dimensions.clientWidth}`);
  }
  console.log(`OVERFLOW_OK ${viewportName} scrollWidth=${dimensions.scrollWidth} clientWidth=${dimensions.clientWidth}`);
}

try {
  await page.goto(baseURL);
  await page.getByRole("heading", { name: /TokTickIT.*Sign in/i }).waitFor();
  await page.getByLabel("Email").fill("evidence.requester@example.test");
  await page.getByLabel("Password").fill("ExampleOnly123!");
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await assertNoHorizontalOverflow(`Login ${viewport.name}`);
    const filename = `login-${viewport.name}-${viewport.width}x${viewport.height}.png`;
    await page.screenshot({ path: path.join(output, filename), fullPage: true });
    console.log(`CAPTURED ${filename} ${viewport.width}x${viewport.height} state=Login api=mocked-layout-only`);
  }

  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("heading", { name: "Change your password" }).waitFor();
  await page.getByLabel("Current password").fill("InitialEvidence123!");
  await page.getByLabel("New password", { exact: true }).fill("ChangedEvidence123!");
  await page.getByLabel("Confirm new password").fill("ChangedEvidence123!");
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await assertNoHorizontalOverflow(`Change Password ${viewport.name}`);
    const filename = `change-password-${viewport.name}-${viewport.width}x${viewport.height}.png`;
    await page.screenshot({ path: path.join(output, filename), fullPage: true });
    console.log(`CAPTURED ${filename} ${viewport.width}x${viewport.height} state=mandatory-change-password api=mocked-layout-only`);
  }
  console.log("RESULT 6 responsive application screenshots captured; no backend, database, or authentication behavior was verified.");
} finally {
  await browser.close();
}
