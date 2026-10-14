import { NextRequest, NextResponse } from 'next/server';
import { UAParser } from 'ua-parser-js';
import { prisma } from '@/lib/prisma';
import { getRepositorySectionUrl, validateRepositoryAccess } from '@/lib/repository-access';
import { memberProfile } from '@/lib/member-profile';

const noStore = { 'Cache-Control': 'no-store' };

export async function POST(request: NextRequest) {
  const input = validateRepositoryAccess(await request.json().catch(() => null));
  if (!input) return NextResponse.json({ success: false, error: 'Data akses tidak valid.' }, { status: 400, headers: noStore });

  const profile = await memberProfile(request.cookies.get('sac_member_session')?.value);
  const nimToVerify = profile?.nim || input.nim;
  const student = await prisma.student.findUnique({ where: { nim: nimToVerify } });
  if (!student) return NextResponse.json({ success: false, error: 'Anda tidak mendapatkan akses ini.' }, { status: 403, headers: noStore });

  const document = await prisma.repositoryDocument.findUnique({
    where: { id: input.documentId },
    select: { id: true, bagianAwalUrl: true, bagianIsiUrl: true, bagianAkhirUrl: true },
  });
  if (!document) return NextResponse.json({ success: false, error: 'Dokumen tidak ditemukan.' }, { status: 404, headers: noStore });
  const url = getRepositorySectionUrl(document, input.section, input.accessType);
  if (!url) return NextResponse.json({ success: false, error: 'Berkas tidak tersedia.' }, { status: 404, headers: noStore });

  const parsed = new UAParser(request.headers.get('user-agent') || '').getResult();
  const device = parsed.device.type === 'mobile' ? 'Mobile' : parsed.device.type === 'tablet' ? 'Tablet' : 'PC';
  const browser = parsed.browser.name ? `${parsed.browser.name}${parsed.browser.major ? ` ${parsed.browser.major}` : ''}` : 'Unknown Browser';
  const forwarded = request.headers.get('x-forwarded-for');
  const ipAddress = forwarded?.split(',')[0].trim() || request.headers.get('x-real-ip') || '127.0.0.1';

  await prisma.$transaction([
    prisma.repositoryActivityLog.create({ data: { documentId: document.id, nim: student.nim, nama: student.fullName, prodi: student.studyProgram, aktifitas: input.accessType, purpose: input.purpose, accessType: input.accessType, section: input.section, device, browser, ipAddress } }),
    prisma.repositoryDocument.update({ where: { id: document.id }, data: input.accessType === 'READ' ? { viewCount: { increment: 1 } } : { downloadCount: { increment: 1 } } }),
  ]);

  return NextResponse.json({ success: true, url, accessType: input.accessType, section: input.section }, { headers: noStore });
}
