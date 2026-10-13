import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { prisma } from '../lib/prisma';
import { POST as accessPost } from '../app/api/repository/access/route';
import { GET as searchGet } from '../app/api/repository/search/route';

async function main() {
  const searchReq = new NextRequest('http://localhost:3000/api/repository/search?limit=1');
  const searchRes = await searchGet(searchReq);
  const searchJson = await searchRes.json();
  const first = searchJson.data[0];
  assert.equal(first.bagianAwalUrl, undefined, 'URL awal tidak boleh bocor di search');
  assert.equal(typeof first.hasBagianAwal, 'boolean');

  const unknownReq = new NextRequest('http://localhost:3000/api/repository/access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId: first.id, nim: 'NIM-TIDAK-ADA-999', purpose: 'Penelitian', section: 'AWAL', accessType: 'READ' }),
  });
  const unknownRes = await accessPost(unknownReq);
  assert.equal(unknownRes.status, 403);
  const unknownJson = await unknownRes.json();
  assert.equal(unknownJson.error, 'Anda tidak mendapatkan akses ini.');

  const sampleStudent = await prisma.student.findFirst({ select: { nim: true } });
  if (sampleStudent && (first.hasBagianAwal || first.hasBagianIsi || first.hasBagianAkhir)) {
    const section = first.hasBagianAwal ? 'AWAL' : first.hasBagianIsi ? 'ISI' : 'AKHIR';
    const okReq = new NextRequest('http://localhost:3000/api/repository/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: first.id, nim: sampleStudent.nim, purpose: 'Skripsi', section, accessType: 'READ' }),
    });
    const okRes = await accessPost(okReq);
    assert.equal(okRes.status, 200);
    const okJson = await okRes.json();
    assert.equal(okJson.success, true);
    assert.match(okJson.url, /^https:\/\//);
  }
  console.log('Repository route tests passed.');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
