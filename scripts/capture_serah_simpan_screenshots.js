const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = path.resolve(
  '/Users/alzaky/.gemini/antigravity-ide/brain/ff3b8e58-cc50-4de5-a365-4c74f34f0edf/screenshots'
);
const PUBLIC_DIR = path.resolve(__dirname, '../public/screenshots');

// Ensure directories exist
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
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  console.log('--- Step 1: Navigating to Homepage to capture navbar ---');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await saveScreenshot(page, '29_navbar_with_serah_simpan.png');

  console.log('--- Step 2: Navigating to /serah-simpan (Step 1 Terms) ---');
  await page.goto('http://localhost:3000/serah-simpan', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await saveScreenshot(page, '24_serah_simpan_step1_terms.png');

  console.log('--- Step 3: Proceeding to Step 2 (NIM Verification) ---');
  // Click "Ya, Dokumen Siap"
  const yesButton = page.locator('button:has-text("Ya, Dokumen Siap")');
  await yesButton.click();
  await page.waitForTimeout(800);

  // Type non-existent NIM first to show "Not Found" state
  const nimInput = page.locator('input[placeholder*="215020207111001"]');
  await nimInput.fill('255020200999888');
  await page.locator('button:has-text("Verifikasi")').click();
  await page.waitForTimeout(1000);
  await saveScreenshot(page, '26_serah_simpan_step2_not_found.png');

  // Now verify existing NIM (246020200111001)
  await nimInput.fill('246020200111001');
  await page.locator('button:has-text("Verifikasi")').click();
  await page.waitForTimeout(1000);
  await saveScreenshot(page, '25_serah_simpan_step2_verify.png');

  console.log('--- Step 4: Proceeding to Step 3 (Upload Documents) ---');
  const proceedUploadBtn = page.locator('button:has-text("Lanjut ke Unggah Berkas")');
  await proceedUploadBtn.click();
  await page.waitForTimeout(800);

  // Fill in work metadata
  const titleIdInput = page.locator('textarea[placeholder*="Analisis Pengaruh"]');
  await titleIdInput.fill('Analisis Efisiensi dan Daya Saing Lembaga Keuangan Mikro Syariah di Jawa Timur');

  const titleEnInput = page.locator('textarea[placeholder*="Analysis of"]');
  await titleEnInput.fill('Efficiency and Competitiveness Analysis of Islamic Microfinance Institutions in East Java');

  const advisorInput = page.locator('input[placeholder*="Dosen Pembimbing"]');
  await advisorInput.fill('Prof. Dr. Mohamad Khusaini, S.E., M.Si.');

  const examiner1Input = page.locator('input[placeholder*="Penguji 1"]');
  await examiner1Input.fill('Dr. Wildan Syafitri, S.E., M.E.');

  // Create temporary dummy PDF files to upload
  const tmpDir = path.resolve(__dirname, '../scratch');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const pdfAwal = path.join(tmpDir, '246020200111001_Bagian Awal.pdf');
  const pdfIsi = path.join(tmpDir, '246020200111001_Bagian Isi.pdf');
  const pdfAkhir = path.join(tmpDir, '246020200111001_Bagian Akhir.pdf');

  fs.writeFileSync(pdfAwal, '%PDF-1.4 Dummy Awal Content');
  fs.writeFileSync(pdfIsi, '%PDF-1.4 Dummy Isi Content');
  fs.writeFileSync(pdfAkhir, '%PDF-1.4 Dummy Akhir Content');

  // Set input files
  const fileInputs = await page.locator('input[type="file"]').all();
  if (fileInputs.length >= 3) {
    await fileInputs[0].setInputFiles(pdfAwal);
    await fileInputs[1].setInputFiles(pdfIsi);
    await fileInputs[2].setInputFiles(pdfAkhir);
  }

  // Check agreement checkbox
  await page.locator('input[type="checkbox"]').check();
  await page.waitForTimeout(500);
  await saveScreenshot(page, '27_serah_simpan_step3_upload.png');

  console.log('--- Step 5: Submitting deposit to get Step 4 Receipt ---');
  const submitBtn = page.locator('button:has-text("Kirim Dokumen / Submit Deposit")');
  await submitBtn.click();
  await page.waitForTimeout(2000);
  await saveScreenshot(page, '28_serah_simpan_step4_receipt.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
