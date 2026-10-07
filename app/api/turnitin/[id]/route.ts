import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  const { id } = await params;
  // Publik: cek status dengan requestNumber
  const record = await prisma.plagiarismRequest.findFirst({
    where: { OR: [{ id }, { requestNumber: id }] },
    select: { requestNumber: true, nim: true, fullName: true, title: true, workType: true, status: true, similarityScore: true, staffNotes: true, createdAt: true, processedAt: true },
  });
  if (!record) return NextResponse.json({ success: false, error: 'Pengajuan tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ success: true, data: record });
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const staff = verifySession(request.cookies.get('sac_session')?.value || '');
  if (!staff) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (body.status) data.status = body.status;
  if (typeof body.similarityScore === 'number') data.similarityScore = body.similarityScore;
  if (body.staffNotes) data.staffNotes = body.staffNotes;
  if (body.status === 'COMPLETED' || body.status === 'REJECTED') data.processedAt = new Date();
  const updated = await prisma.plagiarismRequest.update({ where: { id }, data });
  return NextResponse.json({ success: true, data: updated });
}
