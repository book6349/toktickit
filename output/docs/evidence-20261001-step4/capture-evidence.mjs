import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const output = path.resolve(decodeURIComponent(root), process.env.CAPTURE_RUN ?? 'run2');
mkdirSync(output, { recursive: true });
const baseURL = 'http://localhost:5183';
const apiURL = 'http://localhost:3103';
if (new URL(process.env.DATABASE_URL ?? 'postgresql://invalid/none').pathname !== '/toktickit_lab3_e2e_20261001_run1') throw new Error('Wrong evidence database');
const browser = await chromium.launch();
browser.on('disconnected', () => {});
const records = [];
const contexts = [];
const sizes = [{ name: 'desktop', width: 1280, height: 900 }, { name: 'tablet', width: 900, height: 900 }, { name: 'mobile', width: 390, height: 844 }];
async function newPage() { const context = await browser.newContext({ baseURL, viewport: sizes[0] }); context.setDefaultTimeout(10000); contexts.push(context); return context.newPage(); }
async function capture(page, group, name, boundary = 'Live application with real disposable PostgreSQL data', sections = false) {
  const size = page.viewportSize();
  const bounds = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, client: document.documentElement.clientWidth, height: document.documentElement.scrollHeight }));
  expect(bounds.width, `${group}/${name} horizontal overflow`).toBeLessThanOrEqual(bounds.client);
  const relative = `${group}/${name}-${size.width}x${size.height}.png`;
  mkdirSync(path.join(output, 'screenshots', group), { recursive: true });
  await page.screenshot({ path: path.join(output, 'screenshots', relative), fullPage: true });
  records.push({ file: relative, screen: group, scenario: name, viewport: size, capturedAt: new Date().toISOString(), boundary, overflow: bounds, status: 'Captured; visual review pending' });
  console.log('Captured:', relative, boundary);
  if (sections && bounds.height > 1000) {
    for (let y = 0, part = 1; y < bounds.height; y += 660, part++) {
      const height = Math.min(760, bounds.height - y);
      const section = `${group}/${name}-section-${String(part).padStart(2, '0')}-${size.width}px.png`;
      await page.screenshot({ path: path.join(output, 'screenshots', section), fullPage: true, clip: { x: 0, y, width: size.width, height } });
      records.push({ file: section, source: relative, screen: group, scenario: name, viewport: size, capturedAt: new Date().toISOString(), boundary, verticalRange: [y, y + height], status: 'Native browser section capture; visual review pending' });
      if (y + height === bounds.height) break;
    }
  }
}
async function responsive(page, group, name) { for (const size of sizes) { await page.setViewportSize(size); await capture(page, group, name, undefined, size.name === 'mobile'); } await page.setViewportSize(sizes[0]); }
async function signIn(page, email, password = 'Local-development-password2') {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /TokTickIT.*Sign in/i })).toBeVisible();
  await page.getByLabel('Email').fill(email); await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}
