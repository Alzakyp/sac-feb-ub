const encoder = new TextEncoder();
const secret = process.env.SESSION_SECRET || 'fallback-secret-for-development-32chars';
const normalizedSecret = secret.trim();

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export async function verifyEdgeSession(token: string): Promise<boolean> {
  const splitAt = token.lastIndexOf('.');
  if (splitAt < 1) return false;
  try {
    const payload = token.slice(0, splitAt);
    const signature = base64UrlToBytes(token.slice(splitAt + 1));
    const key = await crypto.subtle.importKey('raw', encoder.encode(normalizedSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(payload));
    if (!valid) return false;
    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload)));
    return Boolean(data.staffId && data.role && Date.now() - data.ts <= 12 * 60 * 60 * 1000);
  } catch {
    return false;
  }
}
