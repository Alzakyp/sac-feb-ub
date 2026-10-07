import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';
import { mapRepositorySheetRow } from '@/lib/repository-sheets-import';

export async function POST(req: NextRequest) {
  const session = verifySession(req.cookies.get('sac_session')?.value || '');
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const res = await fetch('https://docs.google.com/spreadsheets/d/1ekLrC2gzf3-UJY8Bj4eX2DMmhu5KH2rMgZBtB9AalcM/export?format=csv&gid=0');
    if (!res.ok) throw new Error(`Google Sheets fetch error: ${res.status}`);
    const csv = await res.text();
    const workbook = XLSX.read(csv, { type: 'string' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
    const records = rows.map(mapRepositorySheetRow).filter((r) => r.judul !== 'Tanpa Judul');

    await prisma.repositoryActivityLog.deleteMany();
    await prisma.repositoryDocument.deleteMany();

    for (let i = 0; i < records.length; i += 500) {
      await prisma.repositoryDocument.createMany({ data: records.slice(i, i + 500) });
    }

    return NextResponse.json({ success: true, count: records.length, message: `Sinkronisasi berhasil: ${records.length} karya tersimpan.` });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
