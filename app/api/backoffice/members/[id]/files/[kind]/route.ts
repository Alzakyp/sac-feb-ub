import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string; kind: string }> }) {
  if (!verifySession(req.cookies.get('sac_session')?.value || '')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, kind } = await context.params;
  if (!['identity', 'selfie'].includes(kind)) return NextResponse.json({ error: 'Berkas tidak ditemukan.' }, { status: 404 });
  const member = await prisma.member.findUnique({ where: { id }, select: { identityPath: true, selfiePath: true } });
  const file = kind === 'identity' ? member?.identityPath : member?.selfiePath;
  const root = path.resolve('storage/members');
  if (!file || !path.resolve(file).startsWith(root + path.sep)) return NextResponse.json({ error: 'Berkas tidak ditemukan.' }, { status: 404 });
  try {
    const bytes = await readFile(file);
    const type = ({ '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' } as Record<string, string>)[path.extname(file)];
    if (!type) return NextResponse.json({ error: 'Format tidak didukung.' }, { status: 400 });
    return new NextResponse(bytes, { headers: { 'Content-Type': type, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return NextResponse.json({ error: 'Berkas tidak ditemukan.' }, { status: 404 }); }
}
