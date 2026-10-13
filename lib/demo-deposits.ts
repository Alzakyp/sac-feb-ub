// ponytail: empat skenario demo saja; tambah fixture jika alur status baru diterapkan.
const base = {
  fullName: 'CONTOH — Mahasiswa SAC',
  degreeLevel: 'S1',
  studyProgram: 'S1 Manajemen',
  whatsappNumber: '0000000000',
  email: 'demo@example.invalid',
  mailingAddress: 'DATA DEMO — bukan pengajuan nyata',
  titleId: 'CONTOH — Karya ilmiah untuk simulasi serah simpan',
  workType: 'Skripsi',
  initialSectionUrl: 'demo/tidak-ada-bagian-awal.pdf',
  mainSectionUrl: 'demo/tidak-ada-bagian-isi.pdf',
  finalSectionUrl: 'demo/tidak-ada-bagian-akhir.pdf',
};

export const demoDeposits = [
  { ...base, depositNumber: 'DEP-26-1001', identityNumber: 'DEMO-SAC-1001', verificationStatus: 'PENDING', revisionNotes: null, hardcopySubmitted: false },
  { ...base, depositNumber: 'DEP-26-1002', identityNumber: 'DEMO-SAC-1002', verificationStatus: 'REVISION_NEEDED', revisionNotes: 'CONTOH: Bagian awal perlu dilengkapi halaman pengesahan.', hardcopySubmitted: false },
  { ...base, depositNumber: 'DEP-26-1003', identityNumber: 'DEMO-SAC-1003', verificationStatus: 'APPROVED', revisionNotes: null, hardcopySubmitted: true, verifiedAt: new Date('2026-01-03T08:00:00.000Z') },
  { ...base, depositNumber: 'DEP-26-1004', identityNumber: 'DEMO-SAC-1004', verificationStatus: 'REJECTED', revisionNotes: 'CONTOH: Berkas tidak sesuai persyaratan. Ajukan ulang dengan dokumen yang benar.', hardcopySubmitted: false },
];
