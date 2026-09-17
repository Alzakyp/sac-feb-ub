import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nim = (searchParams.get('nim') || '').trim();

    if (!nim || nim.length < 5) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nomor Induk Mahasiswa (NIM) wajib diisi minimal 5 digit.',
        },
        { status: 400 }
      );
    }

    const deposits = await prisma.scientificWorkDeposit.findMany({
      where: {
        identityNumber: nim,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      count: deposits.length,
      data: deposits,
    });
  } catch (error: any) {
    console.error('Error in /api/chat-sac/check-deposit:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memverifikasi status tanda terima.',
      },
      { status: 500 }
    );
  }
}
