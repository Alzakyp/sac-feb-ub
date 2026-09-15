const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  const publicDir = path.join(__dirname, '..', 'public', 'screenshots');
  const brainDir = path.join('/Users/alzaky/.gemini/antigravity-ide/brain/ff3b8e58-cc50-4de5-a365-4c74f34f0edf/screenshots');

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

  const saveShot = async (filename, options = {}) => {
    const pubPath = path.join(publicDir, filename);
    const brnPath = path.join(brainDir, filename);
    await page.screenshot({ path: pubPath, ...options });
    fs.copyFileSync(pubPath, brnPath);
    console.log(`Saved screenshot: ${filename}`);
  };

  console.log('1. Step 1 (Syarat & Ketentuan)...');
  await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await saveShot('13_register_step1_terms.png');

  // Check agreement & proceed to Step 2
  console.log('2. Checking agreement and proceeding to Step 2...');
  await page.locator('input[type="checkbox"]').check();
  await page.waitForTimeout(300);
  await page.click('button:has-text("Setuju & Lanjutkan")');
  await page.waitForTimeout(600);

  // Fill Step 2
  console.log('3. Filling Step 2 (Jenis Keanggotaan & Berkas)...');
  await page.locator('select:visible').first().selectOption('Mahasiswa FEB-UB');
  const uniqueNim = `235020200${Math.floor(100000 + Math.random() * 900000)}`;
  await page.locator('input[placeholder*="NIM / NIK"]').fill(uniqueNim);
  await page.waitForTimeout(500);
  await saveShot('14_register_step2_files.png');

  // Proceed to Step 3
  console.log('4. Proceeding to Step 3 (Data Pribadi & Kontak)...');
  await page.click('button:has-text("Isi Data Pribadi")');
  await page.waitForTimeout(600);

  // Fill Step 3
  console.log('5. Filling Step 3 (Data Pribadi & Kontak)...');
  await page.locator('input[placeholder*="Nama lengkap"]').fill('Dewi Anggraeni Putri');
  await page.locator('select:visible').first().selectOption('S1 Akuntansi');
  await page.locator('input[placeholder="81234567890"]').fill('81298765432');
  await page.locator('input[type="email"]').fill(`dewi.${Date.now()}@student.ub.ac.id`);
  const textareas = page.locator('textarea:visible');
  await textareas.nth(0).fill('Jl. Pahlawan No. 45, Surabaya');
  await textareas.nth(1).fill('Jl. MT. Haryono Gg. 10 No. 12, Lowokwaru, Malang');
  await page.waitForTimeout(500);
  await saveShot('15_register_step3_personal.png');

  // Proceed to Step 4
  console.log('6. Proceeding to Step 4 (Pembuatan Password)...');
  await page.click('button:has-text("Buat Password")');
  await page.waitForTimeout(600);

  // Fill password
  console.log('7. Filling Step 4 (Password)...');
  const passwordInputs = page.locator('input[type="password"]:visible');
  await passwordInputs.nth(0).fill('Brawijaya2026');
  await passwordInputs.nth(1).fill('Brawijaya2026');
  await page.waitForTimeout(500);
  await saveShot('16_register_step4_password.png');

  // Submit to Step 5
  console.log('8. Submitting registration to reach Step 5 (Digital Member Card)...');
  await page.click('button:has-text("Selesaikan Pendaftaran")');
  await page.waitForSelector('text=Pendaftaran Berhasil', { timeout: 10000 });
  await page.waitForTimeout(1000);
  await saveShot('17_register_step5_card.png');

  // Presensi integration check with scroll to reveal registration banner
  console.log('9. Checking Presensi Page with Registration Banner...');
  await page.goto('http://localhost:3000/presensi', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    window.scrollBy(0, 320);
  });
  await page.waitForTimeout(500);
  await saveShot('18_presensi_with_register_banner.png');

  await browser.close();
  console.log('🎉 All registration screenshots re-captured and verified successfully!');
}

main().catch(console.error);
