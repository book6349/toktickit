import { expect, test, type Page, type Locator } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { signInAndUnlock, staffEmail, requesterEmail, logOutAndWait } from "../lab-03/fixtures";

async function tabTo(page: Page, target: Locator) {
  for (let i = 0; i < 100; i++) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) {
      await expect(target).toBeFocused();
      const outline = await target.evaluate((element) => getComputedStyle(element).outlineWidth);
      expect(parseFloat(outline)).toBeGreaterThanOrEqual(2);
      return;
    }
  }
  throw new Error("Control was not reachable after 100 Tab presses");
}
async function capture(page: Page, name: string) {
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.client).toBe(320);
  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
  await mkdir("artifacts/lab-04/screenshots/accessibility", { recursive: true });
  await page.screenshot({ path: `artifacts/lab-04/screenshots/accessibility/${name}-320x800.png`, fullPage: false });
}

test("Lab 4 keyboard focus, labels, validation, reduced motion and 320px layouts", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await signInAndUnlock(page, staffEmail);
  await tabTo(page, page.getByRole("button", { name: "Dashboard", exact: true }));
  await page.keyboard.press("Enter");
  const card = page.getByRole("button", { name: /^Unassigned active:/ });
  await expect(card).toBeVisible();
  await expect(page.getByRole("region", { name: "Work Dashboard", exact: true })).toBeVisible();
  await tabTo(page, card);
  await card.hover();
  const motion = await card.evaluate((element) => ({ transition: getComputedStyle(element).transitionDuration, transform: getComputedStyle(element).transform }));
  expect(motion).toEqual({ transition: "0s", transform: "none" });
  await capture(page, "staff-dashboard-keyboard");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Unassigned active Tickets" })).toBeVisible();
  await tabTo(page, page.getByRole("button", { name: "Back to dashboard" }));
  await page.keyboard.press("Enter");
  await expect(card).toBeVisible();

  await page.getByRole("button", { name: "Ticket Queue", exact: true }).click();
  await page.getByLabel("Search tickets").fill("TT-DOCKER-PRELAB3-001");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await page.locator(".staff-ticket-row").filter({ hasText: "TT-DOCKER-PRELAB3-001" }).getByRole("button", { name: "Open Detail" }).click();
  await expect(page.getByRole("region", { name: "Actions Taken", exact: true })).toBeVisible();
  await tabTo(page, page.getByRole("button", { name: "Add Action", exact: true }));
  await page.keyboard.press("Enter");
  await expect(page.getByRole("form", { name: "Record an action" })).toBeVisible();
  for (const label of ["Action date and time", "Assignee", "Description", "Result", "Action status", "Follow-up required?", "Attachment notes (optional)"]) {
    await expect(page.getByLabel(label, { exact: true })).toBeVisible();
  }
  await tabTo(page, page.getByRole("button", { name: "Save action", exact: true }));
  await page.keyboard.press("Enter");
  await expect(page.getByRole("alert").filter({ hasText: "Review these fields" })).toBeVisible();
  await expect(page.locator(":focus")).toHaveAttribute("aria-invalid", "true");
  await capture(page, "action-validation-focus");
  await tabTo(page, page.getByRole("button", { name: "Cancel", exact: true }));
  await page.keyboard.press("Enter");
  await expect(page.getByRole("form", { name: "Record an action" })).toHaveCount(0);
  await capture(page, "staff-workflow");
  await logOutAndWait(page);

  await signInAndUnlock(page, requesterEmail);
  await tabTo(page, page.getByRole("button", { name: "Dashboard", exact: true }));
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "My Dashboard", exact: true })).toBeVisible();
  await tabTo(page, page.getByRole("button", { name: /^Open Tickets:/ }));
  await capture(page, "requester-dashboard-keyboard");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Open Tickets", exact: true })).toBeVisible();
  await tabTo(page, page.getByRole("button", { name: "Back to dashboard" }));
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "My Dashboard" })).toBeVisible();
});
