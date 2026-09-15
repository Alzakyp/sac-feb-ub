const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  const outputDir = path.join(__dirname, '..', 'public', 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('1. Capturing Repository Catalog (Desktop 1440x900)...');
  await page.goto('http://localhost:3000/repository', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outputDir, '07_repository_catalog.png'), fullPage: true });

  console.log('2. Performing Search & Capturing Results...');
  await page.fill('input[placeholder*="Cari judul"]', 'kinerja keuangan');
  await page.click('button:has-text("Cari Naskah")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outputDir, '08_repository_search.png') });

  console.log('3. Applying Prodi & Jenis Filters...');
  await page.selectOption('select', { label: 'S1 Manajemen' });
  await page.waitForTimeout(600);
  await page.click('button:has-text("Skripsi")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outputDir, '09_repository_filtered.png') });

  console.log('4. Testing Tracking & Toast Notification...');
  // Intercept window.open so browser doesn't open new window
  await page.evaluate(() => {
    window.open = () => null;
  });
  const fileButton = page.locator('button:has-text("Bagian Awal")').first();
  if (await fileButton.count() > 0) {
    await fileButton.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outputDir, '10_repository_tracking_toast.png') });
  }

  console.log('5. Navigating to Admin Dashboard for Repo Activity Logs...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(1000);

  console.log('6. Switching to Tab "Log Aktivitas Repositori"...');
  await page.click('button:has-text("Log Aktivitas Repositori")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, '11_admin_repo_activity_logs.png'), fullPage: true });

  console.log('7. Capturing Mobile Viewport (390x844)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000/repository', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({ path: path.join(outputDir, '12_repository_mobile.png'), fullPage: true });

  await browser.close();
  console.log('🎉 All repository screenshots captured successfully!');
}

main().catch(console.error);
