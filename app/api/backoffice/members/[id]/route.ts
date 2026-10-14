import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

type Context = { params: Promise<{ id: string }> };
function auth(req: NextRequest) { return verifySession(req.cookies.get('sac_session')?.value || ''); }

export async function GET(req: NextRequest, { params }: Context) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const member = await prisma.member.findUnique({
    where: { id },
    select: { id: true, memberType: true, fullName: true, nim: true, studyLevel: true, studyProgram: true, whatsapp: true, email: true, mailingAddress: true, identityType: true, status: true, createdAt: true, selfiePath: true, identityPath: true },
  });
  if (!member) return NextResponse.json({ success: false, error: 'Anggota tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ success: true, data: member });
}

export async function PATCH(req: NextRequest, { params }: Context) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const allowed = ['fullName', 'studyProgram', 'studyLevel', 'whatsapp', 'email', 'mailingAddress', 'identityType', 'status'];
  const data: Record<string, unknown> = {};
  for (const key of allowed) if (key in body) data[key] = key === 'email' ? String(body[key] || '').trim().toLowerCase() : String(body[key] || '').trim();
  const member = await prisma.member.update({ where: { id }, data, select: { id: true, memberType: true, fullName: true, nim: true, studyLevel: true, studyProgram: true, whatsapp: true, email: true, mailingAddress: true, identityType: true, status: true, createdAt: true } }).catch(() => null);
  if (!member) return NextResponse.json({ success: false, error: 'Anggota tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ success: true, data: member });
}

export async function DELETE(req: NextRequest, { params }: Context) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await prisma.member.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
