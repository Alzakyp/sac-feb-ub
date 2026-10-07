import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

function adminOnly(request: NextRequest) {
  const session = verifySession(request.cookies.get('sac_session')?.value || '');
  if (!session || session.role !== 'ADMIN') return null;
  return session;
}

/** GET /api/sac-staff/staff — daftar semua staf */
export async function GET(request: NextRequest) {
  const session = adminOnly(request);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const staff = await prisma.staff.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
  });
  return NextResponse.json({ success: true, data: staff });
}

/** POST /api/sac-staff/staff — tambah staf baru */
export async function POST(request: NextRequest) {
  const session = adminOnly(request);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim();
  const role = body.role === 'ADMIN' ? 'ADMIN' : 'PETUGAS';
  const password = String(body.password || '');

  if (!email || !name || !password) return NextResponse.json({ success: false, error: 'Email, nama, dan password wajib diisi.' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ success: false, error: 'Password minimal 8 karakter.' }, { status: 400 });
  if (!email.endsWith('@ub.ac.id') && !email.endsWith('@student.ub.ac.id')) return NextResponse.json({ success: false, error: 'Email harus domain UB (@ub.ac.id).' }, { status: 400 });

  const exists = await prisma.staff.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ success: false, error: 'Email sudah terdaftar.' }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const staff = await prisma.staff.create({ data: { email, name, role, passwordHash } });
  return NextResponse.json({ success: true, data: { id: staff.id, email: staff.email, name: staff.name, role: staff.role, active: staff.active } });
}
