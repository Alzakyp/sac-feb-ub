import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { nim } = await req.json().catch(() => ({}));
    const cleanNim = String(nim || '').replace(/\s+/g, '').trim();
    if (!cleanNim) return NextResponse.json({ success: false, error: 'NIM wajib diisi.' }, { status: 400 });

    const [current, archive] = await Promise.all([
      prisma.scientificWorkDeposit.findMany({
        where: { identityNumber: cleanNim },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          depositNumber: true,
          fullName: true,
          identityNumber: true,
          studyProgram: true,
          workType: true,
          titleId: true,
          verificationStatus: true,
          hardcopySubmitted: true,
          revisionNotes: true,
          certificateUrl: true,
          createdAt: true,
          verifiedAt: true,
        },
      }),
      prisma.depositRecord.findMany({
        where: { nim: cleanNim },
        orderBy: { submittedAt: 'desc' },
        select: {
          id: true,
          proofNumber: true,
          fullName: true,
          nim: true,
          studyProgram: true,
          workType: true,
          title: true,
          validationDate: true,
          hardcopySubmitted: true,
          revisionNotes: true,
          downloadProofUrl: true,
          submittedAt: true,
          plagiarismScore: true,
          proofSent: true,
        },
      }),
    ]);

    const items = [
      ...current.map((item) => ({
        source: 'system' as const,
        id: item.id,
        number: item.depositNumber,
        fullName: item.fullName,
        nim: item.identityNumber,
        program: item.studyProgram,
        type: item.workType,
        title: item.titleId,
        status: item.verificationStatus,
        hardcopy: item.hardcopySubmitted,
        notes: item.revisionNotes,
        downloadUrl: item.certificateUrl,
        date: item.createdAt,
      })),
      ...archive.map((item) => ({
        source: 'archive' as const,
        id: item.id,
        number: item.proofNumber || '-',
        fullName: item.fullName,
        nim: item.nim,
        program: item.studyProgram,
        type: item.workType,
        title: item.title,
        status: item.validationDate ? 'APPROVED' : item.revisionNotes ? 'REVISION_NEEDED' : 'PENDING',
        hardcopy: item.hardcopySubmitted,
        notes: item.revisionNotes,
        downloadUrl: item.downloadProofUrl,
        date: item.submittedAt,
        plagiarismScore: item.plagiarismScore,
      })),
    ];

    return NextResponse.json({ success: true, count: items.length, data: items });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal mencari progres.' }, { status: 500 });
  }
}
