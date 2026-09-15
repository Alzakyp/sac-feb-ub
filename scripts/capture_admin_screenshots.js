const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = path.resolve(
  '/Users/alzaky/.gemini/antigravity-ide/brain/ff3b8e58-cc50-4de5-a365-4c74f34f0edf/screenshots'
);
const PUBLIC_DIR = path.resolve(__dirname, '../public/screenshots');

if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

async function saveScreenshot(page, filename) {
  const publicPath = path.join(PUBLIC_DIR, filename);
  const artifactPath = path.join(ARTIFACT_DIR, filename);
  await page.screenshot({ path: publicPath, fullPage: false });
  fs.copyFileSync(publicPath, artifactPath);
  console.log(`Saved screenshot: ${filename}`);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('--- Step 1: Navigating to /admin (Tab 1: Overview) ---');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await saveScreenshot(page, '32_admin_tab1_overview.png');

  console.log('--- Step 2: Tab 2 (Presensi Ruangan) ---');
  await page.locator('nav button:has-text("Presensi Ruangan")').click();
  await page.waitForTimeout(800);
  await saveScreenshot(page, '33_admin_tab2_visitors.png');

  console.log('--- Step 3: Tab 3 (Serah Simpan) ---');
  await page.locator('nav button:has-text("Serah Simpan")').click();
  await page.waitForTimeout(800);
  await saveScreenshot(page, '34_admin_tab3_deposits.png');

  console.log('--- Step 4: Open Verification Modal in Tab 3 ---');
  const verifyButtons = await page.locator('button:has-text("Periksa & Verifikasi")').all();
  if (verifyButtons.length > 0) {
    await verifyButtons[0].click();
    await page.waitForTimeout(800);
    await saveScreenshot(page, '35_admin_tab3_modal_verify.png');
    // Close modal
    await page.locator('button:has-text("Tutup")').click();
    await page.waitForTimeout(400);
  }

  console.log('--- Step 5: Tab 4 (Data Anggota) ---');
  await page.locator('nav button:has-text("Data Anggota")').click();
  await page.waitForTimeout(800);
  await saveScreenshot(page, '36_admin_tab4_members.png');

  console.log('--- Step 6: Tab 5 (Repositori & Jurnal) ---');
  await page.locator('nav button:has-text("Repositori & Jurnal")').click();
  await page.waitForTimeout(1000);
  await saveScreenshot(page, '37_admin_tab5_repository.png');

  await browser.close();
  console.log('All admin screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Error running admin capture:', err);
  process.exit(1);
});
