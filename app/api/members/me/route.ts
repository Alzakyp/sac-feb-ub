import { NextRequest, NextResponse } from 'next/server';
import { memberProfile } from '@/lib/member-profile';

export async function GET(req: NextRequest) {
  const profile = await memberProfile(req.cookies.get('sac_member_session')?.value);
  if (!profile) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ success: true, data: profile });
}
