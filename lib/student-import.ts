export function mapStudentRow(row: { NIM?: unknown; Nama?: unknown; Prodi?: unknown }): { nim: string; fullName: string; studyProgram: string } | null {
  const nimStr = String(row.NIM ?? '').trim();
  const fullName = String(row.Nama ?? '').trim();
  const studyProgram = String(row.Prodi ?? '').trim();
  if (!nimStr || !fullName || !studyProgram) return null;
  if (nimStr.includes('E+') || nimStr.includes('e+')) return null;
  const cleanNim = nimStr.replace(/\.0$/, '').replace(/\D/g, '');
  if (cleanNim.length < 5) return null;
  return { nim: cleanNim, fullName, studyProgram };
}
