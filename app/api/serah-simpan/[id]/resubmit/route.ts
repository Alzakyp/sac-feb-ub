import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { memberProfile } from '@/lib/member-profile';

const schema = z.object({ initialSectionUrl: z.string().min(1), mainSectionUrl: z.string().min(1), finalSectionUrl: z.string().min(1) });
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const profile = await memberProfile(req.cookies.get('sac_member_session')?.value);
  if (!profile) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Tiga tautan berkas revisi wajib diisi.' }, { status: 400 });
  const { id } = await context.params;
  const result = await prisma.scientificWorkDeposit.updateMany({ where: { id, identityNumber: profile.nim, verificationStatus: 'REVISION_NEEDED' }, data: { ...parsed.data, verificationStatus: 'RESUBMITTED', revisionNotes: null } });
  if (!result.count) return NextResponse.json({ success: false, error: 'Pengajuan revisi tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ success: true });
}
