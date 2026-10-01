import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { request } from '@playwright/test';
const requireServer = createRequire(new URL('../../../server/package.json', import.meta.url));
const { PrismaClient } = requireServer('@prisma/client');
const database = new URL(process.env.DATABASE_URL ?? 'postgresql://invalid/none').pathname.slice(1);
assert.equal(database, 'toktickit_lab3_e2e_20261001_run1');
assert.equal(process.env.E2E_API_BASE_URL, 'http://localhost:3103');
const prisma = new PrismaClient();
const contexts = [];
async function authenticated(email) {
  const context = await request.newContext({ baseURL: process.env.E2E_API_BASE_URL });
  contexts.push(context);
  const csrf = await context.get('/api/auth/csrf');
  assert.equal(csrf.status(), 200);
  const { csrfToken } = await csrf.json();
  const headers = { 'X-CSRF-Token': csrfToken };
  const login = await context.post('/api/auth/login', { headers, data: { email, password: 'Local-development-password2' } });
  assert.equal(login.status(), 200);
  return { context, headers };
}
try {
  console.log('Executed live API checks:', new Date().toISOString(), 'database:', database);
  const admin = await prisma.user.findUniqueOrThrow({ where: { email: 'admin@example.com' } });
  assert.equal(await prisma.user.count({ where: { role: 'ADMINISTRATOR', isActive: true } }), 1);
  const a = await authenticated(admin.email);
  for (const data of [{ isActive: false }, { role: 'IT_STAFF' }]) {
    const response = await a.context.patch(`/api/admin/users/${admin.id}`, { headers: a.headers, data });
    const body = await response.json();
    console.log('Own Administrator removal rejected:', JSON.stringify(data), response.status(), JSON.stringify(body));
    assert.equal(response.status(), 403);
    assert.equal(body.error.code, 'FORBIDDEN');
  }
  const remaining = await prisma.user.findUniqueOrThrow({ where: { id: admin.id } });
  assert.equal(remaining.isActive, true);
  assert.equal(remaining.role, 'ADMINISTRATOR');
  assert.equal(await prisma.user.count({ where: { role: 'ADMINISTRATOR', isActive: true } }), 1);
  console.log('Last-active-Administrator invariant retained in real database. These requests execute the self-protection guard, not the separate LAST_ADMINISTRATOR branch.');
  for (const email of ['ariya.somchai@example.com', 'somchai.staff@example.com']) {
    const user = await authenticated(email);
    const response = await user.context.get('/api/admin/users');
    const body = await response.json();
    console.log('Non-Administrator User Management denial:', email, response.status(), JSON.stringify(body));
    assert.equal(response.status(), 403);
    assert.equal(body.error.code, 'FORBIDDEN');
    if (email === 'ariya.somchai@example.com') {
      const attachment = await prisma.attachment.findFirstOrThrow({ where: { originalFilename: 'baseline.txt', ticket: { ticketNumber: 'TT-DOCKER-PRELAB3-001' } } });
      const download = await user.context.get(`/api/attachments/${attachment.id}/download`);
      assert.equal(download.status(), 200);
      const bytes = await download.body();
      assert.deepEqual(bytes, Buffer.from('baseline content\n'));
      console.log('Migrated Attachment download:', download.status(), bytes.length, 'bytes; SHA256:', createHash('sha256').update(bytes).digest('hex'));
    }
  }
  console.log('All live assertions passed. No pre-existing application database was used.');
} finally {
  for (const context of contexts) await context.dispose();
  await prisma.$disconnect();
}
