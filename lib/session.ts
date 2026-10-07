import { createHmac, timingSafeEqual } from 'node:crypto';

const getSecret = () => {
  const secret = process.env.SESSION_SECRET || 'fallback-secret-for-development-32chars';
  if (secret.length < 32 && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be at least 32 characters in production');
  }
  return secret;
};

const SEP = '.';

export function createSession(staffId: string, role: string): string {
  const payloadStr = JSON.stringify({ staffId, role, ts: Date.now() });
  const payload = Buffer.from(payloadStr).toString('base64url');
  const signature = createHmac('sha256', getSecret()).update(payload).digest('base64url');
  return `${payload}${SEP}${signature}`;
}

export function verifySession(token: string): { staffId: string; role: string } | null {
  if (!token) return null;
  const idx = token.lastIndexOf(SEP);
  if (idx < 0) return null;

  const payload = token.slice(0, idx);
  const signature = token.slice(idx + 1);
  const expectedSignature = createHmac('sha256', getSecret()).update(payload).digest('base64url');

  try {
    const expectedBuf = Buffer.from(expectedSignature);
    const signatureBuf = Buffer.from(signature);
    if (expectedBuf.length !== signatureBuf.length) return null;
    if (!timingSafeEqual(signatureBuf, expectedBuf)) return null;

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.staffId || !data.role) return null;

    // Optional: add expiry logic, e.g. 12 hours max age
    const maxAgeMs = 12 * 60 * 60 * 1000;
    if (Date.now() - data.ts > maxAgeMs) return null;

    return { staffId: data.staffId, role: data.role };
  } catch (error) {
    return null;
  }
}
