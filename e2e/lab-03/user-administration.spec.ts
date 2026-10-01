import { expect, test } from "@playwright/test";
import { adminEmail, apiBaseURL, captureRequiredViewports, changedPassword, completeInitialPasswordChange, getE2EFixtures, initialPassword, signIn, signInAndUnlock } from "./fixtures";

test.describe("Lab 3 Administrator User Management", () => {
  test("Administrator can list, search, create, edit, reset, and require the new initial password at next login", async ({ page, browser, baseURL }) => {
    await signInAndUnlock(page, adminEmail, initialPassword);
    await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create user" }).first()).toBeVisible();
    const requesterRow = page.locator(".user-row").filter({ hasText: "Ariya Somchai" });
    await expect(requesterRow).toBeVisible();
    await expect(requesterRow.getByText("Requester", { exact: true })).toBeVisible();
    await expect(requesterRow.getByText("Active", { exact: true })).toBeVisible();

    const email = `e2e-${Date.now()}@example.com`;
    await page.getByRole("button", { name: "Create user" }).first().click();
    await page.getByLabel("Name").fill("E2E Administrator Test");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Role").selectOption("REQUESTER");
    await page.getByLabel("Initial password").fill("E2E-initial-password1");
    await page.getByRole("button", { name: "Create user" }).last().click();
    await expect(page.getByText(email)).toBeVisible();

    await page.getByLabel("Search users").fill(email);
    await page.getByRole("button", { name: "Apply filters" }).click();
    const createdRow = page.locator(".user-row").filter({ hasText: email });
    await expect(createdRow).toBeVisible();
    await createdRow.getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("Name").fill("E2E Administrator Test Updated");
    await page.getByRole("button", { name: "Save changes" }).click();
    const updatedRow = page.locator(".user-row").filter({ hasText: email });
    await expect(updatedRow.getByText("E2E Administrator Test Updated")).toBeVisible();

    await updatedRow.getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("New initial password").fill("E2E-reset-password1");
    await page.getByRole("button", { name: "Reset password" }).click();
    await expect(page.getByRole("status")).toContainText("Initial password reset");
    await page.screenshot({ path: "artifacts/lab-03/screenshots/user-management/reset-success-1280x900.png", fullPage: true });
    await page.getByRole("button", { name: /Back to User Management/ }).click();
    await expect(page.getByText(email)).toBeVisible();

    const resetContext = await browser.newContext({ baseURL });
    try {
      const resetPage = await resetContext.newPage();
      await signIn(resetPage, email, "E2E-initial-password1");
      await expect(resetPage.getByRole("alert")).toHaveText("Email or password is incorrect.");
      await signIn(resetPage, email, "E2E-reset-password1");
      await expect(resetPage.getByRole("heading", { name: "Change your password" })).toBeVisible();
      await expect(resetPage.getByRole("heading", { name: "My tickets" })).toHaveCount(0);
      const blocked = await resetContext.request.get(`${apiBaseURL}/api/tickets`);
      expect(blocked.status()).toBe(403);
      expect((await blocked.json()).error.code).toBe("PASSWORD_CHANGE_REQUIRED");
      await completeInitialPasswordChange(resetPage, "E2E-changed-password2", "E2E-reset-password1");
      await expect(resetPage.getByRole("heading", { name: "My tickets" })).toBeVisible();
      expect((await resetContext.request.get(`${apiBaseURL}/api/tickets`)).status()).toBe(200);
    } finally {
      await resetContext.close();
    }
  });

  test("Administrator navigation excludes Queue and direct Ticket Detail remains explicit", async ({ page }) => {
    await signInAndUnlock(page, adminEmail, changedPassword);
    await expect(page.getByRole("button", { name: "Ticket Queue" })).toHaveCount(0);
    await expect(page.getByText(/shared IT Staff Queue is not available/i)).toBeVisible();
    await page.getByLabel("Ticket ID").fill(String(getE2EFixtures().baselineTicketId));
    await page.getByRole("button", { name: "Open Ticket Detail" }).click();
    await expect(page.locator('section[aria-labelledby="staff-detail-heading"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Claim as me" })).toHaveCount(0);
  });

  test("Administrator User Management is captured at required responsive sizes", async ({ page }) => {
    await signInAndUnlock(page, adminEmail, changedPassword);
    await captureRequiredViewports(page, "user-management", "list");
  });
});
