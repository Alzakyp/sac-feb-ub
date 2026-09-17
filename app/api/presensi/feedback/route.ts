import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawRating = Number(body?.rating);
    const sessionId = typeof body?.sessionId === 'string' ? body.sessionId.trim() : '';
    const nim = typeof body?.nim === 'string' ? body.nim.trim() : '';
    const notes = typeof body?.notes === 'string' ? body.notes.trim() : null;

    if (!rawRating || isNaN(rawRating) || rawRating < 1 || rawRating > 5) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rating tidak valid. Nilai harus antara 1 sampai 5.',
        },
        { status: 400 }
      );
    }

    let targetId: string | null = null;

    if (sessionId) {
      const log = await prisma.visitorLog.findUnique({
        where: { id: sessionId },
      });
      if (log) {
        targetId = log.id;
      }
    }

    if (!targetId && nim) {
      const latestLog = await prisma.visitorLog.findFirst({
        where: { identityNumber: nim },
        orderBy: { createdAt: 'desc' },
      });
      if (latestLog) {
        targetId = latestLog.id;
      }
    }

    if (!targetId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sesi kunjungan tidak ditemukan untuk menyimpan penilaian.',
        },
        { status: 404 }
      );
    }

    const updated = await prisma.visitorLog.update({
      where: { id: targetId },
      data: {
        satisfactionRating: Math.round(rawRating),
        feedbackNotes: notes || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Terima kasih atas masukan dan penilaian Anda!',
        data: {
          id: updated.id,
          rating: updated.satisfactionRating,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in /api/presensi/feedback:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal menyimpan penilaian.',
      },
      { status: 500 }
    );
  }
}
