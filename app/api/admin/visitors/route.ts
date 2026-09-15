import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search')?.trim() || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(5, parseInt(searchParams.get('limit') || '25')));
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (status !== 'all') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { identityNumber: { contains: search } },
        { fullName: { contains: search } },
        { studyProgram: { contains: search } },
      ];
    }

    const [visitors, totalCount, activeCount, completedCount] = await Promise.all([
      prisma.visitorLog.findMany({
        where: whereClause,
        orderBy: { checkInTime: 'desc' },
        skip,
        take: limit,
      }),
      prisma.visitorLog.count({ where: whereClause }),
      prisma.visitorLog.count({ where: { status: 'ACTIVE' } }),
      prisma.visitorLog.count({ where: { status: 'COMPLETED' } }),
    ]);

    // Format data dengan durasi
    const formattedVisitors = visitors.map((v) => {
      let durationStr = '-';
      if (v.checkOutTime) {
        const diffMs = new Date(v.checkOutTime).getTime() - new Date(v.checkInTime).getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 60) {
          durationStr = `${mins} menit`;
        } else {
          const hrs = Math.floor(mins / 60);
          const rem = mins % 60;
          durationStr = `${hrs} jam ${rem} menit`;
        }
      } else if (v.status === 'ACTIVE') {
        const diffMs = Date.now() - new Date(v.checkInTime).getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 60) {
          durationStr = `${mins} mnt (aktif)`;
        } else {
          const hrs = Math.floor(mins / 60);
          const rem = mins % 60;
          durationStr = `${hrs}j ${rem}m (aktif)`;
        }
      }

      return {
        ...v,
        duration: durationStr,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedVisitors,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      counts: {
        total: totalCount,
        active: activeCount,
        completed: completedCount,
      },
    });
  } catch (error) {
    console.error('API Admin Visitors Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data presensi pengunjung.',
      },
      { status: 500 }
    );
  }
}
