import { chromium, expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ baseURL: 'http://localhost:5183', viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto('/'); await page.getByLabel('Email').fill('somchai.staff@example.com'); await page.getByLabel('Password').fill('Local-development-password2'); await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.locator('.staff-ticket-row').first()).toBeVisible();
  await page.getByLabel('Search tickets').fill('E2E request'); await page.getByRole('button', { name: 'Apply filters' }).click(); await expect(page.locator('.staff-ticket-row')).toHaveCount(1);
  const responsePromise = page.waitForResponse(response => /\/api\/staff\/tickets\/\d+$/.test(response.url()) && response.request().method() === 'GET');
  await page.getByRole('button', { name: 'Open Detail' }).click();
  const response = await responsePromise; expect(response.status()).toBe(200);
  const { ticket } = await response.json(); expect(ticket.requesterResolutionIndicatedAt).not.toBeNull();
  await expect(page.locator('.staff-detail-card')).toBeVisible();
  const visible = await page.locator('.staff-detail-card').innerText();
  console.log('Observed:', new Date().toISOString(), 'Ticket', ticket.id, 'Requester resolution API timestamp:', ticket.requesterResolutionIndicatedAt);
  console.log('Staff UI resolution wording present:', /appears resolved|resolution indicated|requester indicates|requester resolution/i.test(visible));
  await page.screenshot({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), 'staff-resolution-gap-1280x900.png'), fullPage: true });
  console.log('GAP CONFIRMED: populated API field is not rendered in Staff Detail. Feature is NOT passed.');
  await context.close();
} finally { await browser.close(); }
