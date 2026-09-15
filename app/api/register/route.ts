import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const registerMemberSchema = z
  .object({
    membershipType: z.enum([
      'Non FEB-UB',
      'Mahasiswa FEB-UB',
      'Tendik FEB-UB',
      'Dosen FEB-UB',
      'Other',
    ]),
    identityType: z.enum([
      'KTM [Student Card]',
      'KTP',
      'Kartu Pegawai [Dosen/Tendik UB]',
      'Pasport',
    ]),
    identityNumber: z
      .string()
      .min(5, 'Nomor identitas minimal 5 karakter')
      .max(30, 'Nomor identitas maksimal 30 karakter')
      .trim(),
    fullName: z
      .string()
      .min(3, 'Nama lengkap minimal 3 karakter')
      .max(100, 'Nama lengkap maksimal 100 karakter')
      .trim(),
    studyProgram: z.string().min(1, 'Pilih program studi'),
    whatsapp: z
      .string()
      .regex(/^62[0-9]{8,13}$/, 'Nomor WhatsApp wajib diawali 62 (contoh: 6281234567890)'),
    email: z.string().email('Format email tidak valid').toLowerCase().trim(),
    originAddress: z.string().min(5, 'Alamat asal wajib diisi').trim(),
    malangAddress: z.string().trim().optional(),
    selfiePhotoUrl: z.string().optional(),
    identityCardUrl: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/^[A-Z]/, 'Huruf pertama harus huruf kapital')
      .regex(/[0-9]$/, 'Karakter terakhir harus angka'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

async function generateUniquePin(): Promise<string> {
  let pin = '';
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 20) {
    attempts++;
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    pin = `SAC-26-${randomDigits}`;
    const check = await prisma.member.findUnique({ where: { pin } });
    if (!check) {
      exists = false;
    }
  }

  if (exists) {
    // Fallback counter-based in extreme collisions
    const count = await prisma.member.count();
    pin = `SAC-26-${String(count + 1).padStart(4, '0')}`;
  }

  return pin;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();

    // 1. Validate payload via Zod
    const parseResult = registerMemberSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const issues = parseResult.error.issues || [];
      const firstErrorMessage =
        issues[0]?.message || 'Data pendaftaran tidak valid';

      return NextResponse.json(
        {
          error: firstErrorMessage,
          issues,
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // 2. Check Uniqueness for identityNumber & email
    const [existingIdentity, existingEmail] = await Promise.all([
      prisma.member.findUnique({
        where: { identityNumber: data.identityNumber },
      }),
      prisma.member.findUnique({
        where: { email: data.email },
      }),
    ]);

    if (existingIdentity) {
      return NextResponse.json(
        {
          error:
            'Nomor identitas (NIM/NIK/Paspor) sudah terdaftar di sistem keanggotaan SAC FEB UB.',
          field: 'identityNumber',
        },
        { status: 409 }
      );
    }

    if (existingEmail) {
      return NextResponse.json(
        {
          error: 'Alamat email sudah terdaftar di sistem SAC FEB UB.',
          field: 'email',
        },
        { status: 409 }
      );
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 4. Generate Unique PIN
    const pin = await generateUniquePin();

    // 5. Create Member Record in Database
    const newMember = await prisma.member.create({
      data: {
        pin,
        membershipType: data.membershipType,
        identityType: data.identityType,
        identityNumber: data.identityNumber,
        fullName: data.fullName,
        studyProgram: data.studyProgram,
        whatsapp: data.whatsapp,
        email: data.email,
        originAddress: data.originAddress,
        malangAddress: data.malangAddress || null,
        selfiePhotoUrl: data.selfiePhotoUrl || null,
        identityCardUrl: data.identityCardUrl || null,
        password: hashedPassword,
        status: 'ACTIVE',
      },
      select: {
        pin: true,
        fullName: true,
        identityNumber: true,
        studyProgram: true,
        membershipType: true,
        identityType: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Pendaftaran anggota SAC FEB UB berhasil.',
        member: newMember,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API Register Error]:', error);
    return NextResponse.json(
      {
        error: 'Terjadi kesalahan sistem saat memproses pendaftaran anggota.',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
