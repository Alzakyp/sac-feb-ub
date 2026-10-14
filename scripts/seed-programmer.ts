import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.PROGRAMMER_EMAIL || 'alzakyputra@gmail.com').trim().toLowerCase();
  const password = process.env.PROGRAMMER_PASSWORD;
  if (!password || password.length < 12) throw new Error('PROGRAMMER_PASSWORD minimal 12 karakter wajib disetel.');
  const name = process.env.PROGRAMMER_NAME || 'Programmer Lead';

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.staff.upsert({
    where: { email },
    update: {
      name,
      role: 'PROGRAMMER',
      active: true,
      passwordHash,
    },
    create: {
      email,
      name,
      role: 'PROGRAMMER',
      active: true,
      passwordHash,
    },
  });

  console.log(`Programmer ready: ${user.email} (role: ${user.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
