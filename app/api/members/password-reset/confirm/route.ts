import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { resetTokenHash, validResetInput } from '@/lib/member-password-reset';

export async function POST(req: NextRequest) {
  const { token, password } = await req.json().catch(() => ({}));
  if (!validResetInput(token, password)) return NextResponse.json({ success: false, error: 'Token atau password tidak valid.' }, { status: 400 });
  const hash = resetTokenHash(token);
  const now = new Date();
  const [member, record] = await Promise.all([
    prisma.member.findFirst({ where: { passwordResetTokenHash: hash, passwordResetExpiresAt: { gt: now } }, select: { id: true } }),
    prisma.membershipRecord.findFirst({ where: { passwordResetTokenHash: hash, passwordResetExpiresAt: { gt: now } }, select: { id: true } }),
  ]);
  if (!member && !record) return NextResponse.json({ success: false, error: 'Tautan reset tidak valid atau sudah kedaluwarsa.' }, { status: 400 });
  const data = { passwordHash: await bcrypt.hash(password, 12), passwordResetTokenHash: null, passwordResetExpiresAt: null };
  if (member) await prisma.member.update({ where: { id: member.id }, data }); else await prisma.membershipRecord.update({ where: { id: record!.id }, data });
  return NextResponse.json({ success: true });
}
