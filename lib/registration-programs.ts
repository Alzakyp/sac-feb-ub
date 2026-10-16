export const registrationPrograms = {
  'Departemen Akuntansi': ['S1 Akuntansi', 'S2 Akuntansi', 'S3 Ilmu Akuntansi', 'S3 Ilmu Akuntansi Kampus Jakarta', 'Profesi Akuntan'],
  'Departemen Manajemen': ['S1 Manajemen', 'S1 Kewirausahaan', 'S2 Manajemen', 'S2 Manajemen Kampus Jakarta', 'S3 Manajemen Kampus Jakarta', 'S3 Ilmu Manajemen'],
  'Departemen Ilmu Ekonomi': ['S1 Ekonomi Pembangunan', 'S1 Ekonomi Keuangan dan Perbankan', 'S1 Ekonomi Islam', 'S2 Ilmu Ekonomi', 'S2 Ekonomi dan Bisnis Islam', 'S3 Ilmu Ekonomi'],
} as const;

export function studyLevelFor(program: string) {
  if (program === 'Profesi Akuntan') return 'Profesi';
  return /^(S[123])\b/.exec(program)?.[1] || '';
}
