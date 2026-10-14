import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';
const auth = (req: NextRequest) => verifySession(req.cookies.get('sac_session')?.value || '');
const clean = (value: unknown) => String(value || '').trim();
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const q = clean(req.nextUrl.searchParams.get('q'));
  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page')) || 1);
  const take = 25;
  const where = q ? { OR: [{ fullName: { contains: q } }, { nim: { contains: q } }, { email: { contains: q } }] } : {};
  const [total, data] = await Promise.all([prisma.membershipRecord.count({ where }), prisma.membershipRecord.findMany({ where, take, skip: (page - 1) * take, orderBy: { registeredAt: 'desc' }, select: { id: true, sourceKey: true, registeredAt: true, memberType: true, nim: true, fullName: true, studyProgram: true, whatsapp: true, email: true, mailingAddress: true, identityType: true, status: true, activeDate: true, validUntil: true } })]);
  return NextResponse.json({ success: true, total, page, limit: take, data });
}
export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const nim = clean(body.nim).replace(/\s/g, ''), fullName = clean(body.fullName);
  if (!nim || !fullName) return NextResponse.json({ success: false, error: 'NIM dan nama wajib diisi.' }, { status: 400 });
  const sourceKey = `local:${createHash('sha256').update(`${Date.now()}:${nim}`).digest('hex')}`;
  const data = await prisma.membershipRecord.create({ data: { sourceKey, nim, fullName, memberType: clean(body.memberType) || 'Mahasiswa', studyProgram: clean(body.studyProgram) || null, whatsapp: clean(body.whatsapp) || null, email: clean(body.email).toLowerCase() || null, mailingAddress: clean(body.mailingAddress) || null, identityType: clean(body.identityType) || null, status: clean(body.status) || 'ACTIVE', registeredAt: new Date() }, select: { id: true, sourceKey: true, memberType: true, nim: true, fullName: true, studyProgram: true, whatsapp: true, email: true, mailingAddress: true, identityType: true, status: true, registeredAt: true } }).catch(() => null);
  return data ? NextResponse.json({ success: true, data }, { status: 201 }) : NextResponse.json({ success: false, error: 'Data gagal dibuat.' }, { status: 409 });
}
