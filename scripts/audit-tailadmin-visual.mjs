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

  const tabs = [
    ['Serah Simpan', 'Serah Simpan', 'desktop-deposits.png'],
    ['Lapor Kendala', 'Lapor Kendala', 'desktop-reports.png'],
    ['Kelola Staf', 'Kelola Staf', 'desktop-staff.png'],
    ['Kelola Repositori', 'Kelola Repositori', 'desktop-repository.png'],
    ['Data Keanggotaan', 'Data Keanggotaan', 'desktop-memberships.png'],
    ['Bukti Serah Simpan', 'Bukti Serah Simpan', 'desktop-proof-records.png'],
    ['Riwayat Buku Tamu', 'Riwayat Buku Tamu', 'desktop-visitors.png'],
    ['Kelola Buku', 'Kelola Buku', 'desktop-books.png'],
  ];
  for (const [label, heading, file] of tabs) {
    console.log(`Clicking ${label}...`);
    await page.getByRole('button', { name: new RegExp(`^${label}`) }).first().click();
    await page.getByRole('heading', { name: heading, exact: true }).waitFor();
    await page.screenshot({ path: `${outDir}/${file}`, fullPage: false });
  }

  // Existing create-form trigger: open then close, no data mutation.
  await page.getByRole('button', { name: 'Tambah Buku' }).click();
  await page.getByRole('heading', { name: 'Tambah Buku' }).waitFor();
  await page.keyboard.press('Escape');

  // Tab: Login page
  console.log('Visiting /backoffice/login...');
  const loginContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const loginPage = await loginContext.newPage();
  await loginPage.goto(`${baseUrl}/backoffice/login`, { waitUntil: 'networkidle' });
  await loginPage.getByRole('heading', { name: 'Masuk Portal Staf' }).waitFor();
  await loginPage.screenshot({ path: `${outDir}/desktop-login.png`, fullPage: false });
  await loginPage.getByRole('button', { name: 'Masuk ke Dashboard' }).click();
  await loginPage.getByRole('alert').waitFor();

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
  await mobilePage.getByRole('button', { name: 'Kelola Buku', exact: true }).waitFor();
  await mobilePage.screenshot({ path: `${outDir}/mobile-drawer.png`, fullPage: false });

  // Logout is exercised in a separate authenticated context.
  const logoutContext = await browser.newContext();
  await logoutContext.addCookies([{ name: 'sac_session', value: token, domain: 'localhost', path: '/', httpOnly: true }]);
  const logoutPage = await logoutContext.newPage();
  await logoutPage.goto(`${baseUrl}/backoffice`, { waitUntil: 'networkidle' });
  await logoutPage.getByRole('button', { name: 'Keluar akun' }).click();
  await logoutPage.waitForURL(/\/backoffice\/login$/);

  await browser.close();
  console.log(`Audit visual complete. Saved to ${outDir}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
