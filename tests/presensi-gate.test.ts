import assert from 'node:assert/strict';
import { prisma } from '../lib/prisma';
import { POST } from '../app/api/presensi/route';

// In-memory DB stubs: never create or check out real visitor sessions.
async function main() {
  let student: any = null;
  let member: any = null;
  let writes = 0;
  prisma.student.findUnique = (async () => student) as any;
  prisma.member.findUnique = (async () => member) as any;
  prisma.visitorLog.findFirst = (async () => ({
    fullName: 'Nama database', identityNumber: '123456789', studyProgram: 'Akuntansi', checkInTime: new Date(),
  })) as any;
  prisma.visitorLog.create = (async () => { writes++; throw new Error('Unexpected write'); }) as any;
  prisma.visitorLog.update = (async () => { writes++; throw new Error('Unexpected write'); }) as any;
  const request = () => POST(new Request('http://localhost/api/presensi', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identityNumber: '123456789', fullName: 'Nama palsu' }),
  }));
  let response = await request();
  assert.equal(response.status, 404);
  assert.equal((await response.json()).registerUrl, '/pendaftaran');
  for (const status of ['PENDING', 'REJECTED', 'APPROVED']) {
    member = { fullName: 'Nama database', studyProgram: 'Akuntansi', status };
    response = await request();
    assert.equal(response.status, status === 'APPROVED' ? 200 : 404);
  }
  student = { fullName: 'Nama database', studyProgram: 'Akuntansi' };
  member = null;
  response = await request();
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.fullName, 'Nama database');
  assert.equal(writes, 0);
  console.log('Presensi gate: unknown, pending, rejected, approved, student passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
