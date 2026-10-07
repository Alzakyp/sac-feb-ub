export type PlagiarismStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

export function normalizePlagiarismStatus(status: string): PlagiarismStatus {
  const clean = status.trim().toUpperCase();
  if (clean === 'SELESAI' || clean === 'COMPLETED') return 'COMPLETED';
  if (clean === 'DIPROSES' || clean === 'PROCESSING') return 'PROCESSING';
  if (clean === 'DITOLAK' || clean === 'REJECTED') return 'REJECTED';
  return 'PENDING';
}
