import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

const MAX_FILE = 20 * 1024 * 1024;

export async function GET(request: NextRequest) {
  const session = verifySession(request.cookies.get('sac_session')?.value || '');
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const data = await prisma.plagiarismRequest.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ success: false, error: 'Format formulir tidak valid.' }, { status: 400 });
  const nim = String(form.get('nim') || '').trim();
  const fullName = String(form.get('fullName') || '').trim();
  const email = String(form.get('email') || '').trim();
  const whatsapp = String(form.get('whatsapp') || '').trim();
  const studyProgram = String(form.get('studyProgram') || '').trim();
  const workType = String(form.get('workType') || '').trim();
  const advisor = String(form.get('advisor') || '').trim();
  const title = String(form.get('title') || '').trim();
  const file = form.get('file');
  if (!nim || !fullName || !email || !whatsapp || !studyProgram || !workType || !advisor || !title || !(file instanceof File)) return NextResponse.json({ success: false, error: 'Semua data dan file PDF wajib diisi.' }, { status: 400 });
  if (file.type !== 'application/pdf' || file.size > MAX_FILE) return NextResponse.json({ success: false, error: 'File wajib PDF dan maksimal 20 MB.' }, { status: 400 });
  const dir = path.join(process.cwd(), 'storage', 'plagiarism'); await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.pdf`; await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  const count = await prisma.plagiarismRequest.count();
  const requestNumber = `PLG-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  const data = await prisma.plagiarismRequest.create({ data: { requestNumber, nim, fullName, email, whatsapp, studyProgram, workType, advisor, title, fileName: file.name, filePath: path.join('storage', 'plagiarism', name) } });
  return NextResponse.json({ success: true, data });
}
