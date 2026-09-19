import { expect, test } from "@playwright/test";
import { adminEmail, captureRequiredViewports, signInAndUnlock } from "./fixtures";

test.describe("Lab 3 Administrator User Management", () => {
  test("Administrator can list, search, create, edit, and reset a user", async ({ page }) => {
    await signInAndUnlock(page, adminEmail);
    await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create user" }).first()).toBeVisible();
    await expect(page.getByText("Name")).toBeVisible();
    await expect(page.getByText("Email")).toBeVisible();
    await expect(page.getByText("Role")).toBeVisible();
    await expect(page.getByText("Status")).toBeVisible();

    const email = `e2e-${Date.now()}@example.com`;
    await page.getByRole("button", { name: "Create user" }).first().click();
    await page.getByLabel("Name").fill("E2E Administrator Test");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Role").selectOption("REQUESTER");
    await page.getByLabel("Initial password").fill("E2E-initial-password1");
    await page.getByRole("button", { name: "Create user" }).last().click();
    await expect(page.getByText(email)).toBeVisible();

    await page.getByLabel("Search users").fill(email);
    await expect(page.getByText(email)).toBeVisible();
    await page.getByRole("button", { name: "Edit" }).first().click();
    await page.getByLabel("Name").fill("E2E Administrator Test Updated");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("E2E Administrator Test Updated")).toBeVisible();

    await page.getByRole("button", { name: "Edit" }).first().click();
    await page.getByLabel("New initial password").fill("E2E-reset-password1");
    await page.getByRole("button", { name: "Reset password" }).click();
    await expect(page.getByText(email)).toBeVisible();
  });

  test("Administrator navigation excludes Queue and direct Ticket Detail remains explicit", async ({ page }) => {
    await signInAndUnlock(page, adminEmail);
    await expect(page.getByRole("button", { name: "Ticket Queue" })).toHaveCount(0);
    await expect(page.getByText(/shared IT Staff Queue is not available/i)).toBeVisible();
    await page.getByLabel("Ticket ID").fill("1");
    await page.getByRole("button", { name: "Open Ticket Detail" }).click();
    await expect(page.locator('section[aria-labelledby="staff-detail-heading"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Claim as me" })).toHaveCount(0);
  });

  test("Administrator User Management is captured at required responsive sizes", async ({ page }) => {
    await signInAndUnlock(page, adminEmail);
    await captureRequiredViewports(page, "user-management", "list");
  });
});
