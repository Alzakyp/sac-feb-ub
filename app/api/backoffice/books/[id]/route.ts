import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';
import { bookInput } from '@/lib/backoffice-input';

type Context = { params: Promise<{ id: string }> };
function auth(req: NextRequest) { return verifySession(req.cookies.get('sac_session')?.value || ''); }

export async function GET(req: NextRequest, { params }: Context) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params; const data = await prisma.bookCollection.findUnique({ where: { id } });
  return data ? NextResponse.json({ success: true, data }) : NextResponse.json({ success: false, error: 'Buku tidak ditemukan.' }, { status: 404 });
}

export async function PATCH(req: NextRequest, { params }: Context) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params; const parsed = bookInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Data tidak valid.' }, { status: 400 });
  const book = await prisma.bookCollection.update({ where: { id }, data: parsed.data }).catch(() => null);
  if (!book) return NextResponse.json({ success: false, error: 'Buku tidak ditemukan atau nomor inventaris telah digunakan.' }, { status: 409 });
  return NextResponse.json({ success: true, data: book });
}

export async function DELETE(req: NextRequest, { params }: Context) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params; const deleted = await prisma.bookCollection.delete({ where: { id } }).catch(() => null);
  return deleted ? NextResponse.json({ success: true }) : NextResponse.json({ success: false, error: 'Buku tidak ditemukan.' }, { status: 404 });
}
