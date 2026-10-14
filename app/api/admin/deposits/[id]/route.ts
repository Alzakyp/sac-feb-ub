import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { validateDepositDecision } from '@/lib/deposit-decision';
import { verifySession } from '@/lib/session';

const updateDepositSchema = z.object({
  verificationStatus: z.enum(['PENDING', 'APPROVED', 'REVISION_NEEDED', 'REJECTED']),
  hardcopySubmitted: z.boolean().optional(),
  revisionNotes: z.string().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!verifySession(request.cookies.get('sac_session')?.value || '')) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID deposit tidak valid.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = updateDepositSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || 'Data tidak valid.',
        },
        { status: 400 }
      );
    }

    const { verificationStatus, hardcopySubmitted, revisionNotes } = validation.data;

    // Cek apakah deposit ada
    const existing = await prisma.scientificWorkDeposit.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Dokumen serah simpan tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (existing.verificationStatus === 'PROOF_ISSUED') return NextResponse.json({ success: false, error: 'Bukti sudah terbit; keputusan tidak dapat diubah.' }, { status: 409 });
    const decisionError = validateDepositDecision({
      status: verificationStatus,
      notes: revisionNotes || '',
      degreeLevel: existing.degreeLevel,
      hardcopy: hardcopySubmitted ?? existing.hardcopySubmitted,
    });
    if (decisionError) return NextResponse.json({ success: false, error: decisionError }, { status: 400 });

    const updateData: any = {
      verificationStatus,
      updatedAt: new Date(),
    };

    if (typeof hardcopySubmitted === 'boolean') {
      updateData.hardcopySubmitted = hardcopySubmitted;
    }

    if (revisionNotes !== undefined) {
      updateData.revisionNotes = revisionNotes;
    }

    if (verificationStatus === 'APPROVED') {
      updateData.verifiedAt = new Date();
      // Bukti baru tersedia setelah file benar-benar dibuat/diunggah petugas.
      updateData.revisionNotes = null;
    } else if (verificationStatus === 'REVISION_NEEDED' || verificationStatus === 'REJECTED') {
      updateData.verifiedAt = null;
    }

    const updated = await prisma.scientificWorkDeposit.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Status serah simpan berhasil diperbarui menjadi ${verificationStatus}.`,
      data: updated,
    });
  } catch (error) {
    console.error('API Update Deposit Status Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal memperbarui status pengajuan serah simpan.',
      },
      { status: 500 }
    );
  }
}
