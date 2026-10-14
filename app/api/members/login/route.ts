import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createMemberSession } from '@/lib/member-session';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const identity = String(body.identity || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!identity || identity.length > 254 || !password || password.length > 256) return NextResponse.json({ success: false, error: 'NIM/email dan password wajib diisi.' }, { status: 400 });
  const member = await prisma.member.findFirst({ where: { OR: [{ nim: identity }, { email: identity }] } });
  if (member) {
    if (!['ACTIVE', 'APPROVED'].includes(member.status) || !await bcrypt.compare(password, member.passwordHash)) return NextResponse.json({ success: false, error: 'Kredensial tidak valid atau akun belum aktif.' }, { status: 401 });
    const response = NextResponse.json({ success: true, data: { fullName: member.fullName, nim: member.nim } });
    response.cookies.set('sac_member_session', createMemberSession({ source: 'member', accountId: member.id, nim: member.nim }), { httpOnly: true, sameSite: 'lax', secure: req.nextUrl.protocol === 'https:', path: '/', maxAge: 8 * 60 * 60 });
    return response;
  }
  const record = await prisma.membershipRecord.findFirst({ where: { OR: [{ nim: identity }, { email: identity }] } });
  if (!record || !record.passwordHash || !['ACTIVE', 'APPROVED'].includes(record.status) || !await bcrypt.compare(password, record.passwordHash)) return NextResponse.json({ success: false, error: 'Kredensial tidak valid, akun belum aktif, atau password belum tersedia.' }, { status: 401 });
  const response = NextResponse.json({ success: true, data: { fullName: record.fullName, nim: record.nim } });
  response.cookies.set('sac_member_session', createMemberSession({ source: 'sheet', accountId: record.id, nim: record.nim }), { httpOnly: true, sameSite: 'lax', secure: req.nextUrl.protocol === 'https:', path: '/', maxAge: 8 * 60 * 60 });
  return response;
}
