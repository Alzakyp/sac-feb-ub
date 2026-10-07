import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const nim = (new URL(req.url).searchParams.get('nim') || '').replace(/\D/g, '');
    if (nim.length < 5) return NextResponse.json({ success: false, error: 'NIM minimal 5 digit.' }, { status: 400 });
    const member = await prisma.member.findUnique({ where: { nim }, select: { fullName: true, email: true, status: true } });
    if (!member || member.status !== 'ACTIVE') return NextResponse.json({ success: false, error: 'NIM belum terdaftar atau masih menunggu verifikasi staf.' }, { status: 404 });
    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    console.error('Member verification error:', error);
    return NextResponse.json({ success: false, error: 'Verifikasi NIM sedang bermasalah. Coba kembali.' }, { status: 500 });
  }
}
