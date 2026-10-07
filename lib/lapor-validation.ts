export function validateLaporPayload(data: { fullName: string; identityNumber: string; email: string; phone: string; description: string }): string | null {
  if (!data.fullName) return 'Nama wajib diisi.';
  if (!data.identityNumber || data.identityNumber.length < 5) return 'NIM minimal 5 digit.';
  if (!data.email || !data.email.includes('@')) return 'Email tidak valid.';
  if (!data.phone) return 'Nomor WhatsApp wajib diisi.';
  if (data.phone.replace(/[^0-9]/g, '').length < 9) return 'Nomor WhatsApp minimal 9 digit.';
  if (!data.description) return 'Deskripsi wajib diisi.';
  return null;
}
