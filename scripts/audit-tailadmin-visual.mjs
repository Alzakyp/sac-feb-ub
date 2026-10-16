import { chromium } from 'playwright';
import { createSession } from '../lib/session.ts';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const outDir = '/tmp/tailadmin-audit';
const baseUrl = process.env.AUDIT_BASE_URL || 'http://localhost:3301';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function run() {
  const token = createSession('audit-admin', 'PROGRAMMER');

  const browser = await chromium.launch();
  
  // Desktop Audit
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  await desktopContext.addCookies([
    {
      name: 'sac_session',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
    },
  ]);
  const page = await desktopContext.newPage();

  console.log('Visiting /backoffice on desktop...');
  await page.goto(`${baseUrl}/backoffice`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Overview' }).waitFor();
  await page.screenshot({ path: `${outDir}/desktop-overview.png`, fullPage: false });

  // Tab: Serah Simpan
  console.log('Clicking Serah Simpan...');
  await page.locator('button:has-text("Serah Simpan")').first().click();
  await page.getByRole('heading', { name: 'Serah Simpan' }).waitFor();
  await page.screenshot({ path: `${outDir}/desktop-deposits.png`, fullPage: false });

  // Tab: Kelola Repositori
  console.log('Clicking Kelola Repositori...');
  await page.locator('button:has-text("Kelola Repositori")').first().click();
  await page.getByRole('heading', { name: 'Kelola Repositori' }).waitFor();
  await page.screenshot({ path: `${outDir}/desktop-repository.png`, fullPage: false });

  // Tab: Data Keanggotaan
  console.log('Clicking Data Keanggotaan...');
  await page.locator('button:has-text("Data Keanggotaan")').first().click();
  await page.getByRole('heading', { name: 'Data Keanggotaan' }).waitFor();
  await page.screenshot({ path: `${outDir}/desktop-memberships.png`, fullPage: false });

  // Tab: Login page
  console.log('Visiting /backoffice/login...');
  const loginContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const loginPage = await loginContext.newPage();
  await loginPage.goto(`${baseUrl}/backoffice/login`, { waitUntil: 'networkidle' });
  await loginPage.getByRole('heading', { name: 'Masuk Portal Staf' }).waitFor();
  await loginPage.screenshot({ path: `${outDir}/desktop-login.png`, fullPage: false });

  // Mobile Audit
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  await mobileContext.addCookies([
    {
      name: 'sac_session',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
    },
  ]);
  const mobilePage = await mobileContext.newPage();
  console.log('Visiting /backoffice on mobile...');
  await mobilePage.goto(`${baseUrl}/backoffice`, { waitUntil: 'networkidle' });
  await mobilePage.getByRole('heading', { name: 'Overview' }).waitFor();
  assert.equal(await mobilePage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'Halaman mobile melebar');
  await mobilePage.screenshot({ path: `${outDir}/mobile-overview.png`, fullPage: false });

  // Open mobile drawer
  await mobilePage.locator('button[aria-label="Buka menu navigasi"]').click();
  await mobilePage.getByRole('button', { name: 'Kelola Buku' }).waitFor();
  await mobilePage.screenshot({ path: `${outDir}/mobile-drawer.png`, fullPage: false });

  await browser.close();
  console.log(`Audit visual complete. Saved to ${outDir}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
