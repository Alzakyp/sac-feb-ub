import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const verifySchema = z.object({
  identityNumber: z.string().min(1, 'NIM wajib diisi / NIM is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = verifySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          found: false,
          error: validation.error.issues[0]?.message || 'Validasi gagal',
        },
        { status: 400 }
      );
    }

    // Bersihkan input string tanpa spasi
    const cleanedIdentityNumber = validation.data.identityNumber.replace(/\s+/g, '').trim();

    if (!cleanedIdentityNumber) {
      return NextResponse.json(
        {
          found: false,
          message:
            'Data NIM tidak boleh kosong. / Student identification number cannot be empty.',
        },
        { status: 400 }
      );
    }

    // Cari mahasiswa di tabel Member
    const member = await prisma.member.findFirst({
      where: {
        identityNumber: cleanedIdentityNumber,
      },
    });

    if (member) {
      // Deteksi jenjang studi dari program studi
      let degreeLevel = 'S1';
      const prodiUpper = member.studyProgram.toUpperCase();
      if (prodiUpper.startsWith('S2') || prodiUpper.includes('MAGISTER')) {
        degreeLevel = 'S2';
      } else if (prodiUpper.startsWith('S3') || prodiUpper.includes('DOKTOR')) {
        degreeLevel = 'S3';
      } else if (prodiUpper.includes('PROFESI') || prodiUpper.includes('PPA')) {
        degreeLevel = 'Profesi';
      } else if (prodiUpper.startsWith('S1') || prodiUpper.includes('SARJANA')) {
        degreeLevel = 'S1';
      } else {
        degreeLevel = 'Other';
      }

      // Bersihkan whatsapp format jika memiliki prefix 62
      let whatsappClean = member.whatsapp;
      if (whatsappClean.startsWith('62')) {
        whatsappClean = whatsappClean.slice(2);
      } else if (whatsappClean.startsWith('0')) {
        whatsappClean = whatsappClean.slice(1);
      }

      return NextResponse.json({
        found: true,
        data: {
          identityNumber: member.identityNumber,
          fullName: member.fullName,
          degreeLevel,
          studyProgram: member.studyProgram,
          whatsapp: whatsappClean,
          whatsappCountryCode: '+62',
          email: member.email,
          originAddress: member.originAddress,
        },
      });
    }

    // Jika tidak ditemukan
    return NextResponse.json({
      found: false,
      message:
        'Data NIM tidak ditemukan. Silakan lengkapi data mahasiswa berikut. / The NIM was not found. Please complete the following student data.',
    });
  } catch (error) {
    console.error('API Verify Error:', error);
    return NextResponse.json(
      {
        found: false,
        error: 'Terjadi kesalahan sistem pada server / Internal server error',
      },
      { status: 500 }
    );
  }
}
