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

    // Cek apakah mahasiswa pernah melakukan serah simpan sebelumnya
    const prevDeposit = await prisma.scientificWorkDeposit.findFirst({
      where: { identityNumber: cleanedIdentityNumber },
      orderBy: { createdAt: 'desc' },
    });

    if (prevDeposit) {
      return NextResponse.json({
        found: true,
        data: {
          identityNumber: prevDeposit.identityNumber,
          fullName: prevDeposit.fullName,
          degreeLevel: prevDeposit.degreeLevel,
          studyProgram: prevDeposit.studyProgram || 'FEB UB',
          whatsapp: prevDeposit.whatsappNumber,
          whatsappCountryCode: prevDeposit.whatsappCountryCode || '+62',
          email: prevDeposit.email,
          originAddress: prevDeposit.mailingAddress,
        },
      });
    }

    return NextResponse.json({
      found: false,
      message: 'Silakan isi formulir identitas serah simpan secara mandiri.',
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
