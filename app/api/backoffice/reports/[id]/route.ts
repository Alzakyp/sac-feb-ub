import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

type Context = { params: Promise<{ id: string }> };
function auth(req: NextRequest) { return verifySession(req.cookies.get('sac_session')?.value || ''); }

export async function PATCH(req: NextRequest, { params }: Context) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (body.status) {
    data.status = body.status;
    if (body.status === 'RESOLVED') data.resolvedAt = new Date();
  }
  if (typeof body.staffNotes === 'string') data.staffNotes = body.staffNotes.trim();
  const ticket = await prisma.ticketReport.update({ where: { id }, data }).catch(() => null);
  if (!ticket) return NextResponse.json({ success: false, error: 'Tiket tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ success: true, data: ticket });
}
