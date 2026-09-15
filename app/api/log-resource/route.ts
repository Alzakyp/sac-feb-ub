import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resourceName } = body;

    if (!resourceName) {
      return NextResponse.json(
        { error: 'Nama e-resource wajib dikirimkan.' },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get('user-agent') || 'Unknown';

    const log = await prisma.resourceAccessLog.create({
      data: {
        resourceName,
        userAgent,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Log akses e-resource berhasil dicatat',
      data: log,
    });
  } catch (error) {
    console.error('Error in /api/log-resource:', error);
    return NextResponse.json(
      { error: 'Gagal mencatat akses e-resource' },
      { status: 500 }
    );
  }
}
