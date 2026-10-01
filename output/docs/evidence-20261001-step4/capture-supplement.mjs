import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const output = path.join(path.dirname(fileURLToPath(import.meta.url)), 'run5-supplement');
if (new URL(process.env.DATABASE_URL ?? 'postgresql://invalid/none').pathname !== '/toktickit_lab3_e2e_20261001_run1') throw new Error('Wrong evidence database');
const browser = await chromium.launch(); const captures = []; const contexts = [];
const sizes = [{ width: 1280, height: 900 }, { width: 900, height: 900 }, { width: 390, height: 844 }];
async function page() { const c = await browser.newContext({ baseURL: 'http://localhost:5183', viewport: sizes[0] }); c.setDefaultTimeout(10000); contexts.push(c); return c.newPage(); }
async function shot(p, name, boundary = 'Real API and synthetic disposable PostgreSQL records') {
  const viewport = p.viewportSize(); const bounds = await p.evaluate(() => ({ width: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(bounds.width).toBeLessThanOrEqual(bounds.client);
  const file = `${name}-${viewport.width}x${viewport.height}.png`; mkdirSync(path.dirname(path.join(output, 'screenshots', file)), { recursive: true });
  await p.screenshot({ path: path.join(output, 'screenshots', file), fullPage: true }); captures.push({ file, viewport, boundary, capturedAt: new Date().toISOString(), status: 'Captured; visual review pending' }); console.log('Captured:', file, boundary);
}
async function login(p, email, password) { await p.goto('/'); await p.getByLabel('Email').fill(email); await p.getByLabel('Password').fill(password); await p.getByRole('button', { name: 'Sign in', exact: true }).click(); }
try {
  const admin = await page(); await login(admin, 'admin@example.com', 'Local-development-password2');
  await expect(admin.getByRole('heading', { name: 'User Management' })).toBeVisible();
  const row = admin.locator('.user-row').filter({ hasText: /e2e-\d+@example.com/ }); await expect(row).toHaveCount(1);
  await row.getByRole('button', { name: 'Edit', exact: true }).click();
  const email = 'evidence-edited-20261001@example.com';
  await admin.getByLabel('Name', { exact: true }).fill('Evidence Edited Account'); await admin.getByLabel('Email', { exact: true }).fill(email);
  await admin.getByLabel('Role', { exact: true }).selectOption('IT_STAFF'); await admin.getByLabel('Active account').uncheck();
  await admin.getByRole('button', { name: 'Save changes' }).click();
  const edited = admin.locator('.user-row').filter({ hasText: email }); await expect(edited).toContainText('IT Staff'); await expect(edited).toContainText('Inactive');
  await shot(admin, 'user-management/edited-name-email-role-activation');
  await edited.getByRole('button', { name: 'Edit', exact: true }).click(); await admin.getByLabel('Role', { exact: true }).selectOption('REQUESTER'); await admin.getByLabel('Active account').check(); await admin.getByRole('button', { name: 'Save changes' }).click();
  await admin.locator('.user-row').filter({ hasText: email }).getByRole('button', { name: 'Edit', exact: true }).click();
  await admin.getByLabel('New initial password').fill('Evidence-reset-password1'); await admin.getByRole('button', { name: 'Reset password' }).click(); await expect(admin.getByRole('status')).toContainText('Initial password reset');
  await shot(admin, 'user-management/reset-success');
  const reset = await page(); await login(reset, email, 'Evidence-reset-password1'); await expect(reset.getByRole('heading', { name: 'Change your password' })).toBeVisible();
  const blocked = await reset.request.get('http://localhost:3103/api/tickets'); expect(blocked.status()).toBe(403); console.log('Reset account direct API blocked:', blocked.status(), await blocked.text());
  for (const size of sizes) { await reset.setViewportSize(size); await shot(reset, 'user-management/reset-next-login-password-gate'); }
  await admin.getByRole('button', { name: /Back to User Management/ }).click(); await admin.getByLabel('Ticket ID').fill('1'); await admin.getByRole('button', { name: 'Open Ticket Detail' }).click();
  await expect(admin.locator('.staff-detail-card')).toBeVisible(); await expect(admin.getByRole('button', { name: 'Claim as me' })).toHaveCount(0);
  await expect(admin.getByLabel('IT Priority', { exact: true })).toBeDisabled();
  await shot(admin, 'staff-ticket-detail/administrator-read-only');
  const staff = await page(); await login(staff, 'somchai.staff@example.com', 'Local-development-password2'); await expect(staff.locator('.staff-ticket-row').first()).toBeVisible();
  await staff.getByLabel('Search tickets').fill('TT-DOCKER-PRELAB3-001'); await staff.getByRole('button', { name: 'Apply filters' }).click(); await expect(staff.locator('.staff-ticket-row')).toHaveCount(1);
  await staff.route('**/api/staff/tickets/1', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Controlled evidence: Ticket Detail service unavailable.' } }) }));
  await staff.getByRole('button', { name: 'Open Detail' }).click(); await expect(staff.getByRole('alert')).toContainText('Controlled evidence');
  await shot(staff, 'staff-ticket-detail/controlled-failure', 'Controlled mocked 503 response; actual app UI; not database failure proof');
  console.log('Supplemental assertions passed.');
} finally { mkdirSync(output, { recursive: true }); writeFileSync(path.join(output, 'capture-manifest.json'), JSON.stringify({ sourceHead: '1fb8df040eb12ac443bb4246a314babfde1564e9', sourceState: 'dirty local tree; not final-main', captures }, null, 2)); for (const c of contexts) await c.close(); await browser.close(); }
