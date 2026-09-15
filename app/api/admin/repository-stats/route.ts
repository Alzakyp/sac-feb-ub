import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25', 10)));
    const filterAction = searchParams.get('action') || '';
    const q = (searchParams.get('q') || '').trim();

    const whereClause: any = {};
    if (filterAction && filterAction !== 'all') {
      whereClause.aktifitas = filterAction;
    }
    if (q) {
      whereClause.OR = [
        { kataKunci: { contains: q } },
        { nama: { contains: q } },
        { nim: { contains: q } },
        { prodi: { contains: q } },
      ];
    }

    // 1. Fetch KPI metrics & Aggregations
    const [totalLogs, totalDocs, topDownloadedDocs, recentLogs, journalAccessLogs] = await Promise.all([
      prisma.repositoryActivityLog.count(),
      prisma.repositoryDocument.count(),
      prisma.repositoryDocument.findMany({
        take: 10,
        orderBy: [{ downloadCount: 'desc' }, { viewCount: 'desc' }],
        select: {
          id: true,
          nomor: true,
          judul: true,
          nama: true,
          prodi: true,
          jenis: true,
          downloadCount: true,
          viewCount: true,
        },
      }),
      prisma.repositoryActivityLog.findMany({
        where: whereClause,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: 'desc' },
        include: {
          document: {
            select: {
              id: true,
              judul: true,
              nomor: true,
              jenis: true,
            },
          },
        },
      }),
      prisma.resourceAccessLog.groupBy({
        by: ['resourceName'],
        _count: { resourceName: true },
      }),
    ]);

    // Format journal clicks
    const journalClicks = journalAccessLogs.map((j) => ({
      name: j.resourceName,
      count: j._count.resourceName,
    }));

    // 2. Fetch Top Keywords
    const topKeywordsRaw = await prisma.repositoryActivityLog.groupBy({
      by: ['kataKunci'],
      where: {
        kataKunci: { not: null },
      },
      _count: {
        kataKunci: true,
      },
      orderBy: {
        _count: {
          kataKunci: 'desc',
        },
      },
      take: 10,
    });

    const topKeywords = topKeywordsRaw
      .filter((item) => item.kataKunci && item.kataKunci.trim().length > 1)
      .map((item) => ({
        keyword: item.kataKunci,
        count: item._count.kataKunci,
      }));

    // Device distribution
    const deviceCounts = await prisma.repositoryActivityLog.groupBy({
      by: ['device'],
      _count: {
        device: true,
      },
    });

    const devices = deviceCounts.reduce((acc, curr) => {
      if (curr.device) {
        acc[curr.device] = curr._count.device;
      }
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      summary: {
        totalLogs,
        totalDocs,
        devices,
      },
      journalClicks,
      topKeywords,
      topDownloadedDocs,
      logs: recentLogs,
      pagination: {
        page,
        limit,
        total: totalLogs,
        totalPages: Math.ceil(totalLogs / limit),
      },
    });
  } catch (error) {
    console.error('[Admin Repo Stats Error]:', error);
    return NextResponse.json(
      {
        error: 'Gagal mengambil statistik repositori',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
