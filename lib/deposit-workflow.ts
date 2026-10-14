export type DepositWorkflowInput = {
  degreeLevel: string;
  verificationStatus: string;
  hardcopySubmitted: boolean;
};

export function depositWorkflow(input: DepositWorkflowInput) {
  if (input.verificationStatus === 'REJECTED') return { label: 'Ditolak', tone: 'rejected' as const, step: 0 };
  if (input.verificationStatus === 'REVISION_NEEDED') return { label: 'Perlu revisi', tone: 'revision' as const, step: 1 };
  if (input.verificationStatus === 'RESUBMITTED') return { label: 'Revisi diajukan ulang', tone: 'pending' as const, step: 1 };
  if (input.verificationStatus === 'PROOF_ISSUED') return { label: 'Bukti terbit', tone: 'approved' as const, step: 3 };
  const requiresHardcopy = input.degreeLevel === 'S2' || input.degreeLevel === 'S3';
  if (input.verificationStatus === 'APPROVED' && requiresHardcopy && !input.hardcopySubmitted) return { label: 'Menunggu hardcopy', tone: 'waiting' as const, step: 2 };
  if (input.verificationStatus === 'APPROVED') return { label: 'Disetujui (Menunggu penerbitan bukti)', tone: 'waiting' as const, step: 2 };
  return { label: 'Menunggu pemeriksaan', tone: 'pending' as const, step: 1 };
}
