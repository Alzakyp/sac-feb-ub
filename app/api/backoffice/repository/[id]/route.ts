import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

type Context = { params: Promise<{ id: string }> };

function auth(req: NextRequest) {
  return verifySession(req.cookies.get('sac_session')?.value || '');
}

export async function PATCH(req: NextRequest, { params }: Context) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const allowed = ['judul', 'nama', 'nim', 'prodi', 'jenis', 'pembimbing', 'bagianAwalUrl', 'bagianIsiUrl', 'bagianAkhirUrl'];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key] ? String(body[key]).trim() : null;
  }
  const doc = await prisma.repositoryDocument.update({ where: { id }, data }).catch(() => null);
  if (!doc) return NextResponse.json({ success: false, error: 'Data tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ success: true, data: doc });
}

export async function DELETE(req: NextRequest, { params }: Context) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await prisma.repositoryDocument.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
