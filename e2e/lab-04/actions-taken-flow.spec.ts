import { expect, test } from "@playwright/test";
import { changedPassword, completeInitialPasswordChange, initialPassword, requesterEmail, staffEmail } from "../lab-03/fixtures";

async function signInForActionsFlow(page: import("@playwright/test").Page, email: string) {
  const shell = page.getByRole("heading", { name: /My tickets|Ticket Queue/ });
  const changeHeading = page.getByRole("heading", { name: "Change your password" });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /TokTickIT.*Sign in/i })).toBeVisible();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(initialPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(changeHeading.or(shell).or(page.getByRole("alert"))).toBeVisible();

  if (await changeHeading.isVisible().catch(() => false)) {
    await completeInitialPasswordChange(page, changedPassword, initialPassword);
    return;
  }
  if (await shell.isVisible().catch(() => false)) return;

  await page.getByLabel("Password").fill(changedPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(shell).toBeVisible();
}

test.describe("Lab 4 Actions Taken Ticket Detail", () => {
  test("Staff records two actions on one Ticket and its Requester sees both read-only", async ({ page }) => {
    await signInForActionsFlow(page, staffEmail);
    await expect(page.getByRole("heading", { name: "Ticket Queue" })).toBeVisible();
    await page.getByLabel("Search tickets").fill("TT-DOCKER-PRELAB3-001");
    await page.getByRole("button", { name: "Apply filters" }).click();

    const baseline = page.locator(".staff-ticket-row").filter({ hasText: "TT-DOCKER-PRELAB3-001" });
    await expect(baseline).toBeVisible();
    await baseline.getByRole("button", { name: "Open Detail" }).click();
    await expect(page.getByRole("heading", { name: "Actions Taken" })).toBeVisible();

    const descriptions = ["Inspect the laptop power connector", "Replace the damaged power adapter"];
    for (const [index, description] of descriptions.entries()) {
      await page.getByRole("button", { name: "Add Action" }).click();
      await page.getByLabel("Description").fill(description);
      await page.getByLabel("Result").fill(index === 0 ? "Connector inspected; adapter fault suspected." : "Replacement adapter issued to the Requester.");
      await page.getByLabel("Assignee").selectOption({ index: 1 });
      if (index === 0) {
        await page.getByLabel("Follow-up required?").selectOption("yes");
        await page.getByLabel("Follow-up note").fill("Confirm the laptop charges after replacement.");
        await page.getByLabel("Attachment notes").fill("Inspection photo attached to the Ticket.");
      }
      await page.getByRole("button", { name: "Save action" }).click();
      await expect(page.locator(".actions-taken-panel [role='status']")).toContainText("Action added to the Ticket.");
    }

    await expect(page.locator(".actions-list .action-card")).toHaveCount(2);
    await page.getByRole("button", { name: "Log out" }).click();
    await signInForActionsFlow(page, requesterEmail);
    await expect(page.getByRole("heading", { name: "My tickets" })).toBeVisible();
    await page.getByLabel("Search tickets").fill("Synthetic migration fixture");
    await page.getByRole("button", { name: "Apply filters" }).click();
    await page.getByRole("button", { name: /TT-DOCKER-PRELAB3-001/ }).click();

    const actionList = page.locator(".actions-list .action-card");
    await expect(actionList).toHaveCount(2);
    await expect(actionList.nth(0)).toContainText(descriptions[0]);
    await expect(actionList.nth(1)).toContainText(descriptions[1]);
    await expect(actionList.nth(0)).toContainText("Performed by");
    await expect(actionList.nth(0)).toContainText("Assigned to");
    await expect(actionList.nth(0)).toContainText("Confirm the laptop charges after replacement.");
    await expect(actionList.nth(0)).toContainText("Inspection photo attached to the Ticket.");
    await expect(page.getByRole("button", { name: "Add Action" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Edit action" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Internal Notes" })).toHaveCount(0);

    for (const viewport of [
      { width: 1280, height: 900 },
      { width: 900, height: 900 },
      { width: 390, height: 844 },
      { width: 320, height: 800 },
    ]) {
      await page.setViewportSize(viewport);
      const pageWidth = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(pageWidth.scroll, `page-level horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(pageWidth.client);
    }
  });
});
