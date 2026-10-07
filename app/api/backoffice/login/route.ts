import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!email || !password) return NextResponse.json({ success: false, error: 'Email dan password wajib diisi.' }, { status: 400 });
  const staff = await prisma.staff.findUnique({ where: { email } });
  if (!staff || !staff.active || !await bcrypt.compare(password, staff.passwordHash)) {
    return NextResponse.json({ success: false, error: 'Email atau password salah.' }, { status: 401 });
  }
  const response = NextResponse.json({ success: true, user: { name: staff.name, email: staff.email, role: staff.role } });
  // ponytail: server is currently accessed through HTTP LAN; switch to true after HTTPS is deployed.
  response.cookies.set('sac_session', createSession(staff.id, staff.role), {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  return response;
}
