import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Hitung Pengunjung di Ruangan (ACTIVE)
    const activeVisitorsCount = await prisma.visitorLog.count({
      where: { status: 'ACTIVE' },
    });

    // 2. Hitung Pengajuan Serah Simpan Menunggu Verifikasi (PENDING)
    const pendingDepositsCount = await prisma.scientificWorkDeposit.count({
      where: { verificationStatus: 'PENDING' },
    });

    // 3. Hitung Total Anggota Terdaftar
    const totalMembersCount = await prisma.member.count();

    // 4. Hitung Total Aktivitas E-Resource & Repositori
    const totalActivityCount = await prisma.repositoryActivityLog.count();

    // 5. Pengunjung Terbaru Hari Ini (5 Terakhir)
    const recentVisitors = await prisma.visitorLog.findMany({
      orderBy: { checkInTime: 'desc' },
      take: 5,
    });

    // 6. Antrean Serah Simpan Prioritas (5 Naskah PENDING terlama)
    const priorityDeposits = await prisma.scientificWorkDeposit.findMany({
      where: { verificationStatus: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: 5,
    });

    // Hitung status hari ini
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const todayTotalVisitors = await prisma.visitorLog.count({
      where: {
        createdAt: { gte: startOfToday },
      },
    });

    const todayApprovedDeposits = await prisma.scientificWorkDeposit.count({
      where: {
        verificationStatus: 'APPROVED',
        updatedAt: { gte: startOfToday },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          activeVisitorsCount,
          pendingDepositsCount,
          totalMembersCount,
          totalActivityCount,
          todayTotalVisitors,
          todayApprovedDeposits,
        },
        recentVisitors,
        priorityDeposits,
      },
    });
  } catch (error) {
    console.error('API Admin Overview Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data ringkasan overview admin.',
      },
      { status: 500 }
    );
  }
}
