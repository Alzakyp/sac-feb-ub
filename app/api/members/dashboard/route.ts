import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { memberProfile } from '@/lib/member-profile';

export async function GET(req: NextRequest) {
  const profile = await memberProfile(req.cookies.get('sac_member_session')?.value);
  if (!profile) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const deposits = await prisma.scientificWorkDeposit.findMany({ where: { identityNumber: profile.nim }, orderBy: { createdAt: 'desc' }, select: { id: true, titleId: true, verificationStatus: true, createdAt: true, hardcopySubmitted: true, revisionNotes: true, certificateUrl: true } });
  const counts = Object.fromEntries(['PENDING', 'APPROVED', 'REVISION_NEEDED', 'REJECTED'].map(status => [status, deposits.filter(item => item.verificationStatus === status).length]));
  return NextResponse.json({ success: true, data: { deposits, counts } });
}
