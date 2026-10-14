import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';
import { repositoryInput } from '@/lib/backoffice-input';

function auth(req: NextRequest) {
  const token = req.cookies.get('sac_session')?.value || '';
  return verifySession(token);
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));
  const skip = (page - 1) * limit;

  const where = q
    ? {
        OR: [
          { judul: { contains: q } },
          { nama: { contains: q } },
          { nim: { contains: q } },
          { prodi: { contains: q } },
        ],
      }
    : {};

  const [total, data] = await Promise.all([
    prisma.repositoryDocument.count({ where }),
    prisma.repositoryDocument.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return NextResponse.json({ success: true, total, page, limit, data });
}

export async function POST(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const parsed = repositoryInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Data tidak valid.' }, { status: 400 });
  const created = await prisma.repositoryDocument.create({ data: parsed.data });

  return NextResponse.json({ success: true, data: created });
}
