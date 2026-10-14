import { prisma } from './prisma';
import { verifyMemberSession } from './member-session';
export async function memberProfile(token?: string) {
  const session = verifyMemberSession(token);
  if (!session) return null;
  const select = { fullName: true, nim: true, studyProgram: true, email: true, status: true };
  const profile = session.source === 'member'
    ? await prisma.member.findUnique({ where: { id: session.accountId }, select })
    : await prisma.membershipRecord.findUnique({ where: { id: session.accountId }, select });
  return profile && profile.nim === session.nim && ['ACTIVE', 'APPROVED'].includes(profile.status) ? profile : null;
}
