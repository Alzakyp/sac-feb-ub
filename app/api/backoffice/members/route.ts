import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

function auth(req: NextRequest) { return verifySession(req.cookies.get('sac_session')?.value || ''); }

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const where = q ? { OR: [{ fullName: { contains: q } }, { nim: { contains: q } }, { email: { contains: q } }] } : {};
  const data = await prisma.member.findMany({ where, orderBy: { createdAt: 'desc' }, select: { id: true, memberType: true, fullName: true, nim: true, studyProgram: true, whatsapp: true, email: true, status: true, createdAt: true, selfiePath: true, identityPath: true } });
  return NextResponse.json({ success: true, data });
}
