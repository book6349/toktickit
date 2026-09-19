import { expect, Page } from "@playwright/test";

export const initialPassword = process.env.E2E_INITIAL_PASSWORD ?? "Local-development-password";
export const changedPassword = process.env.E2E_CHANGED_PASSWORD ?? "Local-development-password2";
export const requesterEmail = process.env.E2E_REQUESTER_EMAIL ?? "ariya.somchai@example.com";
export const staffEmail = process.env.E2E_STAFF_EMAIL ?? "somchai.staff@example.com";
export const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@example.com";

export async function openSignIn(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /TokTickIT.*Sign in/i })).toBeVisible();
}

export async function signIn(page: Page, email: string, password = initialPassword) {
  await openSignIn(page);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

export async function completeInitialPasswordChange(page: Page, nextPassword = changedPassword) {
  const changeHeading = page.getByRole("heading", { name: "Change your password" });
  const roleShellHeading = page.getByRole("heading", { name: /My tickets|Ticket Queue|User Management/ });
  await expect(changeHeading.or(roleShellHeading)).toBeVisible({ timeout: 10_000 });
  if (await changeHeading.isVisible().catch(() => false)) {
    await page.getByLabel("Current password").fill(initialPassword);
    await page.getByLabel("New password", { exact: true }).fill(nextPassword);
    await page.getByLabel("Confirm new password").fill(nextPassword);
    const saveButton = page.getByRole("button", { name: "Save password" });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await expect(changeHeading).toBeHidden({ timeout: 10_000 });
  }
}

export async function signInAndUnlock(page: Page, email: string, password = initialPassword) {
  await signIn(page, email, password);
  await completeInitialPasswordChange(page);
}

export async function captureRequiredViewports(page: Page, relativePath: string, name: string) {
  const viewports = [
    { label: "desktop-1280x900", width: 1280, height: 900 },
    { label: "tablet-900x900", width: 900, height: 900 },
    { label: "mobile-390x844", width: 390, height: 844 },
  ];
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.screenshot({
      path: `artifacts/lab-03/screenshots/${relativePath}/${viewport.label}-${name}.png`,
      fullPage: true,
    });
  }
}
