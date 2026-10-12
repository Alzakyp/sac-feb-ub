import { date, key, text, url, type SheetRow } from './sheets';

export function repositoryRow(row: SheetRow) {
  const submittedAt = date(row.Timestamp);
  return { sourceKey: key(row.Timestamp, row.NIM, row.Judul), nomor: text(row['Nomor Berkas']), nama: text(row.Nama) || 'Mahasiswa FEB UB', nim: text(row.NIM) || '-', prodi: text(row.Prodi) || 'FEB UB', judul: text(row.Judul) || 'Tanpa Judul', jenis: text(row.Jenis) || 'Skripsi', pembimbing: text(row['Pembimbing/Promotor']), koPromotor1: text(row['Ko - Promotor 1']), koPromotor2: text(row['Ko - Promotor 2']), penguji1: text(row['Penguji 1']), penguji2: text(row['Penguji 2']), penguji3: text(row['Penguji 3']), penguji4: text(row['Penguji 4']), bagianAwalUrl: url(row['File Awal']), bagianIsiUrl: url(row['File Isi']), bagianAkhirUrl: url(row['File Akhir']), pernyataanUrl: url(row.Pernyataan), whatsapp: text(row.WhatsApp), email: text(row.Email), submittedAt };
}

export function membershipRow(row: SheetRow) {
  return { sourceKey: key(row.Tanggal, row.Jam, row.NIM, row.Email), registeredAt: date(`${text(row.Tanggal) || ''} ${text(row.Jam) || ''}`), adminName: text(row.Admin), memberType: text(row['Jenis Anggota']) || 'Mahasiswa', nim: text(row.NIM) || '-', fullName: text(row.Nama) || '-', studyProgram: text(row['Program Studi']), whatsapp: text(row.Whatsapp), email: text(row.Email), mailingAddress: text(row['Alamat Surat']), identityType: text(row.Identitas), identityPhoto: url(row['Foto Identitas']), selfiePhoto: url(row['Foto Selfie']), status: text(row.Status) || 'ACTIVE', activeDate: date(row['Tanggal Aktif']), validUntil: date(row['Berlaku Sampai']) };
}

export function depositRow(row: SheetRow) {
  return { sourceKey: key(row.Tanggal, row.NIM, row['Nomor Bukti'], row.Judul), submittedAt: date(row.Tanggal), workType: text(row.Jenis) || 'Skripsi', fullName: text(row.Nama) || '-', nim: text(row.NIM) || '-', studyProgram: text(row.Prodi), whatsapp: text(row.WhatsApp), email: text(row.Email), title: text(row.Judul) || 'Tanpa Judul', initialSectionUrl: url(row['Bagian Awal']), mainSectionUrl: url(row['Bagian Isi']), finalSectionUrl: url(row['Bagian Akhir']), proofNumber: text(row['Nomor Bukti']), revisionNotes: text(row.Perbaikan), checkDate: date(row['Tanggal Cek']), checkTime: text(row['Jam Cek']), hardcopySubmitted: Boolean(text(row.Hardcopy)), hardcopyDate: date(row['Tgl Hardcopy']), hardcopyProofUrl: url(row['Bukti Hardcopy']), validationDate: date(row['Tanggal Validasi']), plagiarismScore: text(row.Plagiasi), emailMissingNotice: Boolean(text(row['Kirim Email Tidak Lengkap'])), proofSent: Boolean(text(row['Kirim Bukti'])), downloadProofUrl: url(row['Unduh Bukti Lengkap']), driveFolderUrl: url(row.DRIVE) };
}

export function visitorRow(row: SheetRow) {
  const t = text(row.Tanggal);
  const ci = text(row['Check-In']);
  const co = text(row['Check-Out']);
  const validCi = ci && !ci.includes('1899') ? ci : null;
  const validCo = co && !co.includes('1899') ? co : null;
  const checkedIn = date(validCi ? `${t || ''} ${validCi}` : t);
  const checkedOut = date(validCo ? `${t || ''} ${validCo}` : null);
  return {
    sourceKey: key(row.Tanggal, row.NIM, row['Check-In'], row['Loker Tas'], row['Loker Sepatu']),
    identityNumber: text(row.NIM) || '-',
    fullName: text(row.Nama) || '-',
    studyProgram: text(row['Program Studi']) || '-',
    bagLocker: text(row['Loker Tas']),
    shoeLocker: text(row['Loker Sepatu']),
    adminName: text(row.Admin),
    checkInTime: checkedIn || new Date(),
    checkOutTime: checkedOut,
    status: checkedOut ? 'COMPLETED' : 'COMPLETED',
  };
}
