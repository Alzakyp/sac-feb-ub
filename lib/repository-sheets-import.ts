type Row = Record<string, unknown>;

function text(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const result = String(value).trim();
  return result && result !== '-' ? result : null;
}

export function mapRepositorySheetRow(row: Row) {
  const prodi = text(row.Prodi) || 'FEB UB';
  const normalized = prodi.toLowerCase();
  const jenis = normalized.includes('s3') || normalized.includes('doktor') ? 'Disertasi' : normalized.includes('s2') || normalized.includes('magister') ? 'Tesis' : 'Skripsi';
  return {
    nomor: text(row.SACRBI_ID),
    nama: text(row.Nama) || 'Mahasiswa FEB UB',
    nim: text(row.NIM) || '-',
    prodi,
    judul: text(row.Judul) || 'Tanpa Judul',
    jenis,
    pembimbing: text(row['Pembimbing/Promotor']),
    penguji1: text(row['Penguji 1']),
    penguji2: text(row['Penguji 2']),
    bagianAwalUrl: text(row['Bagian Awal']),
    bagianIsiUrl: text(row['Bagian Isi']),
    bagianAkhirUrl: text(row['Bagian Akhir']),
    viewCount: 0,
    downloadCount: 0,
  };
}
