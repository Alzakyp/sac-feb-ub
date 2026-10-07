import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { mapStudentRow } from '../lib/student-import';

const prisma = new PrismaClient();
const URL = 'https://docs.google.com/spreadsheets/d/1yJq8Y7mUt7ZZaMLgEAAl8JTLjHyG6y3LF_Hti1xyOkI/export?format=csv&gid=0';

async function main() {
  const response = await fetch(URL);
  if (!response.ok) throw new Error(`Google Sheets fetch gagal: ${response.status}`);
  const workbook = XLSX.read(await response.text(), { type: 'string' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null }).map(mapStudentRow).filter((row) => row !== null);
  const unique = Array.from(new Map(records.map((record) => [record.nim, record])).values());
  await prisma.student.deleteMany();
  for (let index = 0; index < unique.length; index += 500) await prisma.student.createMany({ data: unique.slice(index, index + 500) });
  console.log(`Student import: ${unique.length} records. ${records.length - unique.length} duplicates removed.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
