import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

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

  const body = await req.json().catch(() => ({}));
  const { nama, nim, prodi, judul, jenis, pembimbing, bagianAwalUrl, bagianIsiUrl, bagianAkhirUrl } = body;
  if (!nama || !nim || !judul) {
    return NextResponse.json({ success: false, error: 'Nama, NIM, dan Judul wajib diisi.' }, { status: 400 });
  }

  const created = await prisma.repositoryDocument.create({
    data: {
      nama: String(nama).trim(),
      nim: String(nim).trim(),
      prodi: String(prodi || 'FEB UB').trim(),
      judul: String(judul).trim(),
      jenis: String(jenis || 'Skripsi').trim(),
      pembimbing: pembimbing ? String(pembimbing).trim() : null,
      bagianAwalUrl: bagianAwalUrl ? String(bagianAwalUrl).trim() : null,
      bagianIsiUrl: bagianIsiUrl ? String(bagianIsiUrl).trim() : null,
      bagianAkhirUrl: bagianAkhirUrl ? String(bagianAkhirUrl).trim() : null,
    },
  });

  return NextResponse.json({ success: true, data: created });
}
