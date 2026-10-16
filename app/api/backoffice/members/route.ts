import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';
import { membershipInput } from '@/lib/backoffice-input';

function auth(req: NextRequest) { return verifySession(req.cookies.get('sac_session')?.value || ''); }

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const status = (searchParams.get('status') || '').trim();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = 25;
  const memberWhere = { ...(q ? { OR: [{ fullName: { contains: q } }, { nim: { contains: q } }, { email: { contains: q } }] } : {}), ...(status ? { status } : {}) };
  const recordWhere = { ...(q ? { OR: [{ fullName: { contains: q } }, { nim: { contains: q } }, { email: { contains: q } }] } : {}), ...(status ? { status } : {}) };

  const [members, records] = await Promise.all([
    prisma.member.findMany({ where: memberWhere, select: { id: true, memberType: true, fullName: true, nim: true, studyProgram: true, whatsapp: true, email: true, status: true, createdAt: true } }),
    prisma.membershipRecord.findMany({ where: recordWhere, select: { id: true, sourceKey: true, memberType: true, fullName: true, nim: true, studyProgram: true, whatsapp: true, email: true, status: true, registeredAt: true } }),
  ]);

  // Web accounts take precedence for the same NIM because they support sign-in.
  const webNims = new Set(members.map(member => member.nim));
  const data = [
    ...members.map(member => ({ ...member, recordKind: 'members', source: 'WEB' })),
    ...records.filter(record => !webNims.has(record.nim)).map(record => ({ ...record, createdAt: record.registeredAt, recordKind: 'membership-records', source: record.sourceKey && !record.sourceKey.startsWith('local:') ? 'SHEET' : 'LOCAL' })),
  ].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));

  return NextResponse.json({ success: true, data: data.slice((page - 1) * limit, page * limit), total: data.length, page, limit });
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const parsed = membershipInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !parsed.data?.password) return NextResponse.json({ success: false, error: parsed.success ? 'Password wajib diisi.' : parsed.error.issues[0]?.message }, { status: 400 });
  const { password, ...input } = parsed.data;
  const data = await prisma.member.create({ data: { ...input, passwordHash: await bcrypt.hash(password, 10), whatsapp: input.whatsapp || '', mailingAddress: input.mailingAddress || '', identityType: input.identityType || '' }, select: { id: true, fullName: true, nim: true, email: true, status: true } }).catch(() => null);
  return data ? NextResponse.json({ success: true, data }, { status: 201 }) : NextResponse.json({ success: false, error: 'NIM atau email sudah digunakan.' }, { status: 409 });
}
