import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { closeSync, syncSheet } from '@/lib/sync-sheets';

export async function POST(req: NextRequest) {
  if (!verifySession(req.cookies.get('sac_session')?.value || '')) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const result = await syncSheet('repository');
    return NextResponse.json({ success: true, ...result, message: `Sinkronisasi berhasil: ${result.added + result.updated} karya diproses.` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Sync gagal' }, { status: 500 });
  } finally { await closeSync(); }
}
