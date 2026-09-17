import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addMockVisitor } from '@/lib/mock-data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawIdentity =
      typeof body?.identityNumber === 'string'
        ? body.identityNumber
        : typeof body?.nim === 'string'
        ? body.nim
        : '';
    const identityNumber = rawIdentity.trim();

    // 1. Validasi Input:
    // Bersihkan string identityNumber dan pastikan tidak kosong (min. 5 karakter).
    if (!identityNumber || identityNumber.length < 5) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nomor identitas (NIM) wajib diisi minimal 5 karakter.',
        },
        { status: 400 }
      );
    }

    // 2. Lookup Identitas di tabel Member:
    // Query tabel Member berdasarkan identityNumber.
    // Jika ditemukan: ambil fullName dan studyProgram dari akun member.
    // Jika tidak ditemukan: fallback ke fullName: "Mahasiswa FEB UB" dan studyProgram: "FEB UB".
    let fullName = 'Mahasiswa FEB UB';
    let studyProgram = 'FEB UB';

    try {
      const member = await prisma.member.findUnique({
        where: { identityNumber },
      });
      if (member) {
        fullName = member.fullName;
        studyProgram = member.studyProgram;
      }
    } catch (lookupErr) {
      console.warn('Member lookup error:', lookupErr);
    }

    // 3. Cek Sesi Aktif:
    // Query VisitorLog dengan filter: identityNumber dan status = "ACTIVE".
    let activeSession = null;
    try {
      activeSession = await prisma.visitorLog.findFirst({
        where: {
          identityNumber,
          status: 'ACTIVE',
        },
        orderBy: {
          checkInTime: 'desc',
        },
      });
    } catch (findErr) {
      console.warn('VisitorLog findFirst error:', findErr);
    }

    const now = new Date();

    // 4. Percabangan Logika:
    // KASUS A (Belum ada sesi aktif):
    if (!activeSession) {
      const newSession = await prisma.visitorLog.create({
        data: {
          identityNumber,
          fullName,
          studyProgram,
          checkInTime: now,
          status: 'ACTIVE',
          purpose: 'SAC Room Visit',
        },
      });

      // Update in-memory mock store for admin console sync
      try {
        addMockVisitor({
          nim: identityNumber,
          nama: fullName,
          prodi: studyProgram,
          keperluan: 'Presensi Mandiri SAC',
          tipe: 'Presensi Fisik SAC',
        });
      } catch (mockErr) {
        console.warn('Mock store sync skipped:', mockErr);
      }

      return NextResponse.json(
        {
          success: true,
          action: 'CHECK_IN',
          message: 'Check-in berhasil! Selamat datang di SAC FEB UB.',
          data: {
            sessionId: newSession.id,
            fullName: newSession.fullName,
            identityNumber: newSession.identityNumber,
            studyProgram: newSession.studyProgram,
            checkInTime: newSession.checkInTime,
          },
        },
        { status: 200 }
      );
    }

    // Hitung selisih waktu dari checkInTime dalam menit
    const diffMs = now.getTime() - new Date(activeSession.checkInTime).getTime();
    const diffMinutes = diffMs / (1000 * 60);

    // KASUS B (Sudah ada sesi aktif, selisih waktu < 5 menit):
    // Jika diffMinutes < 5: JANGAN lakukan checkout (cegah ketidaksengajaan double-tap).
    // Tetap hitung sebagai masuk.
    if (diffMinutes < 5) {
      const checkInDate = new Date(activeSession.checkInTime);
      const timeStr = checkInDate.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta',
      });

      return NextResponse.json(
        {
          success: true,
          action: 'STILL_IN',
          message: `Anda sudah tercatat masuk pada pukul ${timeStr} WIB. Check-out baru dapat dilakukan setelah minimal 5 menit berada di ruangan.`,
          data: {
            fullName: activeSession.fullName,
            identityNumber: activeSession.identityNumber,
            studyProgram: activeSession.studyProgram,
            checkInTime: activeSession.checkInTime,
            remainingMinutes: Math.max(1, Math.ceil(5 - diffMinutes)),
          },
        },
        { status: 200 }
      );
    }

    // KASUS C (Sudah ada sesi aktif, selisih waktu >= 5 menit):
    // Update sesi tersebut: checkOutTime: now dan status: "COMPLETED".
    // Hitung durasi berkunjung dalam format jam & menit.
    const updatedSession = await prisma.visitorLog.update({
      where: {
        id: activeSession.id,
      },
      data: {
        checkOutTime: now,
        status: 'COMPLETED',
      },
    });

    const totalMinutes = Math.floor(diffMinutes);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const durationFormatted =
      hours > 0 ? `${hours} jam ${mins} menit` : `${mins} menit`;

    return NextResponse.json(
      {
        success: true,
        action: 'CHECK_OUT',
        message: 'Check-out berhasil! Terima kasih atas kunjungannya.',
        data: {
          sessionId: updatedSession.id,
          fullName: updatedSession.fullName,
          identityNumber: updatedSession.identityNumber,
          studyProgram: updatedSession.studyProgram,
          checkInTime: updatedSession.checkInTime,
          checkOutTime: updatedSession.checkOutTime,
          duration: durationFormatted,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in /api/presensi:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memproses presensi. Silakan coba lagi.',
      },
      { status: 500 }
    );
  }
}
