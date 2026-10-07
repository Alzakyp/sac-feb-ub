import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

function requireStaff(req: NextRequest) {
  return verifySession(req.cookies.get('sac_session')?.value || '');
}

export async function GET(request: NextRequest) {
  const staff = requireStaff(request);
  if (!staff) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('q') || '';
  const where = search ? { OR: [{ nim: { contains: search } }, { requestNumber: { contains: search } }] } : {};
  const data = await prisma.plagiarismRequest.findMany({ where, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  // Public endpoint untuk mahasiswa
  const body = await request.json().catch(() => ({}));
  const { nim, fullName, email, studyProgram, workType, title, fileName } = body;
  if (!nim || !title || !fileName) return NextResponse.json({ success: false, error: 'NIM, judul, dan nama file wajib diisi.' }, { status: 400 });

  const year = new Date().getFullYear();
  const count = await prisma.plagiarismRequest.count({ where: { requestNumber: { startsWith: `PLG-${year}` } } });
  const requestNumber = `PLG-${year}-${String(count + 1).padStart(4, '0')}`;

  const requestRecord = await prisma.plagiarismRequest.create({
    data: { requestNumber, nim, fullName, email, studyProgram, workType, title, fileName, filePath: `/uploads/plagiarism/${fileName}` },
  });
  return NextResponse.json({ success: true, data: requestRecord });
}
