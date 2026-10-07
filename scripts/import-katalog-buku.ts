import * as XLSX from 'xlsx';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { mapKatalogRow } from '../lib/katalog-import';

const prisma = new PrismaClient();
const filePath = path.join(process.cwd(), 'SAC-ONE Koleksi Buku.xlsx');

async function main() {
  if (!fs.existsSync(filePath)) throw new Error(`File tidak ditemukan: ${filePath}`);

  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets.EntryData;
  if (!sheet) throw new Error('Sheet "EntryData" tidak ditemukan.');

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
  const books = rows.map(mapKatalogRow).filter((book) => book !== null);

  await prisma.bookCollection.deleteMany();
  for (let index = 0; index < books.length; index += 500) {
    await prisma.bookCollection.createMany({ data: books.slice(index, index + 500) });
  }

  console.log(`Impor selesai: ${books.length} buku dari SAC-ONE Koleksi Buku.xlsx.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
