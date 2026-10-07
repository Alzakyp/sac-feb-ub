export function normalizeWhatsapp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  return `62${digits}`;
}

export function validateMemberInput(data: { fullName: string; nim: string; email: string; whatsapp: string; password?: string }): string | null {
  if (!data.fullName) return 'Nama lengkap wajib diisi.';
  if (!data.nim || data.nim.length < 5) return 'NIM minimal 5 digit.';
  if (!data.email || !data.email.includes('@')) return 'Email tidak valid.';
  if (!data.whatsapp || data.whatsapp.replace(/\D/g, '').length < 9) return 'Nomor WhatsApp minimal 9 digit.';
  if (data.password && data.password.length < 6) return 'Password minimal 6 karakter.';
  return null;
}
