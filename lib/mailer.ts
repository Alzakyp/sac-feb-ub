import nodemailer from 'nodemailer';

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.MAIL_FROM;
  if (!host || !port || !user || !pass || !from) throw new Error('SMTP belum dikonfigurasi.');
  const transporter = nodemailer.createTransport({ host, port, secure: process.env.SMTP_SECURE === 'true', auth: { user, pass }, requireTLS: process.env.SMTP_SECURE !== 'true' });
  await transporter.sendMail({
    from,
    to,
    subject: 'Reset Password Anggota SAC FEB UB',
    text: `Gunakan tautan ini untuk membuat atau mereset password SAC FEB UB. Berlaku 20 menit: ${resetUrl}`,
    html: `<p>Gunakan tautan berikut untuk membuat atau mereset password SAC FEB UB.</p><p><a href="${resetUrl}">Atur password anggota</a></p><p>Tautan berlaku 20 menit. Abaikan email ini jika Anda tidak meminta reset.</p>`,
  });
}
