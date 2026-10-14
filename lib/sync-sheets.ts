import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { fetchRows, type SHEETS } from './sheets';
import { repositoryRow, membershipRow, depositRow, visitorRow } from './sheet-mappers';

const prisma = new PrismaClient();
export type Dataset = keyof typeof SHEETS;

export async function syncSheet(dataset: Dataset) {
  console.log(`[${dataset}] Mengunduh data Google Sheet...`);
  const rows = await fetchRows(dataset);
  console.log(`[${dataset}] Berhasil mengunduh ${rows.length.toLocaleString('id-ID')} baris.`);

  const map = { repository: repositoryRow, memberships: membershipRow, deposits: depositRow, visitors: visitorRow }[dataset];
  const required = { repository: ['Timestamp', 'NIM', 'Judul'], memberships: ['Tanggal', 'NIM', 'Nama'], deposits: ['Tanggal', 'NIM', 'Nomor Bukti'], visitors: ['Tanggal', 'Check-In', 'NIM'] }[dataset];
  if (!rows.length || required.some((column) => !(column in rows[0]))) throw new Error(`${dataset}: kolom wajib tidak ditemukan: ${required.join(', ')}`);
  let added = 0, updated = 0, skipped = 0;
  const seen = new Set<string>();
  const total = rows.length;

  for (let i = 0; i < total; i++) {
    const row = rows[i];
    if (i > 0 && i % 1000 === 0) {
      console.log(`[${dataset}] Memproses baris ${i.toLocaleString('id-ID')} / ${total.toLocaleString('id-ID')} (tambah: ${added}, update: ${updated}, skip: ${skipped})...`);
    }

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
      const { password, ...data } = membershipRow(row);
      const existing = await prisma.membershipRecord.findUnique({ where: { sourceKey: data.sourceKey }, select: { id: true, passwordHash: true } });
      // ponytail: existing hashes are retained; reimport a changed Sheet password only through an explicit reset workflow.
      const passwordHash = password && !existing?.passwordHash ? await bcrypt.hash(password, 10) : undefined;
      if (existing) { await prisma.membershipRecord.update({ where: { id: existing.id }, data: { ...data, ...(passwordHash ? { passwordHash } : {}) } }); updated++; }
      else { await prisma.membershipRecord.create({ data: { ...data, passwordHash: passwordHash || null } }); added++; }
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
  const summary = { dataset, rows: total, added, updated, skipped };
  console.log(`[${dataset}] Selesai! Ringkasan:`, summary);
  return summary;
}

export async function closeSync() { await prisma.$disconnect(); }
