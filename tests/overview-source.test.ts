import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../app/api/admin/overview/route.ts', import.meta.url), 'utf8');
assert.ok(source.includes("prisma.scientificWorkDeposit.count({\n      where: { verificationStatus: 'PENDING' }"), 'Antrean harus menghitung pengajuan web, bukan arsip.');
assert.ok(source.includes('prisma.scientificWorkDeposit.findMany('), 'Detail antrean harus berasal dari tabel pengajuan web.');
assert.ok(!source.includes('where: { validationDate: null }'), 'Tanggal validasi kosong arsip bukan antrean baru.');
console.log('Overview source regression passed.');
