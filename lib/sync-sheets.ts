import { PrismaClient } from '@prisma/client';
import { fetchRows, type SHEETS } from './sheets';
import { repositoryRow, membershipRow, depositRow, visitorRow } from './sheet-mappers';

const prisma = new PrismaClient();
export type Dataset = keyof typeof SHEETS;

export async function syncSheet(dataset: Dataset) {
  const rows = await fetchRows(dataset);
  const map = { repository: repositoryRow, memberships: membershipRow, deposits: depositRow, visitors: visitorRow }[dataset];
  const required = { repository: ['Timestamp', 'NIM', 'Judul'], memberships: ['Tanggal', 'NIM', 'Nama'], deposits: ['Tanggal', 'NIM', 'Nomor Bukti'], visitors: ['Tanggal', 'Check-In', 'NIM'] }[dataset];
  if (!rows.length || required.some((column) => !(column in rows[0]))) throw new Error(`${dataset}: kolom wajib tidak ditemukan: ${required.join(', ')}`);
  let added = 0, updated = 0, skipped = 0;
  const seen = new Set<string>();
  for (const row of rows) {
    if (required.some((column) => !String(row[column] ?? '').trim())) { skipped++; continue; }
    const record = map(row);
    if (seen.has(record.sourceKey)) { skipped++; continue; }
    seen.add(record.sourceKey);
    if (dataset === 'repository') {
      const data = repositoryRow(row);
      let existing = await prisma.repositoryDocument.findUnique({ where: { sourceKey: data.sourceKey } });
      if (!existing) {
        const candidates = await prisma.repositoryDocument.findMany({ where: { nim: data.nim, judul: data.judul, sourceKey: null }, take: 2 });
        if (candidates.length === 1) existing = candidates[0];
      }
      if (existing) { await prisma.repositoryDocument.update({ where: { id: existing.id }, data }); updated++; }
      else { await prisma.repositoryDocument.create({ data }); added++; }
    } else if (dataset === 'memberships') {
      const data = membershipRow(row);
      const existing = await prisma.membershipRecord.findUnique({ where: { sourceKey: data.sourceKey }, select: { id: true } });
      if (existing) { await prisma.membershipRecord.update({ where: { id: existing.id }, data }); updated++; }
      else { await prisma.membershipRecord.create({ data }); added++; }
    } else if (dataset === 'deposits') {
      const data = depositRow(row);
      const existing = await prisma.depositRecord.findUnique({ where: { sourceKey: data.sourceKey }, select: { id: true } });
      if (existing) { await prisma.depositRecord.update({ where: { id: existing.id }, data }); updated++; }
      else { await prisma.depositRecord.create({ data }); added++; }
    } else {
      const data = visitorRow(row);
      const existing = await prisma.visitorLog.findUnique({ where: { sourceKey: data.sourceKey }, select: { id: true } });
      if (existing) { await prisma.visitorLog.update({ where: { id: existing.id }, data }); updated++; }
      else { await prisma.visitorLog.create({ data }); added++; }
    }
  }
  return { dataset, rows: rows.length, added, updated, skipped };
}

export async function closeSync() { await prisma.$disconnect(); }
