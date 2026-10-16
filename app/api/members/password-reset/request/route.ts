import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { newResetToken, resetTokenHash, RESET_MESSAGE, RESET_TTL_MS } from '@/lib/member-password-reset';
import { sendPasswordResetEmail } from '@/lib/mailer';
import { membershipAccountQuery, preferredMembership } from '@/lib/member-login';

export async function POST(req: NextRequest) {
  const identity = String((await req.json().catch(() => ({}))).identity || '').trim().toLowerCase();
  if (!identity || identity.length > 254) return NextResponse.json({ success: true, message: RESET_MESSAGE });
  const member = await prisma.member.findFirst({ where: { OR: [{ nim: identity }, { email: identity }] }, select: { id: true, email: true } });
  const records = member ? [] : await prisma.membershipRecord.findMany({ ...membershipAccountQuery(identity), take: 20, select: { id: true, email: true, passwordHash: true } });
  const record = preferredMembership(records);
  const account = member || record;
  if (!account?.email) return NextResponse.json({ success: true, message: RESET_MESSAGE });
  const token = newResetToken();
  const data = { passwordResetTokenHash: resetTokenHash(token), passwordResetExpiresAt: new Date(Date.now() + RESET_TTL_MS) };
  if (member) await prisma.member.update({ where: { id: member.id }, data }); else await prisma.membershipRecord.update({ where: { id: record!.id }, data });
  const base = (process.env.APP_URL || req.nextUrl.origin).replace(/\/$/, '');
  try { await sendPasswordResetEmail(account.email, `${base}/anggota/reset-password?token=${token}`); }
  catch (error) {
    console.error('Password reset mail error:', error);
    if (member) await prisma.member.update({ where: { id: member.id }, data: { passwordResetTokenHash: null, passwordResetExpiresAt: null } });
    else await prisma.membershipRecord.update({ where: { id: record!.id }, data: { passwordResetTokenHash: null, passwordResetExpiresAt: null } });
  }
  return NextResponse.json({ success: true, message: RESET_MESSAGE });
}
