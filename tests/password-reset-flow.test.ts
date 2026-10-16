import assert from 'node:assert/strict';
import { prisma } from '../lib/prisma';
import { newResetToken, resetTokenHash, RESET_TTL_MS, validResetInput } from '../lib/member-password-reset';

async function main() {
  assert.equal(validResetInput('not-a-token', 'short'), false);
  assert.equal(validResetInput(newResetToken(), '123456789012'), true);

  const rawToken = newResetToken();
  const hashed = resetTokenHash(rawToken);
  const future = new Date(Date.now() + RESET_TTL_MS);

  // Verify query capability on Member
  const member = await prisma.member.findFirst({ select: { id: true } });
  if (member) {
    await prisma.member.update({ where: { id: member.id }, data: { passwordResetTokenHash: hashed, passwordResetExpiresAt: future } });
    const found = await prisma.member.findFirst({ where: { passwordResetTokenHash: hashed, passwordResetExpiresAt: { gt: new Date() } } });
    assert.equal(found?.id, member.id);
    await prisma.member.update({ where: { id: member.id }, data: { passwordResetTokenHash: null, passwordResetExpiresAt: null } });
  }
  console.log('Member password reset token tests passed.');
}

main().finally(() => prisma.$disconnect());
