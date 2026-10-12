import assert from 'node:assert/strict';
import { date, key, text, url } from '../lib/sheets';
import { depositRow, membershipRow, repositoryRow, visitorRow } from '../lib/sheet-mappers';

assert.equal(text('  halo  '), 'halo');
assert.equal(text('-'), null);
assert.equal(text(''), null);

assert.equal(url('https://drive.google.com/test'), 'https://drive.google.com/test');
assert.equal(url('invalid-url'), null);

const parsed = date('15/08/2025 16:26:59');
assert.ok(parsed instanceof Date);
assert.equal(parsed.getUTCFullYear(), 2025);
assert.equal(parsed.getUTCMonth(), 7); // August is month index 7
assert.equal(parsed.getUTCDate(), 15);

const repo = repositoryRow({
  Timestamp: '15/08/2025 16:26:59',
  NIM: '215020300111057',
  Nama: 'Atina',
  Judul: 'Reaksi Pasar',
  'File Awal': 'https://drive.google.com/file',
  'Nomor Berkas': 'BRK-001'
});
assert.equal(repo.nim, '215020300111057');
assert.equal(repo.nomor, 'BRK-001');
assert.ok(repo.sourceKey.length === 64);

const mem = membershipRow({
  Tanggal: '05/17/2023',
  Jam: '10:25:16',
  NIM: '195120500111030',
  Nama: 'Prabhaswara',
  Email: 'prabha@gmail.com'
});
assert.equal(mem.nim, '195120500111030');
assert.ok(mem.sourceKey.length === 64);

const dep = depositRow({
  Tanggal: '01/01/2024',
  NIM: '123',
  'Nomor Bukti': 'BKT-01',
  Judul: 'Judul Skripsi',
  Plagiasi: '12%'
});
assert.equal(dep.proofNumber, 'BKT-01');
assert.equal(dep.plagiarismScore, '12%');

const vis = visitorRow({
  Tanggal: '01/01/2024',
  'Check-In': '08:00',
  'Check-Out': '10:00',
  NIM: '123',
  Nama: 'Test'
});
assert.equal(vis.identityNumber, '123');
assert.equal(vis.status, 'COMPLETED');

console.log('Sheet parsing test passed!');
