import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';
import { repositoryInput } from '@/lib/backoffice-input';

type Context = { params: Promise<{ id: string }> };

function auth(req: NextRequest) {
  return verifySession(req.cookies.get('sac_session')?.value || '');
}

export async function GET(req: NextRequest, { params }: Context) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params; const data = await prisma.repositoryDocument.findUnique({ where: { id } });
  return data ? NextResponse.json({ success: true, data }) : NextResponse.json({ success: false, error: 'Data tidak ditemukan.' }, { status: 404 });
}

export async function PATCH(req: NextRequest, { params }: Context) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const parsed = repositoryInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Data tidak valid.' }, { status: 400 });
  const doc = await prisma.repositoryDocument.update({ where: { id }, data: parsed.data }).catch(() => null);
  if (!doc) return NextResponse.json({ success: false, error: 'Data tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ success: true, data: doc });
}

export async function DELETE(req: NextRequest, { params }: Context) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const related = await prisma.repositoryActivityLog.count({ where: { documentId: id } });
  if (related) return NextResponse.json({ success: false, error: 'Dokumen memiliki log aktivitas dan tidak dapat dihapus.' }, { status: 409 });
  const deleted = await prisma.repositoryDocument.delete({ where: { id } }).catch(() => null);
  return deleted ? NextResponse.json({ success: true }) : NextResponse.json({ success: false, error: 'Data tidak ditemukan.' }, { status: 404 });
}
