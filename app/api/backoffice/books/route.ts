import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

function auth(req: NextRequest) { return verifySession(req.cookies.get('sac_session')?.value || ''); }

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = 20;
  const where = q ? { OR: [{ title: { contains: q } }, { author: { contains: q } }, { isbn: { contains: q } }, { ddc: { contains: q } }] } : {};
  const [total, data] = await Promise.all([prisma.bookCollection.count({ where }), prisma.bookCollection.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { inventoryNumber: 'asc' } })]);
  return NextResponse.json({ success: true, total, page, limit, data });
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.title) return NextResponse.json({ success: false, error: 'Judul buku wajib diisi.' }, { status: 400 });
  const data = await prisma.bookCollection.create({ data: { title: String(body.title), author: body.author || null, publisher: body.publisher || null, publicationYear: Number.isInteger(body.publicationYear) ? body.publicationYear : null, isbn: body.isbn || null, ddc: body.ddc || null, subject: body.subject || null } });
  return NextResponse.json({ success: true, data });
}
