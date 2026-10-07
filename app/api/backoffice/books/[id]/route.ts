import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

type Context = { params: Promise<{ id: string }> };
function auth(req: NextRequest) { return verifySession(req.cookies.get('sac_session')?.value || ''); }

export async function PATCH(req: NextRequest, { params }: Context) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params; const body = await req.json().catch(() => ({}));
  const allowed = ['title', 'author', 'publisher', 'publicationYear', 'isbn', 'ddc', 'subject', 'edition', 'publicationPlace', 'physicalDescription'];
  const data: Record<string, unknown> = {};
  for (const key of allowed) if (key in body) data[key] = key === 'publicationYear' ? (Number.isInteger(body[key]) ? body[key] : null) : (body[key] ? String(body[key]).trim() : null);
  const book = await prisma.bookCollection.update({ where: { id }, data }).catch(() => null);
  if (!book) return NextResponse.json({ success: false, error: 'Buku tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ success: true, data: book });
}

export async function DELETE(req: NextRequest, { params }: Context) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params; await prisma.bookCollection.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
