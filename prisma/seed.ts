import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data for SAC FEB UB...');

  // Clean existing records
  await prisma.visitorLog.deleteMany({});
  await prisma.resourceAccessLog.deleteMany({});

  const today = new Date();

  // Helper to get date with specific hour on a day offset
  const getDate = (daysAgo: number, hour: number, minute: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  const visitors = [
    // Today visitors
    { nim: '215020200111012', nama: 'Ahmad Faiz Al-Habsyi', prodi: 'Manajemen', keperluan: 'Pengerjaan Skripsi/Tesis', createdAt: getDate(0, 8, 25) },
    { nim: '225020301111045', nama: 'Clarissa Maharani Putri', prodi: 'Akuntansi', keperluan: 'Belajar Mandiri', createdAt: getDate(0, 9, 10) },
    { nim: '215020107111022', nama: 'Daffa Rizky Ramadhan', prodi: 'Ilmu Ekonomi', keperluan: 'Akses PC E-Resource', createdAt: getDate(0, 9, 35) },
    { nim: '205020201111089', nama: 'Nadia Salsabila Wijaya', prodi: 'Manajemen', keperluan: 'Diskusi Ruang Privat', createdAt: getDate(0, 10, 15) },
    { nim: '235020400111005', nama: 'Bambang Tri Atmojo', prodi: 'Pascasarjana', keperluan: 'Pojok Statistik BPS', createdAt: getDate(0, 10, 45) },
    { nim: '197805122005011', nama: 'Dr. Ir. Hendra Setiawan, SE., ME.', prodi: 'Tamu/Dosen', keperluan: 'Lainnya', createdAt: getDate(0, 11, 5) },
    { nim: '225020207111033', nama: 'Putri Ayu Wandira', prodi: 'Manajemen', keperluan: 'Belajar Mandiri', createdAt: getDate(0, 11, 20) },
    { nim: '215020300111067', nama: 'Kevin Jonathan Tan', prodi: 'Akuntansi', keperluan: 'Pengerjaan Skripsi/Tesis', createdAt: getDate(0, 13, 10) },
    { nim: '225020101111018', nama: 'Siti Sarah Nurhaliza', prodi: 'Ilmu Ekonomi', keperluan: 'Akses PC E-Resource', createdAt: getDate(0, 13, 40) },
    { nim: '215020201111054', nama: 'Rafi Ardian Pratama', prodi: 'Manajemen', keperluan: 'Pengerjaan Skripsi/Tesis', createdAt: getDate(0, 14, 15) },
    { nim: '235020307111019', nama: 'Jessica Nathania', prodi: 'Akuntansi', keperluan: 'Belajar Mandiri', createdAt: getDate(0, 14, 50) },
    { nim: '225020200111078', nama: 'Dimas Satria Ananda', prodi: 'Manajemen', keperluan: 'Diskusi Ruang Privat', createdAt: getDate(0, 15, 10) },

    // Yesterday visitors
    { nim: '215020100111034', nama: 'Farhan Maulana', prodi: 'Ilmu Ekonomi', keperluan: 'Pojok Statistik BPS', createdAt: getDate(1, 9, 0) },
    { nim: '225020201111082', nama: 'Anisa Rahmawati', prodi: 'Manajemen', keperluan: 'Belajar Mandiri', createdAt: getDate(1, 10, 15) },
    { nim: '205020300111099', nama: 'Reza Firmansyah', prodi: 'Akuntansi', keperluan: 'Pengerjaan Skripsi/Tesis', createdAt: getDate(1, 11, 30) },
    { nim: '215020207111015', nama: 'Larasati Dewi', prodi: 'Manajemen', keperluan: 'Akses PC E-Resource', createdAt: getDate(1, 13, 20) },
    { nim: '225020107111041', nama: 'M. Ilham Wahyudi', prodi: 'Ilmu Ekonomi', keperluan: 'Diskusi Ruang Privat', createdAt: getDate(1, 14, 0) },
    { nim: '235020401111012', nama: 'Dr. Wahyu Tri, M.Si.', prodi: 'Tamu/Dosen', keperluan: 'Akses PC E-Resource', createdAt: getDate(1, 14, 30) },

    // 2 days ago
    { nim: '215020301111025', nama: 'Bella Shofie', prodi: 'Akuntansi', keperluan: 'Pengerjaan Skripsi/Tesis', createdAt: getDate(2, 9, 30) },
    { nim: '225020200111043', nama: 'Danang Wicaksono', prodi: 'Manajemen', keperluan: 'Belajar Mandiri', createdAt: getDate(2, 10, 45) },
    { nim: '215020101111062', nama: 'Eka Kurniawan', prodi: 'Ilmu Ekonomi', keperluan: 'Pojok Statistik BPS', createdAt: getDate(2, 13, 15) },

    // 3 days ago
    { nim: '205020201111077', nama: 'Fajar Nugraha', prodi: 'Manajemen', keperluan: 'Pengerjaan Skripsi/Tesis', createdAt: getDate(3, 10, 0) },
    { nim: '225020300111038', nama: 'Gita Gutawa', prodi: 'Akuntansi', keperluan: 'Belajar Mandiri', createdAt: getDate(3, 14, 10) },

    // 4 days ago
    { nim: '215020100111088', nama: 'Hendra Gunawan', prodi: 'Ilmu Ekonomi', keperluan: 'Akses PC E-Resource', createdAt: getDate(4, 11, 0) },
    { nim: '225020207111059', nama: 'Indah Permatasari', prodi: 'Manajemen', keperluan: 'Belajar Mandiri', createdAt: getDate(4, 13, 30) },

    // 5 days ago
    { nim: '215020307111071', nama: 'Joko Widodo Santoso', prodi: 'Akuntansi', keperluan: 'Pengerjaan Skripsi/Tesis', createdAt: getDate(5, 9, 40) },
    { nim: '235020400111029', nama: 'Kurnia Meiga', prodi: 'Pascasarjana', keperluan: 'Diskusi Ruang Privat', createdAt: getDate(5, 10, 50) },
  ];

  for (const v of visitors) {
    await prisma.visitorLog.create({
      data: {
        identityNumber: v.nim,
        fullName: v.nama,
        studyProgram: v.prodi,
        purpose: v.keperluan,
        status: 'COMPLETED',
        checkInTime: v.createdAt,
        checkOutTime: new Date(v.createdAt.getTime() + 45 * 60 * 1000),
        createdAt: v.createdAt,
      },
    });
  }

  const resourceNames = [
    'ScienceDirect',
    'Emerald / ProQuest',
    'Repositori Skripsi FEB',
    'Pojok Statistik BPS',
    'BEI Corner',
    'E-Books Perpustakaan',
  ];

  // Create sample e-resource logs
  const resourceLogs = [
    { resourceName: 'ScienceDirect', daysAgo: 0, hour: 8, count: 6 },
    { resourceName: 'ScienceDirect', daysAgo: 0, hour: 10, count: 12 },
    { resourceName: 'Repositori Skripsi FEB', daysAgo: 0, hour: 9, count: 18 },
    { resourceName: 'Repositori Skripsi FEB', daysAgo: 0, hour: 13, count: 14 },
    { resourceName: 'Emerald / ProQuest', daysAgo: 0, hour: 11, count: 9 },
    { resourceName: 'BEI Corner', daysAgo: 0, hour: 14, count: 7 },
    { resourceName: 'Pojok Statistik BPS', daysAgo: 0, hour: 10, count: 11 },
    { resourceName: 'E-Books Perpustakaan', daysAgo: 0, hour: 15, count: 8 },

    // Past days
    { resourceName: 'ScienceDirect', daysAgo: 1, hour: 10, count: 15 },
    { resourceName: 'Repositori Skripsi FEB', daysAgo: 1, hour: 11, count: 20 },
    { resourceName: 'Emerald / ProQuest', daysAgo: 2, hour: 14, count: 12 },
    { resourceName: 'BEI Corner', daysAgo: 3, hour: 9, count: 8 },
    { resourceName: 'Pojok Statistik BPS', daysAgo: 4, hour: 13, count: 14 },
    { resourceName: 'ScienceDirect', daysAgo: 5, hour: 10, count: 18 },
  ];

  for (const log of resourceLogs) {
    for (let i = 0; i < log.count; i++) {
      await prisma.resourceAccessLog.create({
        data: {
          resourceName: log.resourceName,
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          createdAt: getDate(log.daysAgo, log.hour, Math.floor(Math.random() * 59)),
        },
      });
    }
  }

  console.log(`Seeding completed successfully! Inserted ${visitors.length} visitor logs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
