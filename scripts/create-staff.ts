import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email || !email.includes('@')) {
    console.error('Usage: npm run staff:create -- <email>');
    process.exit(1);
  }

  const clean = email.trim().toLowerCase();
  if (!clean.endsWith('@ub.ac.id') && !clean.endsWith('@student.ub.ac.id')) {
    console.error('Error: Email harus domain UB (@ub.ac.id atau @student.ub.ac.id).');
    process.exit(1);
  }

  const existing = await prisma.staff.findUnique({ where: { email: clean } });
  if (existing) {
    console.error(`Error: Staff dengan email ${clean} sudah ada.`);
    process.exit(1);
  }

  const password = process.env.STAFF_PASSWORD || 'password';
  const passwordHash = await bcrypt.hash(password, 10);

  const name = clean.split('@')[0];

  const staff = await prisma.staff.create({
    data: {
      email: clean,
      name,
      role: 'ADMIN',
      passwordHash,
      active: true,
    },
  });

  console.log(`Sukses: Staff admin ${staff.email} dibuat.`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
