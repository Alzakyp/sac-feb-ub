import { PrismaClient } from '@prisma/client';
import { demoDeposits } from '../lib/demo-deposits';

const prisma = new PrismaClient();
const clear = process.argv.includes('--clear');

async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_DEPOSITS !== '1') {
    throw new Error('Demo production ditolak. Set ALLOW_DEMO_DEPOSITS=1 hanya bila memang ingin menguji di production.');
  }
  for (const data of demoDeposits) {
    if (clear) {
      await prisma.scientificWorkDeposit.deleteMany({
        where: { depositNumber: data.depositNumber, identityNumber: data.identityNumber, email: data.email, titleId: data.titleId },
      });
    } else {
      // Upsert scoped to demo identity: never overwrite a real submission sharing the number.
      const existing = await prisma.scientificWorkDeposit.findUnique({ where: { depositNumber: data.depositNumber } });
      if (existing && existing.identityNumber !== data.identityNumber) throw new Error(`Nomor ${data.depositNumber} sudah dipakai pengajuan nyata.`);
      if (existing) await prisma.scientificWorkDeposit.update({ where: { id: existing.id }, data });
      else await prisma.scientificWorkDeposit.create({ data });
    }
  }
  console.log(clear ? 'Empat pengajuan demo dihapus.' : 'Empat pengajuan demo siap; buka Backoffice → Serah Simpan.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
