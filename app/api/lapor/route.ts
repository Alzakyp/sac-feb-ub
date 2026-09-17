import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, identityNumber, email, phone, category, description } = body || {};

    if (!fullName || !identityNumber || !email || !category || !description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Seluruh kolom wajib (Nama, NIM, Email, Kategori, dan Deskripsi) harus diisi.',
        },
        { status: 400 }
      );
    }

    // Generate ticket number: LAP-26-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `LAP-26-${randomSuffix}`;
    const submissionDate = new Date().toISOString();

    return NextResponse.json(
      {
        success: true,
        message: 'Laporan aduan berhasil diterima dan diteruskan ke Tim Pengelola SAC FEB UB.',
        data: {
          ticketNumber,
          fullName: fullName.trim(),
          identityNumber: identityNumber.trim(),
          email: email.trim(),
          phone: (phone || '').trim(),
          category,
          description: description.trim(),
          submittedAt: submissionDate,
          slaHours: '1x24 Jam Kerja (Senin–Jumat 08.00–15.00 WIB)',
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in /api/lapor:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memproses formulir aduan.',
      },
      { status: 500 }
    );
  }
}
