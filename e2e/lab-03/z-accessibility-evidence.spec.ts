// Run after the authentication and role suites, which perform each seeded account's first-login password change.
import { expect, test } from "@playwright/test";
import { adminEmail, changedPassword, requesterEmail, staffEmail } from "./fixtures";

async function focusByTab(page: import("@playwright/test").Page, locator: import("@playwright/test").Locator, limit = 60) {
  for (let index = 0; index < limit; index += 1) {
    await page.keyboard.press("Tab");
    if (await locator.evaluate((element) => element === document.activeElement).catch(() => false)) return;
  }
  throw new Error("Keyboard traversal did not reach the expected control.");
}

async function keyboardSignIn(page: import("@playwright/test").Page, email: string) {
  await page.goto("/");
  await focusByTab(page, page.getByLabel("Email"), 5);
  await page.keyboard.type(email);
  await page.keyboard.press("Tab");
  await page.keyboard.type(changedPassword);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
}

test.describe("Lab 3 accessibility and transient-state evidence", () => {
  test("captures the visible sign-in busy state and successful destination", async ({ page }) => {
    await page.route("**/api/auth/login", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await route.continue();
    });
    await page.goto("/");
    await page.getByLabel("Email").fill(requesterEmail);
    await page.getByLabel("Password").fill(changedPassword);
    await page.getByRole("button", { name: "Sign in" }).click();
    const busyButton = page.getByRole("button", { name: "Signing in…" });
    await expect(busyButton).toBeDisabled();
    await page.screenshot({ path: "artifacts/lab-03/screenshots/authentication/signing-in-busy-1280x900.png", fullPage: true });
    await expect(page.getByRole("heading", { name: "My tickets" })).toBeVisible();
    await page.screenshot({ path: "artifacts/lab-03/screenshots/authentication/sign-in-success-1280x900.png", fullPage: true });
  });

  test("completes a keyboard-only sign-in and reaches requester navigation", async ({ page }) => {
    await keyboardSignIn(page, requesterEmail);
    await expect(page.getByRole("heading", { name: "My tickets" })).toBeVisible();
    await page.getByRole("button", { name: "Log out" }).focus();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "My Tickets" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Create Ticket" })).toBeFocused();
    await page.screenshot({ path: "artifacts/lab-03/screenshots/accessibility/requester-navigation-keyboard-focus-1280x900.png", fullPage: true });
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Create a ticket" })).toBeVisible();
    await focusByTab(page, page.getByLabel("Category"));
    await expect(page.getByLabel("Category")).toBeFocused();
  });

  test("traverses the IT Staff Queue and opens Ticket Detail with the keyboard", async ({ page }) => {
    await keyboardSignIn(page, staffEmail);
    await expect(page.getByRole("heading", { name: "Ticket Queue" })).toBeVisible();
    const firstOpen = page.getByRole("button", { name: "Open Detail" }).first();
    await focusByTab(page, firstOpen);
    await expect(firstOpen).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator('section[aria-labelledby="staff-detail-heading"]')).toBeVisible();
    await focusByTab(page, page.getByRole("button", { name: /Back to Ticket Queue/ }));
    await page.screenshot({ path: "artifacts/lab-03/screenshots/accessibility/staff-detail-keyboard-focus-1280x900.png", fullPage: true });
  });

  test("traverses Administrator User Management and opens Create User with the keyboard", async ({ page }) => {
    await keyboardSignIn(page, adminEmail);
    await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible();
    const create = page.getByRole("button", { name: "Create user" }).first();
    await focusByTab(page, create);
    await expect(create).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Create user" })).toBeVisible();
    await focusByTab(page, page.getByLabel("Name"));
    await expect(page.getByLabel("Name")).toBeFocused();
    await page.screenshot({ path: "artifacts/lab-03/screenshots/accessibility/admin-create-keyboard-focus-1280x900.png", fullPage: true });
  });
});
