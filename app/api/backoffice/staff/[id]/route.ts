import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

type Context = { params: Promise<{ id: string }> };

function adminOnly(request: NextRequest) {
  const session = verifySession(request.cookies.get('sac_session')?.value || '');
  return session?.role === 'ADMIN' ? session : null;
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const session = adminOnly(request);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const data: { name?: string; role?: string; active?: boolean; passwordHash?: string } = {};
  if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim();
  if (body.role === 'ADMIN' || body.role === 'PETUGAS') data.role = body.role;
  if (typeof body.active === 'boolean') {
    if (id === session.staffId && body.active === false) return NextResponse.json({ success: false, error: 'Tidak dapat menonaktifkan akun sendiri.' }, { status: 400 });
    data.active = body.active;
  }
  if (typeof body.password === 'string' && body.password) {
    if (body.password.length < 8) return NextResponse.json({ success: false, error: 'Password minimal 8 karakter.' }, { status: 400 });
    data.passwordHash = await bcrypt.hash(body.password, 10);
  }
  const staff = await prisma.staff.update({ where: { id }, data, select: { id: true, name: true, email: true, role: true, active: true, createdAt: true } }).catch(() => null);
  if (!staff) return NextResponse.json({ success: false, error: 'Staf tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ success: true, data: staff });
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const session = adminOnly(request);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (id === session.staffId) return NextResponse.json({ success: false, error: 'Tidak dapat menghapus akun sendiri.' }, { status: 400 });
  const target = await prisma.staff.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ success: false, error: 'Staf tidak ditemukan.' }, { status: 404 });
  if (target.role === 'ADMIN' && await prisma.staff.count({ where: { role: 'ADMIN', active: true } }) <= 1) return NextResponse.json({ success: false, error: 'Admin aktif terakhir tidak dapat dihapus.' }, { status: 400 });
  await prisma.staff.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
