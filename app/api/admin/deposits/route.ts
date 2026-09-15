import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const degreeLevel = searchParams.get('degreeLevel') || 'all';
    const search = searchParams.get('search')?.trim() || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(5, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (status !== 'all') {
      whereClause.verificationStatus = status;
    }

    if (degreeLevel !== 'all') {
      whereClause.degreeLevel = degreeLevel;
    }

    if (search) {
      whereClause.OR = [
        { identityNumber: { contains: search } },
        { fullName: { contains: search } },
        { depositNumber: { contains: search } },
        { titleId: { contains: search } },
      ];
    }

    const [deposits, totalCount, pendingCount, approvedCount, revisionCount, rejectedCount] =
      await Promise.all([
        prisma.scientificWorkDeposit.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.scientificWorkDeposit.count({ where: whereClause }),
        prisma.scientificWorkDeposit.count({ where: { verificationStatus: 'PENDING' } }),
        prisma.scientificWorkDeposit.count({ where: { verificationStatus: 'APPROVED' } }),
        prisma.scientificWorkDeposit.count({ where: { verificationStatus: 'REVISION_NEEDED' } }),
        prisma.scientificWorkDeposit.count({ where: { verificationStatus: 'REJECTED' } }),
      ]);

    return NextResponse.json({
      success: true,
      data: deposits,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      counts: {
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
        revision: revisionCount,
        rejected: rejectedCount,
      },
    });
  } catch (error) {
    console.error('API Admin Deposits Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data pengajuan serah simpan karya ilmiah.',
      },
      { status: 500 }
    );
  }
}
