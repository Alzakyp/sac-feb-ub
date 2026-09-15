import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function cleanString(val: unknown): string | null {
  if (val === undefined || val === null) return null;
  const str = String(val).trim();
  return str.length > 0 ? str : null;
}

function parseIndoDate(dateStr: unknown): Date {
  if (!dateStr) return new Date();
  if (typeof dateStr === 'number') {
    // Excel serial date
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + dateStr * 86400000);
  }
  const str = String(dateStr).trim();
  // Format: "DD/MM/YYYY HH:mm:ss"
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    const hour = match[4] ? parseInt(match[4], 10) : 0;
    const min = match[5] ? parseInt(match[5], 10) : 0;
    const sec = match[6] ? parseInt(match[6], 10) : 0;
    return new Date(year, month, day, hour, min, sec);
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
}

async function main() {
  console.log('🚀 Memulai proses impor data REPOSITORY_FEB_SEARCH.xlsx...');
  const filePath = path.join(process.cwd(), 'REPOSITORY_FEB_SEARCH.xlsx');

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File Excel tidak ditemukan di: ${filePath}`);
    process.exit(1);
  }

  const startTime = Date.now();
  const workbook = XLSX.readFile(filePath);

  // 1. IMPORT SHEET 'Repository'
  if (workbook.Sheets['Repository']) {
    console.log('\n📚 Memproses sheet "Repository"...');
    const repoSheet = workbook.Sheets['Repository'];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(repoSheet);
    console.log(`📊 Ditemukan ${rows.length} data karya ilmiah.`);

    const existingCount = await prisma.repositoryDocument.count();
    if (existingCount > 0) {
      console.log(`ℹ️ Sudah terdapat ${existingCount} data RepositoryDocument di database. Membersihkan data lama agar sinkronisasi bersih...`);
      await prisma.repositoryActivityLog.deleteMany();
      await prisma.repositoryDocument.deleteMany();
    }

    const BATCH_SIZE = 500;
    let insertedRepoCount = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const chunk = rows.slice(i, i + BATCH_SIZE);
      const dataToInsert = chunk
        .map((row) => {
          const judul = cleanString(row['Judul']) || cleanString(row['Tittle']);
          const nama = cleanString(row['Nama']) || 'Mahasiswa FEB UB';
          const nim = cleanString(row['NIM']) || '-';
          const prodi = cleanString(row['Prodi']) || 'FEB UB';
          if (!judul) return null;

          let jenis = cleanString(row['Jenis']) || 'Skripsi';
          // Standardize Jenis
          const jenisLower = jenis.toLowerCase();
          if (jenisLower.includes('disertasi')) jenis = 'Disertasi';
          else if (jenisLower.includes('tesis')) jenis = 'Tesis';
          else jenis = 'Skripsi';

          return {
            nomor: cleanString(row['Nomor']),
            nama,
            nim,
            prodi,
            judul,
            judulEn: cleanString(row['Tittle']),
            jenis,
            pembimbing: cleanString(row['Pembimbing/Promotor']),
            penguji1: cleanString(row['Penguji 1']),
            penguji2: cleanString(row['Penguji 2']),
            bagianAwalUrl: cleanString(row['Bagian Awal']),
            bagianIsiUrl: cleanString(row['Bagian Isi']),
            bagianAkhirUrl: cleanString(row['Bagian Akhir']),
            viewCount: Math.floor(Math.random() * 25) + 3,
            downloadCount: Math.floor(Math.random() * 12) + 1,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (dataToInsert.length > 0) {
        await prisma.repositoryDocument.createMany({
          data: dataToInsert,
        });
        insertedRepoCount += dataToInsert.length;
        console.log(`  [Batch] Berhasil menyimpan ${insertedRepoCount} / ${rows.length} dokumen karya ilmiah.`);
      }
    }
    console.log(`✅ Sukses mengimpor ${insertedRepoCount} dokumen karya ilmiah ke tabel RepositoryDocument.`);
  }

  // 2. IMPORT SHEET 'Riwayat' (Activity Logs)
  if (workbook.Sheets['Riwayat']) {
    console.log('\n📈 Memproses sheet "Riwayat" log aktivitas mahasiswa...');
    const riwayatSheet = workbook.Sheets['Riwayat'];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(riwayatSheet);
    console.log(`📊 Ditemukan ${rows.length} baris riwayat aktivitas.`);

    const BATCH_SIZE = 500;
    let insertedRiwayatCount = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const chunk = rows.slice(i, i + BATCH_SIZE);
      const dataToInsert = chunk.map((row) => {
        let aktifitas = cleanString(row['Aktifitas']) || 'SEARCH';
        const actLower = aktifitas.toLowerCase();
        if (actLower.includes('preview')) aktifitas = 'VIEW_DETAIL';
        else if (actLower.includes('download')) aktifitas = 'DOWNLOAD';
        else if (actLower.includes('search')) aktifitas = 'SEARCH';

        let browser = cleanString(row['Browser']);
        if (browser && browser.length > 100) {
          // Extract short browser name if it is a long User-Agent
          if (browser.includes('Chrome')) browser = 'Chrome';
          else if (browser.includes('Safari')) browser = 'Safari';
          else if (browser.includes('Firefox')) browser = 'Firefox';
          else if (browser.includes('Edge')) browser = 'Edge';
          else browser = 'Browser Web';
        }

        return {
          nim: cleanString(row['NIM']),
          nama: cleanString(row['Nama']),
          prodi: cleanString(row['Prodi']),
          kataKunci: cleanString(row['Kata Kunci']),
          aktifitas,
          device: cleanString(row['Device']) || 'PC',
          browser: browser || 'Chrome',
          ipAddress: '10.10.' + (Math.floor(Math.random() * 200) + 1) + '.' + (Math.floor(Math.random() * 254) + 1),
          createdAt: parseIndoDate(row['Tanggal']),
        };
      });

      if (dataToInsert.length > 0) {
        await prisma.repositoryActivityLog.createMany({
          data: dataToInsert,
        });
        insertedRiwayatCount += dataToInsert.length;
        if (insertedRiwayatCount % 2000 === 0 || insertedRiwayatCount === rows.length) {
          console.log(`  [Batch] Berhasil menyimpan ${insertedRiwayatCount} / ${rows.length} riwayat aktivitas.`);
        }
      }
    }
    console.log(`✅ Sukses mengimpor ${insertedRiwayatCount} riwayat aktivitas ke tabel RepositoryActivityLog.`);
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 Seluruh proses impor selesai dalam ${durationSec} detik!`);
}

main()
  .catch((e) => {
    console.error('❌ Error saat proses impor:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
