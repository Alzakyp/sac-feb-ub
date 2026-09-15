import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const submitDepositSchema = z.object({
  identityNumber: z
    .string()
    .min(1, 'NIM wajib diisi / Student ID is required')
    .trim(),
  fullName: z
    .string()
    .min(2, 'Nama lengkap minimal 2 karakter / Full name required')
    .trim(),
  degreeLevel: z
    .string()
    .min(1, 'Jenjang studi wajib dipilih / Degree level is required'),
  studyProgram: z.string().optional().nullable(),
  whatsappCountryCode: z.string().default('+62'),
  whatsappNumber: z
    .string()
    .min(5, 'Nomor WhatsApp minimal 5 angka / WhatsApp number required')
    .trim(),
  email: z
    .string()
    .email('Format email tidak valid / Invalid email format')
    .toLowerCase()
    .trim(),
  mailingAddress: z
    .string()
    .min(5, 'Alamat surat minimal 5 karakter / Mailing address required')
    .trim(),
  titleId: z
    .string()
    .min(5, 'Judul karya ilmiah wajib diisi / Title is required')
    .trim(),
  titleEn: z.string().optional().nullable(),
  workType: z
    .string()
    .min(1, 'Jenis karya wajib dipilih / Work type is required'),
  advisor: z.string().optional().nullable(),
  examiner1: z.string().optional().nullable(),
  examiner2: z.string().optional().nullable(),
  initialSectionUrl: z
    .string()
    .min(1, 'Berkas Bagian Awal wajib diunggah / Initial section file required'),
  mainSectionUrl: z
    .string()
    .min(1, 'Berkas Bagian Isi wajib diunggah / Main section file required'),
  finalSectionUrl: z
    .string()
    .min(1, 'Berkas Bagian Akhir wajib diunggah / Final section file required'),
  hardcopySubmitted: z.boolean().default(false),
});

async function generateUniqueDepositNumber(): Promise<string> {
  let depositNumber = '';
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 25) {
    attempts++;
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    depositNumber = `DEP-26-${randomDigits}`;

    const existing = await prisma.scientificWorkDeposit.findUnique({
      where: { depositNumber },
    });

    if (!existing) {
      exists = false;
    }
  }

  if (exists) {
    depositNumber = `DEP-26-${Date.now().toString().slice(-4)}`;
  }

  return depositNumber;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = submitDepositSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || 'Data tidak valid',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    const cleanedIdentityNumber = data.identityNumber.replace(/\s+/g, '').trim();
    const depositNumber = await generateUniqueDepositNumber();

    const newDeposit = await prisma.scientificWorkDeposit.create({
      data: {
        depositNumber,
        identityNumber: cleanedIdentityNumber,
        fullName: data.fullName,
        degreeLevel: data.degreeLevel,
        studyProgram: data.studyProgram || null,
        whatsappCountryCode: data.whatsappCountryCode || '+62',
        whatsappNumber: data.whatsappNumber,
        email: data.email,
        mailingAddress: data.mailingAddress,
        titleId: data.titleId,
        titleEn: data.titleEn || null,
        workType: data.workType,
        advisor: data.advisor || null,
        examiner1: data.examiner1 || null,
        examiner2: data.examiner2 || null,
        initialSectionUrl: data.initialSectionUrl,
        mainSectionUrl: data.mainSectionUrl,
        finalSectionUrl: data.finalSectionUrl,
        hardcopySubmitted: data.hardcopySubmitted || false,
        verificationStatus: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      depositNumber: newDeposit.depositNumber,
      status: newDeposit.verificationStatus,
      message:
        'Serah simpan karya ilmiah berhasil dicatat. / Scientific work deposit recorded successfully.',
      data: newDeposit,
    });
  } catch (error) {
    console.error('API Submit Deposit Error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          'Gagal menyimpan dokumen serah simpan ke basis data. / Failed to record scientific work deposit.',
      },
      { status: 500 }
    );
  }
}
