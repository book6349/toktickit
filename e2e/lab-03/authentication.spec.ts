import { expect, test } from "@playwright/test";
import {
  captureRequiredViewports,
  apiBaseURL,
  changedPassword,
  completeInitialPasswordChange,
  initialPassword,
  openSignIn,
  requesterEmail,
  signIn,
  signInAndUnlock,
} from "./fixtures";

test.describe("Lab 3 authentication and Requester regression", () => {
  test("valid login, first-login change, role shell, logout, and direct blocking", async ({ page }) => {
    await signIn(page, requesterEmail);
    await expect(page.getByRole("heading", { name: "Change your password" })).toBeVisible();
    await completeInitialPasswordChange(page, changedPassword);

    await expect(page.getByRole("heading", { name: "My tickets" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Ticket" })).toBeVisible();
    await expect(page.getByText(/Ariya Somchai.*REQUESTER/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Ticket Queue" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "User Management" })).toHaveCount(0);

    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page.getByRole("heading", { name: /TokTickIT.*Sign in/i })).toBeVisible();
    expect((await page.request.get(`${apiBaseURL}/api/tickets`)).status()).toBe(401);
    await page.reload();
    await expect(page.getByRole("heading", { name: /TokTickIT.*Sign in/i })).toBeVisible();
  });

  test("invalid and inactive accounts receive safe sign-in failure", async ({ page }) => {
    await openSignIn(page);
    for (const [email, password] of [
      ["inactive@example.com", initialPassword],
      ["missing@example.com", initialPassword],
      [requesterEmail, "Incorrect-password-2026"],
    ]) {
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill(password);
      const response = page.waitForResponse((res) => res.url().endsWith("/api/auth/login") && res.request().method() === "POST");
      await page.getByRole("button", { name: "Sign in" }).click();
      expect((await response).status()).toBe(401);
      await expect(page.getByRole("alert")).toHaveText("Email or password is incorrect.");
      await expect(page.getByRole("heading", { name: /TokTickIT.*Sign in/i })).toBeVisible();
    }
  });

  test("Requester can create, open, comment, and indicate resolution", async ({ page }) => {
    await signInAndUnlock(page, requesterEmail, changedPassword);
    await page.getByRole("button", { name: "Create Ticket" }).click();
    await expect(page.getByRole("heading", { name: "Create a ticket" })).toBeVisible();
    await page.getByLabel("Category").selectOption({ label: "Hardware" });
    await page.getByLabel("Related system").selectOption({ label: "Corporate Laptop" });
    await page.getByLabel("Summary").fill(`E2E request ${Date.now()}`);
    await page.getByLabel("Description").fill("Integrated E2E requester regression flow.");
    await page.getByRole("button", { name: "Submit ticket" }).click();
    await expect(page.getByRole("status")).toContainText("Ticket");
    await page.getByRole("button", { name: "View ticket" }).click();
    await expect(page.locator('section[aria-labelledby="detail-heading"]')).toBeVisible();
    await page.getByLabel("Add a public comment").fill("Requester E2E comment.");
    await page.getByRole("button", { name: "Add comment" }).click();
    await expect(page.getByText("Requester E2E comment.")).toBeVisible();
    await page.getByRole("button", { name: "Mark as appears resolved" }).click();
    await expect(page.getByText("Marked as appears resolved.")).toBeVisible();
    await page.screenshot({
      path: "artifacts/lab-03/screenshots/authentication/requester-resolution-indicated-1280x900.png",
      fullPage: true,
    });
  });

  test("Requester shell is captured at required responsive sizes", async ({ page }) => {
    await signInAndUnlock(page, requesterEmail, changedPassword);
    await captureRequiredViewports(page, "authentication/requester-regression", "my-tickets");
  });
});
