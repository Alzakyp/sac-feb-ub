import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = verifySession(request.cookies.get('sac_session')?.value || '');
  if (!session) return NextResponse.json({ success: false }, { status: 401 });
  const staff = await prisma.staff.findUnique({ where: { id: session.staffId }, select: { name: true, email: true, role: true, active: true } });
  if (!staff || !staff.active) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json({ success: true, staff });
}
