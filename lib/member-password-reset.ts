import { createHash, randomBytes } from 'node:crypto';

export const RESET_TTL_MS = 20 * 60 * 1000;
export const RESET_MESSAGE = 'Jika akun dan email terdaftar memenuhi syarat, tautan reset akan dikirim. Periksa inbox dan spam.';
export function resetTokenHash(token: string) { return createHash('sha256').update(token).digest('hex'); }
export function newResetToken() { return randomBytes(32).toString('hex'); }
export function validResetInput(token: unknown, password: unknown) {
  return typeof token === 'string' && /^[a-f0-9]{64}$/.test(token) && typeof password === 'string' && password.length >= 12 && password.length <= 72 && Buffer.byteLength(password, 'utf8') <= 72;
}
