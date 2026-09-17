import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

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
  initialSectionUrl: z.string().min(1, 'Berkas Bagian Awal wajib diunggah'),
  mainSectionUrl: z.string().min(1, 'Berkas Bagian Isi wajib diunggah'),
  finalSectionUrl: z.string().min(1, 'Berkas Bagian Akhir wajib diunggah'),
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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit per file

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\.-]/g, '_');
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // A. MULTIPART / FORM-DATA WITH REAL FILE UPLOADS
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      const rawIdentity = String(formData.get('identityNumber') || '').trim();
      const cleanedIdentityNumber = rawIdentity.replace(/\s+/g, '');
      const fullName = String(formData.get('fullName') || '').trim();
      const degreeLevel = String(formData.get('degreeLevel') || '').trim();
      const studyProgram = formData.get('studyProgram') ? String(formData.get('studyProgram')) : null;
      const whatsappCountryCode = String(formData.get('whatsappCountryCode') || '+62').trim();
      const whatsappNumber = String(formData.get('whatsappNumber') || '').trim();
      const email = String(formData.get('email') || '').toLowerCase().trim();
      const mailingAddress = String(formData.get('mailingAddress') || '').trim();
      const titleId = String(formData.get('titleId') || '').trim();
      const titleEn = formData.get('titleEn') ? String(formData.get('titleEn')).trim() : null;
      const workType = String(formData.get('workType') || 'Skripsi').trim();
      const advisor = formData.get('advisor') ? String(formData.get('advisor')).trim() : null;
      const examiner1 = formData.get('examiner1') ? String(formData.get('examiner1')).trim() : null;
      const examiner2 = formData.get('examiner2') ? String(formData.get('examiner2')).trim() : null;
      const hardcopySubmitted = formData.get('hardcopySubmitted') === 'true';

      if (!cleanedIdentityNumber || !fullName || !degreeLevel || !email || !titleId) {
        return NextResponse.json(
          { success: false, error: 'Data identitas dan naskah wajib diisi lengkap.' },
          { status: 400 }
        );
      }

      const fileAwal = formData.get('initialSection') as File | null;
      const fileIsi = formData.get('mainSection') as File | null;
      const fileAkhir = formData.get('finalSection') as File | null;

      if (!fileAwal || !fileIsi || !fileAkhir) {
        return NextResponse.json(
          { success: false, error: 'Seluruh 3 berkas PDF (Bagian Awal, Isi, dan Akhir) wajib diunggah.' },
          { status: 400 }
        );
      }

      // Validate file types and sizes
      const filesToValidate = [
        { file: fileAwal, label: 'Bagian Awal' },
        { file: fileIsi, label: 'Bagian Isi' },
        { file: fileAkhir, label: 'Bagian Akhir' },
      ];

      for (const item of filesToValidate) {
        if (!item.file.name.toLowerCase().endsWith('.pdf') && item.file.type !== 'application/pdf') {
          return NextResponse.json(
            { success: false, error: `Berkas ${item.label} harus berformat PDF (.pdf).` },
            { status: 400 }
          );
        }
        if (item.file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { success: false, error: `Ukuran berkas ${item.label} melebihi batas maksimal 10MB.` },
            { status: 400 }
          );
        }
      }

      const depositNumber = await generateUniqueDepositNumber();

      // Create target directory on disk: public/uploads/deposits/[depositNumber]/
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'deposits', depositNumber);
      fs.mkdirSync(uploadsDir, { recursive: true });

      // Save files to disk
      const saveFile = async (file: File, suffix: string) => {
        const safeName = sanitizeFilename(`${cleanedIdentityNumber}_Bagian_${suffix}.pdf`);
        const targetPath = path.join(uploadsDir, safeName);
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(targetPath, buffer);
        return `/uploads/deposits/${depositNumber}/${safeName}`;
      };

      const initialSectionUrl = await saveFile(fileAwal, 'Awal');
      const mainSectionUrl = await saveFile(fileIsi, 'Isi');
      const finalSectionUrl = await saveFile(fileAkhir, 'Akhir');

      const newDeposit = await prisma.scientificWorkDeposit.create({
        data: {
          depositNumber,
          identityNumber: cleanedIdentityNumber,
          fullName,
          degreeLevel,
          studyProgram,
          whatsappCountryCode,
          whatsappNumber,
          email,
          mailingAddress,
          titleId,
          titleEn,
          workType,
          advisor,
          examiner1,
          examiner2,
          initialSectionUrl,
          mainSectionUrl,
          finalSectionUrl,
          hardcopySubmitted,
          verificationStatus: 'PENDING',
        },
      });

      return NextResponse.json({
        success: true,
        depositNumber: newDeposit.depositNumber,
        status: newDeposit.verificationStatus,
        message: 'Serah simpan karya ilmiah dan berkas fisik berhasil disimpan ke server.',
        data: newDeposit,
      });
    }

    // B. JSON FALLBACK (FOR COMPATIBILITY)
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
      message: 'Serah simpan karya ilmiah berhasil dicatat.',
      data: newDeposit,
    });
  } catch (error) {
    console.error('API Submit Deposit Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal menyimpan dokumen serah simpan ke basis data.',
      },
      { status: 500 }
    );
  }
}
