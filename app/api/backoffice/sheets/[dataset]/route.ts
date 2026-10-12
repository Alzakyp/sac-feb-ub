import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

function authorized(req: NextRequest) { return verifySession(req.cookies.get('sac_session')?.value || ''); }

export async function GET(req: NextRequest, context: { params: Promise<{ dataset: string }> }) {
  if (!authorized(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { dataset } = await context.params;
  const params = req.nextUrl.searchParams;
  const q = (params.get('q') || '').trim();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.get('limit')) || 25));
  const skip = (page - 1) * limit;

  if (dataset === 'memberships') {
    const where = q ? { OR: [{ nim: { contains: q } }, { fullName: { contains: q } }, { email: { contains: q } }] } : {};
    const [total, data] = await Promise.all([prisma.membershipRecord.count({ where }), prisma.membershipRecord.findMany({ where, skip, take: limit, orderBy: { registeredAt: 'desc' } })]);
    return NextResponse.json({ success: true, total, page, limit, data });
  }
  if (dataset === 'deposits') {
    const where = q ? { OR: [{ nim: { contains: q } }, { fullName: { contains: q } }, { title: { contains: q } }] } : {};
    const [total, data] = await Promise.all([prisma.depositRecord.count({ where }), prisma.depositRecord.findMany({ where, skip, take: limit, orderBy: { submittedAt: 'desc' } })]);
    return NextResponse.json({ success: true, total, page, limit, data });
  }
  if (dataset === 'visitors') {
    const where = q ? { OR: [{ identityNumber: { contains: q } }, { fullName: { contains: q } }, { studyProgram: { contains: q } }] } : {};
    const [total, data] = await Promise.all([prisma.visitorLog.count({ where }), prisma.visitorLog.findMany({ where, skip, take: limit, orderBy: { checkInTime: 'desc' } })]);
    return NextResponse.json({ success: true, total, page, limit, data });
  }
  return NextResponse.json({ success: false, error: 'Dataset tidak dikenal.' }, { status: 404 });
}
