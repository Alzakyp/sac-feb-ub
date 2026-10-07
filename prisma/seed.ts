import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data for SAC FEB UB...');

  // 1. Create Default Superadmin Staff
  const adminEmail = 'admin.sac@ub.ac.id';
  const existingAdmin = await prisma.staff.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const defaultPassword = process.env.STAFF_PASSWORD || 'password';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    await prisma.staff.create({
      data: {
        email: adminEmail,
        name: 'Administrator Utama',
        role: 'ADMIN',
        passwordHash,
        active: true,
      },
    });
    console.log(`Berhasil membuat akun admin awal: ${adminEmail}`);
    if (!process.env.STAFF_PASSWORD) {
      console.log('Password bawaan: sacfeb2026!');
    }
  }

  // Seed only the initial admin. Operational data must never be seeded.
  return;


}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
