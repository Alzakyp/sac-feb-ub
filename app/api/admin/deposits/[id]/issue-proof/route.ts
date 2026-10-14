import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';
import { proofNumber } from '@/lib/deposit-proof';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = verifySession(req.cookies.get('sac_session')?.value || '');
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  const deposit = await prisma.scientificWorkDeposit.findUnique({ where: { id } });
  if (!deposit) return NextResponse.json({ success: false, error: 'Pengajuan tidak ditemukan.' }, { status: 404 });
  if (deposit.verificationStatus === 'PROOF_ISSUED') return NextResponse.json({ success: true, data: deposit });
  if (deposit.verificationStatus !== 'APPROVED') return NextResponse.json({ success: false, error: 'Bukti hanya dapat diterbitkan setelah pengajuan disetujui.' }, { status: 400 });
  const now = new Date();
  const proof = proofNumber(deposit.depositNumber, now);
  const changed = await prisma.scientificWorkDeposit.updateMany({ where: { id, verificationStatus: 'APPROVED' }, data: { verificationStatus: 'PROOF_ISSUED', proofNumber: proof, proofIssuedAt: now, proofVersion: { increment: 1 } } });
  const updated = await prisma.scientificWorkDeposit.findUnique({ where: { id } });
  if (!changed.count && updated?.verificationStatus !== 'PROOF_ISSUED') return NextResponse.json({ success: false, error: 'Status berubah. Muat ulang pengajuan.' }, { status: 409 });
  return NextResponse.json({ success: true, data: updated });
}
