import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

function auth(req: NextRequest) { return verifySession(req.cookies.get('sac_session')?.value || ''); }

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const data = await prisma.ticketReport.findMany({ where: status && status !== 'ALL' ? { status } : {}, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ success: true, data });
}
