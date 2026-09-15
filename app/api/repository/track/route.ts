import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UAParser } from 'ua-parser-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, aktifitas, kataKunci, nim, nama, prodi } = body;

    if (!aktifitas) {
      return NextResponse.json(
        { error: 'Field "aktifitas" wajib diisi' },
        { status: 400 }
      );
    }

    // Extract User Agent
    const userAgent = request.headers.get('user-agent') || '';
    const parser = new UAParser(userAgent);
    const parsedUA = parser.getResult();

    let device = 'PC';
    if (parsedUA.device.type === 'mobile') {
      device = 'Mobile';
    } else if (parsedUA.device.type === 'tablet') {
      device = 'Tablet';
    }

    const browser = parsedUA.browser.name
      ? `${parsedUA.browser.name}${parsedUA.browser.major ? ' ' + parsedUA.browser.major : ''}`
      : 'Unknown Browser';

    // Extract client IP address
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : request.headers.get('x-real-ip') || '127.0.0.1';

    // Create Activity Log
    await prisma.repositoryActivityLog.create({
      data: {
        documentId: documentId || null,
        aktifitas: String(aktifitas).toUpperCase(),
        kataKunci: kataKunci ? String(kataKunci).trim() : null,
        nim: nim ? String(nim).trim() : null,
        nama: nama ? String(nama).trim() : null,
        prodi: prodi ? String(prodi).trim() : null,
        device,
        browser,
        ipAddress,
      },
    });

    // Increment document counters if relevant
    if (documentId) {
      const actUpper = String(aktifitas).toUpperCase();
      const isDownloadAction =
        actUpper === 'DOWNLOAD' ||
        actUpper === 'CLICK_AWAL' ||
        actUpper === 'CLICK_ISI' ||
        actUpper === 'CLICK_AKHIR';

      const isViewAction = actUpper === 'VIEW_DETAIL';

      if (isDownloadAction || isViewAction) {
        await prisma.repositoryDocument.update({
          where: { id: documentId },
          data: {
            downloadCount: isDownloadAction ? { increment: 1 } : undefined,
            viewCount: isViewAction ? { increment: 1 } : undefined,
          },
        }).catch((e) => {
          console.warn('[Track] Could not increment document counter:', e.message);
        });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[API Repo Track Error]:', error);
    return NextResponse.json(
      {
        error: 'Gagal mencatat log aktivitas repositori',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
