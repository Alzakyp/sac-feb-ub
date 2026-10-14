import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { memberProfile } from '@/lib/member-profile';
import { verifySession } from '@/lib/session';
import { proofHtml } from '@/lib/deposit-proof';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const [member, staff] = await Promise.all([memberProfile(req.cookies.get('sac_member_session')?.value), Promise.resolve(verifySession(req.cookies.get('sac_session')?.value || ''))]);
  if (!member && !staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const deposit = await prisma.scientificWorkDeposit.findUnique({ where: { id } });
  if (!deposit || deposit.verificationStatus !== 'PROOF_ISSUED' || (!staff && member?.nim !== deposit.identityNumber)) return NextResponse.json({ error: 'Bukti tidak ditemukan.' }, { status: 404 });
  return new NextResponse(proofHtml(deposit), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'" } });
}