async function queueSearch(page, query) { await page.getByLabel('Search tickets').fill(query); await page.getByRole('button', { name: 'Apply filters' }).click(); }
try {
  if (!process.env.CAPTURE_ADMIN_ONLY) {
  const auth = await newPage(); await auth.goto('/');
  await expect(auth.getByRole('heading', { name: /TokTickIT.*Sign in/i })).toBeVisible();
  await responsive(auth, 'authentication', 'login');
  for (const [email, name] of [['missing@example.com', 'invalid-login'], ['inactive@example.com', 'inactive-login']]) {
    await signIn(auth, email, 'Local-development-password');
    await expect(auth.getByRole('alert')).toHaveText('Email or password is incorrect.');
    await capture(auth, 'authentication', name);
  }
  await signIn(auth, 'narin.kittisak@example.com', 'Local-development-password');
  await expect(auth.getByRole('heading', { name: 'Change your password' })).toBeVisible();
  expect((await auth.request.get(`${apiURL}/api/tickets`)).status()).toBe(403);
  await responsive(auth, 'authentication', 'mandatory-change-password');
  await auth.getByLabel('Current password').fill('Local-development-password');
  await auth.getByLabel('New password', { exact: true }).fill('Local-development-password3');
  await auth.getByLabel('Confirm new password').fill('Different-password-2026');
  await expect(auth.getByRole('button', { name: 'Save password' })).toBeDisabled();
  await capture(auth, 'authentication', 'password-confirmation-mismatch');
  await auth.getByRole('button', { name: 'Log out' }).click();
  await expect(auth.getByRole('heading', { name: /TokTickIT.*Sign in/i })).toBeVisible();
  expect((await auth.request.get(`${apiURL}/api/tickets`)).status()).toBe(401);
  await capture(auth, 'authentication', 'logout-api-blocked');
  const requester = await newPage(); await signIn(requester, 'ariya.somchai@example.com');
  await expect(requester.getByRole('heading', { name: 'My tickets' })).toBeVisible();
  await responsive(requester, 'authentication/requester', 'my-tickets');
  await requester.getByRole('button', { name: 'Create Ticket' }).click();
  await expect(requester.getByRole('heading', { name: 'Create a ticket' })).toBeVisible();
  await responsive(requester, 'authentication/requester', 'create-ticket');
  await requester.getByRole('button', { name: 'My Tickets', exact: true }).click();
  await expect(requester.getByRole('heading', { name: 'My tickets' })).toBeVisible();
  const resolutionRow = requester.locator('.ticket-row').filter({ hasText: 'E2E request' });
  await resolutionRow.click();
  await expect(requester.getByText('Marked as appears resolved.')).toBeVisible();
  await expect(requester.getByRole('heading', { name: 'Internal Notes' })).toHaveCount(0);
  await responsive(requester, 'authentication/requester', 'comments-resolution-restricted');

  const staff = await newPage(); await signIn(staff, 'somchai.staff@example.com');
  await expect(staff.getByRole('heading', { name: 'Ticket Queue' })).toBeVisible();
  await expect(staff.locator('.staff-ticket-row').first()).toBeVisible();
  await responsive(staff, 'staff-queue', 'populated');
  await staff.getByLabel('Owner', { exact: true }).selectOption('unassigned');
  await staff.getByLabel('Sort by').selectOption('ticketNumber');
  await staff.getByLabel('Sort direction').selectOption('asc');
  await staff.getByRole('button', { name: 'Apply filters' }).click();
  await expect(staff.locator('.staff-ticket-row').first()).toContainText('Unassigned');
  await capture(staff, 'staff-queue', 'unassigned-sorted');
  await staff.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await staff.getByLabel('Status', { exact: true }).selectOption('NEW');
  await staff.getByLabel('Requested priority').selectOption('LOW');
  await staff.getByLabel('IT priority').selectOption('MEDIUM');
  await staff.getByRole('button', { name: 'Apply filters' }).click();
  await expect(staff.locator('.staff-ticket-row').first()).toBeVisible();
  await capture(staff, 'staff-queue', 'status-requested-it-priority-filter');
  await staff.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await queueSearch(staff, 'zz-no-match-20261001');
  await expect(staff.getByText('No matching tickets', { exact: true })).toBeVisible();
  await capture(staff, 'staff-queue', 'no-results');
  await staff.getByRole('button', { name: 'Clear filters', exact: true }).first().click();
  await queueSearch(staff, 'TT-DOCKER-PRELAB3-001');
  await expect(staff.locator('.staff-ticket-row')).toHaveCount(1);
  await staff.getByRole('button', { name: 'Open Detail' }).click();
  await expect(staff.getByText('baseline.txt', { exact: true })).toBeVisible();
  await staff.getByLabel('Assign owner ID').fill('999999');
  await staff.getByRole('button', { name: 'Assign owner' }).click();
  await expect(staff.getByRole('alert')).toBeVisible();
  await capture(staff, 'staff-ticket-detail', 'invalid-owner-safe-error');
  await staff.getByRole('button', { name: 'Claim as me' }).click();
  await expect(staff.getByRole('status')).toContainText('Ticket claimed');
  await capture(staff, 'staff-ticket-detail', 'claimed-migrated-attachment');
  await staff.getByLabel('Add a public comment').fill('Evidence public update: investigation in progress.');
  await staff.getByRole('button', { name: 'Add public comment', exact: true }).click();
  await expect(staff.getByText('Evidence public update: investigation in progress.', { exact: true })).toBeVisible();
  await staff.getByLabel('Add an Internal Note').fill('Evidence private triage: attachment continuity confirmed.');
  await staff.getByRole('button', { name: 'Add Internal Note', exact: true }).click();
  await expect(staff.getByText('Evidence private triage: attachment continuity confirmed.', { exact: true })).toBeVisible();
  await staff.getByLabel('Next status').selectOption('IN_PROGRESS');
  await staff.getByRole('button', { name: 'Update status' }).click();
  await expect(staff.getByRole('status')).toContainText('Status updated');
  await staff.getByLabel('Next status').selectOption('RESOLVED');
  staff.once('dialog', async dialog => { console.log('Real status confirmation:', dialog.message()); await dialog.accept(); });
  await staff.getByRole('button', { name: 'Update status' }).click();
  await expect(staff.locator('.staff-detail-card .status-pill').first()).toHaveText('RESOLVED');
  await responsive(staff, 'staff-ticket-detail', 'public-private-status-attachment');
  await staff.getByRole('button', { name: 'Ticket Queue', exact: true }).click();
  await queueSearch(staff, 'E2E request');
  await expect(staff.locator('.staff-ticket-row')).toHaveCount(1);
  await staff.getByRole('button', { name: 'Open Detail' }).click();
  await expect(staff.getByText(/Requester indicates/)).toBeVisible();
  await capture(staff, 'staff-ticket-detail', 'requester-resolution-indication');

  }
  const admin = await newPage(); await signIn(admin, 'admin@example.com');
  await expect(admin.getByRole('heading', { name: 'User Management' })).toBeVisible();
  await responsive(admin, 'user-management', 'list');
  await admin.getByLabel('Filter by role').selectOption('IT_STAFF');
  await admin.getByRole('button', { name: 'Apply filters' }).click();
  await expect(admin.locator('.user-row').first()).toBeVisible();
  await capture(admin, 'user-management', 'staff-role-filter');
  await admin.getByRole('button', { name: 'Clear filters' }).click();
  await admin.getByLabel('Search users').fill('zz-no-user-20261001');
  await admin.getByRole('button', { name: 'Apply filters' }).click();
  await expect(admin.locator('.user-row')).toHaveCount(0);
  await capture(admin, 'user-management', 'no-results');
  await admin.getByRole('button', { name: 'Clear filters' }).first().click();
  await admin.locator('.user-row').filter({ hasText: 'admin@example.com' }).getByRole('button', { name: 'Edit' }).click();
  await expect(admin.getByLabel('Active account')).toBeDisabled();
  await capture(admin, 'user-management', 'self-deactivation-disabled');
  await admin.getByRole('button', { name: /Back to User Management/ }).click();
  await admin.getByRole('button', { name: 'Create user' }).first().click();
  await responsive(admin, 'user-management', 'create-form');
  await admin.getByLabel('Name', { exact: true }).fill('Evidence Account');
  await admin.getByLabel('Email', { exact: true }).fill('ariya.somchai@example.com');
  await admin.getByLabel('Initial password', { exact: true }).fill('Short1');
  await admin.getByRole('button', { name: 'Create user', exact: true }).click();
  await expect(admin.locator('.field-error').filter({ hasText: /12/ })).toBeVisible();
  await capture(admin, 'user-management', 'invalid-password');
  await admin.getByLabel('Initial password', { exact: true }).fill('Evidence-initial-password1');
  await admin.getByRole('button', { name: 'Create user', exact: true }).click();
  await expect(admin.getByRole('alert')).toBeVisible();
  await capture(admin, 'user-management', 'duplicate-email');
  await admin.getByRole('button', { name: 'Cancel', exact: true }).click();
  await admin.locator('.user-row').filter({ hasText: 'kanya.staff@example.com' }).getByRole('button', { name: 'Edit' }).click();
  await responsive(admin, 'user-management', 'edit-form');

  const controlled = await newPage(); await signIn(controlled, 'somchai.staff@example.com');
  await expect(controlled.locator('.staff-ticket-row').first()).toBeVisible();
  for (const mode of ['empty', 'failure', 'loading']) {
    await controlled.route('**/api/staff/tickets?*', async route => {
      if (mode === 'loading') { await new Promise(resolve => setTimeout(resolve, 2000)); await route.continue(); }
      else await route.fulfill({ status: mode === 'empty' ? 200 : 503, contentType: 'application/json', body: JSON.stringify(mode === 'empty' ? { items: [], pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0, hasPrevious: false, hasNext: false } } : { error: { code: 'INTERNAL_ERROR', message: 'Controlled evidence: Queue service unavailable.' } }) });
    });
    await controlled.getByRole('button', { name: 'Clear filters', exact: true }).first().click();
    await expect(mode === 'empty' ? controlled.getByText('No tickets yet', { exact: true }) : mode === 'failure' ? controlled.getByRole('alert') : controlled.getByText('Loading Ticket Queue…', { exact: true })).toBeVisible();
    await capture(controlled, 'staff-queue', `controlled-${mode}`, mode === 'loading' ? 'Controlled network delay; real API response follows' : 'Controlled mocked API state; actual React UI; not database behavior proof');
    if (mode === 'loading') await expect(controlled.locator('.staff-ticket-row').first()).toBeVisible();
    await controlled.unroute('**/api/staff/tickets?*');
  }
  console.log('All capture assertions passed. Screenshot files:', records.length);
} finally {
  writeFileSync(path.join(output, 'capture-manifest.json'), JSON.stringify({ sourceHead: '1fb8df040eb12ac443bb4246a314babfde1564e9', branch: 'feature/lab3-submission-corrections', sourceState: 'dirty local tree; not final-main', database: 'toktickit_lab3_e2e_20261001_run1', captures: records }, null, 2));
  for (const context of contexts) await context.close();
  await browser.close();
}
