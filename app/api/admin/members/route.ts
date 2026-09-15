import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const membershipType = searchParams.get('membershipType') || 'all';
    const studyProgram = searchParams.get('studyProgram') || 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(5, parseInt(searchParams.get('limit') || '25')));
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (membershipType !== 'all') {
      whereClause.membershipType = membershipType;
    }

    if (studyProgram !== 'all') {
      whereClause.studyProgram = studyProgram;
    }

    if (search) {
      whereClause.OR = [
        { identityNumber: { contains: search } },
        { fullName: { contains: search } },
        { pin: { contains: search } },
        { email: { contains: search } },
        { whatsapp: { contains: search } },
      ];
    }

    const [members, totalCount] = await Promise.all([
      prisma.member.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.member.count({ where: whereClause }),
    ]);

    // Omit sensitive password from response
    const sanitizedMembers = members.map(({ password, ...m }) => m);

    return NextResponse.json({
      success: true,
      data: sanitizedMembers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('API Admin Members Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data anggota terdaftar.',
      },
      { status: 500 }
    );
  }
}
