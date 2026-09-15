import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const now = new Date();

    // Update seluruh sesi berstatus ACTIVE menjadi COMPLETED
    const result = await prisma.visitorLog.updateMany({
      where: {
        status: 'ACTIVE',
      },
      data: {
        status: 'COMPLETED',
        checkOutTime: now,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil melakukan checkout paksa untuk ${result.count} pengunjung aktif.`,
      updatedCount: result.count,
      timestamp: now,
    });
  } catch (error) {
    console.error('API Force Checkout Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal melakukan checkout paksa pengunjung.',
      },
      { status: 500 }
    );
  }
}
