import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';
import { reportDateRange } from '@/lib/report-date';

function authorized(req: NextRequest) { return verifySession(req.cookies.get('sac_session')?.value || ''); }

export async function GET(req: NextRequest, context: { params: Promise<{ dataset: string }> }) {
  if (!authorized(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { dataset } = await context.params;
  const params = req.nextUrl.searchParams;
  const q = (params.get('q') || '').trim();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.get('limit')) || 25));
  const skip = (page - 1) * limit;
  let range: Record<string, Date>;
  try { range = reportDateRange(params); } catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Tanggal tidak valid.' }, { status: 400 }); }

  if (dataset === 'memberships') {
    const where = { ...(q ? { OR: [{ nim: { contains: q } }, { fullName: { contains: q } }, { email: { contains: q } }] } : {}), ...(Object.keys(range).length ? { registeredAt: range } : {}) }; 
    const [total, data] = await Promise.all([prisma.membershipRecord.count({ where }), prisma.membershipRecord.findMany({ where, skip, take: limit, orderBy: { registeredAt: 'desc' } })]);
    return NextResponse.json({ success: true, total, page, limit, data: data.map(({ passwordHash: _passwordHash, ...record }) => record) });
  }
  if (dataset === 'deposits') {
    const where = { ...(q ? { OR: [{ nim: { contains: q } }, { fullName: { contains: q } }, { title: { contains: q } }] } : {}), ...(Object.keys(range).length ? { submittedAt: range } : {}) }; 
    const currentWhere = { verificationStatus: 'PROOF_ISSUED', ...(q ? { OR: [{ identityNumber: { contains: q } }, { fullName: { contains: q } }, { titleId: { contains: q } }, { proofNumber: { contains: q } }] } : {}), ...(Object.keys(range).length ? { proofIssuedAt: range } : {}) };
    const [archiveTotal, currentTotal, archive, current] = await Promise.all([
      prisma.depositRecord.count({ where }), prisma.scientificWorkDeposit.count({ where: currentWhere }),
      prisma.depositRecord.findMany({ where, take: skip + limit, orderBy: { submittedAt: 'desc' } }),
      prisma.scientificWorkDeposit.findMany({ where: currentWhere, take: skip + limit, orderBy: { proofIssuedAt: 'desc' }, select: { id: true, fullName: true, identityNumber: true, studyProgram: true, workType: true, titleId: true, proofNumber: true, proofIssuedAt: true, plagiarismScore: true } }),
    ]);
    const data = [...archive.map(row => ({ ...row, source: 'SHEET' })), ...current.map(row => ({ ...row, source: 'APLIKASI', nim: row.identityNumber, title: row.titleId, submittedAt: row.proofIssuedAt, downloadProofUrl: `/api/serah-simpan/proof/${row.id}` }))].sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()).slice(skip, skip + limit);
    return NextResponse.json({ success: true, total: archiveTotal + currentTotal, page, limit, data });
  }
  if (dataset === 'visitors') {
    const where = { ...(q ? { OR: [{ identityNumber: { contains: q } }, { fullName: { contains: q } }, { studyProgram: { contains: q } }] } : {}), ...(Object.keys(range).length ? { checkInTime: range } : {}) }; 
    const [total, data] = await Promise.all([prisma.visitorLog.count({ where }), prisma.visitorLog.findMany({ where, skip, take: limit, orderBy: { checkInTime: 'desc' } })]);
    return NextResponse.json({ success: true, total, page, limit, data });
  }
  return NextResponse.json({ success: false, error: 'Dataset tidak dikenal.' }, { status: 404 });
}
