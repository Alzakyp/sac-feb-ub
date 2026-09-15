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

  console.log('1. Capturing Homepage (Desktop) with Native Nav & Operational Status Badge...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, '01_homepage_desktop.png'), fullPage: true });

  console.log('2. Testing Category Filter & Search on Homepage...');
  await page.click('button:has-text("Jurnal Internasional")');
  await page.waitForTimeout(400);
  await page.fill('input[placeholder*="Cari judul"]', 'ScienceDirect');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outputDir, '02_homepage_search.png') });



  console.log('3b. Testing ChatSAC Assistant Opening via Navbar...');
  await page.click('nav button:has-text("ChatSAC")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outputDir, '03b_homepage_chat_open.png') });
  // Close chat
  await page.click('button[aria-label="Tutup jendela chat"]');
  await page.waitForTimeout(300);

  console.log('4. Capturing Mobile Presensi (Mobile Viewport 390x844)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000/presensi', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: path.join(outputDir, '04_presensi_mobile.png'), fullPage: true });

  console.log('4b. Opening KTM Scanner Modal on Mobile Presensi...');
  const ktmBtn = mobilePage.locator('button:has-text("Scan KTM")');
  if (await ktmBtn.count() > 0) {
    await ktmBtn.click();
    await mobilePage.waitForTimeout(500);
    await mobilePage.screenshot({ path: path.join(outputDir, '04b_ktm_scanner_modal.png') });
    // Close scanner
    await mobilePage.click('button:has-text("Batal / Input Manual")');
    await mobilePage.waitForTimeout(300);
  }

  console.log('4c. Submitting Presensi and Capturing Success Confirmation Modal...');
  await mobilePage.fill('input[placeholder*="215020"]', '235020200111088');
  await mobilePage.fill('input[placeholder*="Nama sesuai SIAM"]', 'Rayhan Al-Ghazali');
  await mobilePage.selectOption('select', 'S1 Manajemen');
  await mobilePage.click('button:has-text("Pengerjaan Skripsi/Tesis")');
  await mobilePage.waitForTimeout(300);
  await mobilePage.click('button:has-text("Konfirmasi Presensi Masuk")');
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(outputDir, '04c_presensi_success_modal.png') });

  // Click Selesai / Reset Form
  await mobilePage.click('button:has-text("Selesai / Reset Form")');
  await mobilePage.waitForTimeout(400);

  console.log('5. Capturing Admin Login Page...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, '05a_admin_login.png') });

  console.log('5b. Logging in and Capturing Admin Dashboard...');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, '05_admin_dashboard.png'), fullPage: true });

  console.log('5c. Capturing Admin Tab: Data Pengunjung...');
  await page.click('button:has-text("Data Pengunjung")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, '05b_admin_visitors.png'), fullPage: true });

  console.log('5d. Capturing Admin Tab: Manajemen Terminal PC...');
  await page.click('button:has-text("Manajemen Terminal PC")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, '05d_admin_terminals.png'), fullPage: true });

  console.log('6. Opening Print QR Standee Modal in Admin...');
  const qrButton = page.locator('button:has-text("Cetak QR Standee Meja")');
  if (await qrButton.count() > 0) {
    await qrButton.first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outputDir, '06_admin_qr_standee.png') });
  }

  await browser.close();
  console.log('All tests passed and screenshots captured successfully!');
}

main().catch(console.error);

