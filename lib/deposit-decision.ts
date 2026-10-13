export function validateDepositDecision(input: { status: string; notes: string; degreeLevel: string; hardcopy: boolean }) {
  if ((input.status === 'REVISION_NEEDED' || input.status === 'REJECTED') && !input.notes.trim()) return 'Catatan pemeriksaan wajib diisi.';
  if (input.status === 'APPROVED' && (input.degreeLevel === 'S2' || input.degreeLevel === 'S3') && !input.hardcopy) return 'Hardcopy S2/S3 harus diterima sebelum disetujui.';
  return null;
}
