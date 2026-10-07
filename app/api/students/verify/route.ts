import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const nim = (new URL(req.url).searchParams.get('nim') || '').replace(/\D/g, '');
  if (nim.length < 5) return NextResponse.json({ success: false, error: 'NIM minimal 5 digit.' }, { status: 400 });
  const student = await prisma.student.findUnique({ where: { nim } });
  if (!student) return NextResponse.json({ success: false, error: 'NIM tidak terdaftar di database master mahasiswa.' }, { status: 404 });
  return NextResponse.json({ success: true, data: { fullName: student.fullName, studyProgram: student.studyProgram } });
}
