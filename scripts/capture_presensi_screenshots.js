const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

async function main() {
  const publicDir = path.join(__dirname, '..', 'public', 'screenshots');
  const brainDir = path.join(
    '/Users/alzaky/.gemini/antigravity-ide/brain/ff3b8e58-cc50-4de5-a365-4c74f34f0edf/screenshots'
  );

  for (const dir of [publicDir, brainDir]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const saveShot = async (filename) => {
    const pubPath = path.join(publicDir, filename);
    const brnPath = path.join(brainDir, filename);
    await page.screenshot({ path: pubPath });
    fs.copyFileSync(pubPath, brnPath);
    console.log(`Saved screenshot: ${filename}`);
  };

  console.log('1. Capturing Initial Presensi Kiosk View...');
  await page.goto('http://localhost:3000/presensi', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await saveShot('19_presensi_kiosk_initial.png');

  console.log('2. Performing Check-In (NIM: 225020200111888 - Nabila Putri)...');
  await page.locator('#nimInput').fill('225020200111888');
  await page.click('button:has-text("Konfirmasi Presensi")');
  await page.waitForSelector('text=Check-In Berhasil', { timeout: 8000 });
  await page.waitForTimeout(800);
  await saveShot('20_presensi_kiosk_checkin.png');

  console.log('3. Performing Immediate Double-Tap to trigger STILL_IN buffer...');
  await page.locator('#nimInput').fill('225020200111888');
  await page.click('button:has-text("Konfirmasi Presensi")');
  await page.waitForSelector('text=Sesi Sedang Aktif', { timeout: 8000 });
  await page.waitForTimeout(800);
  await saveShot('21_presensi_kiosk_still_in.png');

  console.log('4. Simulating time passage >= 5 minutes in database for Check-Out...');
  try {
    execSync(
      `sqlite3 prisma/dev.db "UPDATE VisitorLog SET checkInTime = datetime('now', '-35 minutes') WHERE identityNumber = '225020200111888' AND status = 'ACTIVE';"`
    );
  } catch (dbErr) {
    console.warn('SQLite update warning:', dbErr);
  }

  console.log('5. Performing Check-Out (NIM: 225020200111888)...');
  await page.locator('#nimInput').fill('225020200111888');
  await page.click('button:has-text("Konfirmasi Presensi")');
  await page.waitForSelector('text=Check-Out Berhasil', { timeout: 8000 });
  await page.waitForTimeout(800);
  await saveShot('22_presensi_kiosk_checkout.png');

  console.log('6. Capturing Network Blocked Screen (Simulated External IP)...');
  const blockedContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
    extraHTTPHeaders: {
      'X-Forwarded-For': '203.0.113.195',
    },
  });
  const blockedPage = await blockedContext.newPage();
  await blockedPage.goto('http://localhost:3000/presensi', {
    waitUntil: 'networkidle',
  });
  await blockedPage.waitForTimeout(600);

  const pubBlocked = path.join(publicDir, '23_presensi_network_blocked.png');
  const brnBlocked = path.join(brainDir, '23_presensi_network_blocked.png');
  await blockedPage.screenshot({ path: pubBlocked });
  fs.copyFileSync(pubBlocked, brnBlocked);
  console.log('Saved screenshot: 23_presensi_network_blocked.png');

  await browser.close();
  console.log('🎉 All presensi flow screenshots captured and verified successfully!');
}

main().catch(console.error);
