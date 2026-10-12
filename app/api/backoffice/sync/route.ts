import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { closeSync, syncSheet } from '@/lib/sync-sheets';

export async function POST(req: NextRequest) {
  if (!verifySession(req.cookies.get('sac_session')?.value || '')) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const dataset = body.dataset || 'all';
  const datasets = dataset === 'all' ? ['repository', 'memberships', 'deposits', 'visitors'] : [dataset];
  try {
    const results = [];
    for (const item of datasets) results.push(await syncSheet(item));
    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Sync gagal' }, { status: 500 });
  } finally { await closeSync(); }
}
