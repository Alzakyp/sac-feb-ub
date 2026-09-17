import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface VisitorRecord {
  id: string;
  nim: string;
  nama: string;
  prodi: string;
  keperluan: string;
  tipe: string;
  createdAt: string | Date;
}

export interface ResourceLogRecord {
  id: string;
  resourceName: string;
  userAgent?: string | null;
  createdAt: string | Date;
}

export function formatDateTimeIndo(dateInput: string | Date): string {
  const d = new Date(dateInput);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' WIB';
}

export function formatDateIndoLong(dateInput: string | Date): string {
  const d = new Date(dateInput);
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTimeOnly(dateInput: string | Date): string {
  const d = new Date(dateInput);
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }) + ' WIB';
}

// Export to Excel (.xlsx)
export function exportVisitorsToExcel(visitors: VisitorRecord[], filename = 'Laporan_Presensi_SAC_FEB_UB.xlsx') {
  const data = visitors.map((v, idx) => ({
    No: idx + 1,
    NIM: v.nim,
    Nama: v.nama,
    'Departemen / Program Studi': v.prodi,
    'Keperluan Kunjungan': v.keperluan,
    'Tipe Kunjungan': v.tipe,
    'Waktu Presensi': formatDateTimeIndo(v.createdAt),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 28 },
    { wch: 22 },
    { wch: 26 },
    { wch: 12 },
    { wch: 22 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Presensi Fisik SAC');
  XLSX.writeFile(workbook, filename);
}

// Export to PDF (.pdf) with FEB UB styling
export function exportVisitorsToPDF(visitors: VisitorRecord[], filterName = 'Hari Ini') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  // Header Background bar
  doc.setFillColor(11, 37, 70); // #0B2546 Navy Brawijaya
  doc.rect(0, 0, 595, 60, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SELF ACCESS CENTRE (SAC) - FEB UNIVERSITAS BRAWIJAYA', 36, 28);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(212, 175, 55); // Warm Gold
  doc.text('Gedung F Pascasarjana Lantai 1, Fakultas Ekonomi dan Bisnis, Universitas Brawijaya Malang', 36, 44);

  // Subheader Info
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`LOG LAPORAN PRESENSI PENGUNJUNG (${filterName.toUpperCase()})`, 36, 85);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Dicetak pada: ${formatDateTimeIndo(new Date())} | Total Record: ${visitors.length} Kunjungan`, 36, 100);

  // Table Data
  const tableData = visitors.map((v, index) => [
    (index + 1).toString(),
    v.nim,
    v.nama,
    v.prodi,
    v.keperluan,
    formatTimeOnly(v.createdAt),
  ]);

  autoTable(doc, {
    startY: 115,
    head: [['No', 'NIM', 'Nama Mahasiswa/Tamu', 'Departemen', 'Keperluan', 'Jam']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [11, 37, 70],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 28, halign: 'center' },
      1: { cellWidth: 85 },
      2: { cellWidth: 140 },
      3: { cellWidth: 95 },
      4: { cellWidth: 115 },
      5: { cellWidth: 60, halign: 'center' },
    },
  });

  doc.save(`Laporan_Presensi_SAC_FEB_UB_${Date.now()}.pdf`);
}

export interface DepositReceiptData {
  depositNumber: string;
  identityNumber: string;
  fullName: string;
  degreeLevel: string;
  studyProgram?: string | null;
  whatsappCountryCode?: string;
  whatsappNumber: string;
  email: string;
  mailingAddress?: string;
  titleId: string;
  titleEn?: string | null;
  workType: string;
  advisor?: string | null;
  examiner1?: string | null;
  examiner2?: string | null;
  verificationStatus: string;
  createdAt: string | Date;
}

// Export Bukti Tanda Terima Serah Simpan Karya Ilmiah (.pdf)
export function exportDepositReceiptPDF(deposit: DepositReceiptData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  // Header Background bar
  doc.setFillColor(11, 37, 70); // #0B2546 Navy Brawijaya
  doc.rect(0, 0, 595, 75, 'F');

  // Gold accent bottom line
  doc.setFillColor(212, 175, 55); // #D4AF37 Warm Gold
  doc.rect(0, 75, 595, 4, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('SELF ACCESS CENTRE (SAC) — FEB UNIVERSITAS BRAWIJAYA', 36, 32);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(212, 175, 55); // Warm Gold
  doc.text(
    'Sistem Serah Simpan Karya Ilmiah Mahasiswa Mandiri (SAC-ONE)',
    36,
    48
  );

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text(
    'Gedung F Pascasarjana Lantai 1, Jl. MT Haryono No. 165, Malang 65145',
    36,
    62
  );

  // Document Title Header
  doc.setTextColor(11, 37, 70);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('BUKTI PENERIMAAN SERAH SIMPAN KARYA ILMIAH', 36, 108);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const createdDate =
    typeof deposit.createdAt === 'string'
      ? new Date(deposit.createdAt)
      : deposit.createdAt;
  doc.text(
    `Waktu Pengajuan: ${formatDateTimeIndo(createdDate)} | No. Registrasi: ${deposit.depositNumber}`,
    36,
    124
  );

  // Status Badge box
  doc.setFillColor(254, 243, 199); // Amber 100
  doc.setDrawColor(245, 158, 11); // Amber 500
  doc.roundedRect(400, 95, 159, 32, 4, 4, 'FD');
  doc.setTextColor(180, 83, 9); // Amber 700
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUS: PENDING VERIFIKASI', 410, 110);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('(Maks. 1×24 Jam Kerja)', 410, 121);

  // Details Table
  const tableRows = [
    ['Nomor Registrasi', deposit.depositNumber],
    ['Nomor Induk Mahasiswa (NIM)', deposit.identityNumber],
    ['Nama Lengkap Mahasiswa', deposit.fullName],
    ['Jenjang / Program Studi', `${deposit.degreeLevel} — ${deposit.studyProgram || '-'}`],
    ['Jenis Karya Ilmiah', deposit.workType],
    ['Judul Karya Ilmiah (ID)', deposit.titleId],
    ['Judul Karya Ilmiah (EN)', deposit.titleEn || '-'],
    ['Dosen Pembimbing / Promotor', deposit.advisor || '-'],
    ['Dosen Penguji', [deposit.examiner1, deposit.examiner2].filter(Boolean).join(', ') || '-'],
    [
      'Kontak / Email Mahasiswa',
      `${deposit.whatsappCountryCode || '+62'} ${deposit.whatsappNumber} | ${deposit.email}`,
    ],
    ['Alamat Surat', deposit.mailingAddress || '-'],
  ];

  autoTable(doc, {
    startY: 140,
    head: [['Rincian Data Serah Simpan', 'Informasi Dokumen']],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 6,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [11, 37, 70],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 160, fontStyle: 'bold', fillColor: [248, 250, 252] },
      1: { cellWidth: 363 },
    },
  });

  let currentY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 15 : 450;

  // Catatan Khusus S2 & S3 Box
  const isPostgraduate =
    deposit.degreeLevel === 'S2' ||
    deposit.degreeLevel === 'S3' ||
    deposit.workType === 'Tesis' ||
    deposit.workType === 'Disertasi';

  if (isPostgraduate) {
    doc.setFillColor(254, 242, 242); // Red 50
    doc.setDrawColor(239, 68, 68); // Red 500
    doc.roundedRect(36, currentY, 523, 44, 4, 4, 'FD');

    doc.setTextColor(185, 28, 28); // Red 700
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('PERHATIAN KHUSUS MAHASISWA PROGRAM PASCASARJANA (S2 / S3):', 46, currentY + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(153, 27, 27);
    doc.text(
      'Wajib menyerahkan 1 eksemplar hard copy karya ilmiah ke DROPBOX Pascasarjana:',
      46,
      currentY + 28
    );
    doc.text(
      'Self Access Centre FEB UB, Gedung F Pascasarjana Lantai 1, Jl. MT Haryono No. 165, Malang 65145.',
      46,
      currentY + 38
    );

    currentY += 56;
  }

  // General Instructions
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.roundedRect(36, currentY, 523, 48, 4, 4, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('KETENTUAN PROSES VERIFIKASI & BUKTI BEBAS PUSTAKA:', 46, currentY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    '1. Petugas SAC FEB UB akan melakukan verifikasi berkas naskah PDF maksimal 1×24 jam hari kerja (Senin–Jumat).',
    46,
    currentY + 27
  );
  doc.text(
    '2. Surat Bukti Serah Simpan resmi akan diterbitkan otomatis via email setelah status diverifikasi (APPROVED).',
    46,
    currentY + 39
  );

  // Digital Validation Footer Stamp
  currentY += 65;
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Dokumen ini dicetak otomatis oleh Sistem SAC-ONE FEB Universitas Brawijaya dan sah tanpa tanda tangan basah.', 36, currentY);
  doc.text(`Kode Verifikasi: ${deposit.depositNumber} • Hash ID: ${deposit.identityNumber}-${Date.now().toString(36).toUpperCase()}`, 36, currentY + 12);

  doc.save(`Bukti_Serah_Simpan_${deposit.depositNumber}_${deposit.identityNumber}.pdf`);
}
