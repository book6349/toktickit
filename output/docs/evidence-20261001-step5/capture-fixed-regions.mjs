import { chromium, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'staff-resolution-fixed');
const browser = await chromium.launch();
try {
 const page = await browser.newPage({baseURL:'http://localhost:5183'});
 await page.goto('/');
 await page.getByLabel('Email').fill('somchai.staff@example.com');
 await page.getByLabel('Password').fill('Local-development-password2');
 await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await expect(page.locator('.staff-ticket-row').first()).toBeVisible();
 await page.getByLabel('Search tickets').fill('E2E request');
 await page.getByRole('button',{name:'Apply filters'}).click();
 await expect(page.locator('.staff-ticket-row')).toHaveCount(1);
 await page.getByRole('button',{name:'Open Detail'}).click();
 const region=page.getByRole('region',{name:'Requester resolution indication'});
 await expect(region).toContainText('Formal ticket status is still NEW');
 for(const [label,width,height] of [['desktop',1280,900],['tablet',900,900],['mobile',390,844]]) {
  await page.setViewportSize({width,height});
  await region.screenshot({path:path.join(out,`${label}-region.png`)});
  console.log(label,width,height,'actual DOM region captured; status NEW unchanged');
 }
 for(const [label,width,height] of [['desktop',1280,900],['tablet',900,900]]) {
  await page.setViewportSize({width,height});
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:path.join(out,`${label}-detail-viewport.png`)});
 }
 await page.getByRole('button',{name:'Back to Ticket Queue'}).click();
 await page.getByRole('button',{name:'Clear filters',exact:true}).click();
 await expect(page.locator('.staff-ticket-row').first()).toBeVisible();
 for(const [label,width,height] of [['desktop',1280,900],['tablet',900,900]]) {
  await page.setViewportSize({width,height}); await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:path.join(out,`${label}-queue-viewport.png`)});
 }
 await page.getByRole('button',{name:'Log out',exact:true}).click();
 await page.getByLabel('Email').fill('admin@example.com');
 await page.getByLabel('Password').fill('Local-development-password2');
 await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await expect(page.getByRole('heading',{name:'User Management',exact:true})).toBeVisible();
 for(const [label,width,height] of [['desktop',1280,900],['tablet',900,900]]) {
  await page.setViewportSize({width,height}); await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:path.join(out,`${label}-admin-viewport.png`)});
 }
} finally { await browser.close(); }
