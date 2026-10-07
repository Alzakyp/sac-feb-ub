import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { mapRepositorySheetRow } from '../lib/repository-sheets-import';

const prisma = new PrismaClient();

async function main() {
  console.log('Mengunduh data Google Spreadsheet...');
  const res = await fetch('https://docs.google.com/spreadsheets/d/1ekLrC2gzf3-UJY8Bj4eX2DMmhu5KH2rMgZBtB9AalcM/export?format=csv&gid=0');
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const csv = await res.text();
  const workbook = XLSX.read(csv, { type: 'string' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
  console.log(`Ditemukan ${rows.length} baris.`);

  const records = rows.map(mapRepositorySheetRow).filter((record) => record.judul !== 'Tanpa Judul');
  console.log('Menghapus data repository lokal lama...');
  await prisma.repositoryActivityLog.deleteMany();
  await prisma.repositoryDocument.deleteMany();

  for (let i = 0; i < records.length; i += 500) {
    await prisma.repositoryDocument.createMany({ data: records.slice(i, i + 500) });
    console.log(`- ${Math.min(i + 500, records.length)} / ${records.length}`);
  }
  console.log(`Sukses: ${records.length} data dari Google Spreadsheet tersimpan.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
