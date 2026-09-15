import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCache, setCache } from '@/lib/redis';

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const searchParams = request.nextUrl.searchParams;

  const q = (searchParams.get('q') || '').trim();
  const prodi = (searchParams.get('prodi') || '').trim();
  const jenis = (searchParams.get('jenis') || '').trim();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '15', 10)));

  // Generate unique cache key
  const cacheKey = `repo:search:${encodeURIComponent(q.toLowerCase())}:${encodeURIComponent(prodi.toLowerCase())}:${encodeURIComponent(jenis.toLowerCase())}:${page}:${limit}`;

  // 1. Check Redis Cache
  const cachedData = await getCache<any>(cacheKey);
  if (cachedData) {
    const duration = (performance.now() - startTime).toFixed(1);
    return NextResponse.json(
      {
        ...cachedData,
        meta: {
          ...cachedData.meta,
          cached: true,
          executionTimeMs: parseFloat(duration),
        },
      },
      {
        status: 200,
        headers: {
          'X-Cache': 'HIT',
          'X-Response-Time': `${duration}ms`,
        },
      }
    );
  }

  // 2. Query Prisma on Cache MISS
  const whereClause: any = {};

  if (q) {
    whereClause.OR = [
      { judul: { contains: q } },
      { judulEn: { contains: q } },
      { nama: { contains: q } },
      { nim: { contains: q } },
      { pembimbing: { contains: q } },
    ];
  }

  if (prodi && prodi.toLowerCase() !== 'all' && prodi.toLowerCase() !== 'semua') {
    whereClause.prodi = { contains: prodi };
  }

  if (jenis && jenis.toLowerCase() !== 'all' && jenis.toLowerCase() !== 'semua') {
    whereClause.jenis = { equals: jenis };
  }

  const skip = (page - 1) * limit;

  try {
    const [totalCount, documents] = await Promise.all([
      prisma.repositoryDocument.count({ where: whereClause }),
      prisma.repositoryDocument.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: [{ id: 'asc' }],
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const duration = (performance.now() - startTime).toFixed(1);

    const responsePayload = {
      data: documents,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
      meta: {
        cached: false,
        executionTimeMs: parseFloat(duration),
        cacheKey,
      },
    };

    // 3. Save to Redis Cache (TTL 600s = 10 minutes)
    await setCache(cacheKey, responsePayload, 600);

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        'X-Cache': 'MISS',
        'X-Response-Time': `${duration}ms`,
      },
    });
  } catch (error) {
    console.error('[API Repo Search Error]:', error);
    return NextResponse.json(
      {
        error: 'Terjadi kesalahan saat mencari dokumen repositori',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
