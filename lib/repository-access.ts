export type Section = 'AWAL' | 'ISI' | 'AKHIR';
export type AccessType = 'READ' | 'DOWNLOAD';
export type RepositoryAccessInput = { documentId: string; nim: string; purpose: string; section: Section; accessType: AccessType };

type DocumentLinks = { bagianAwalUrl: string | null; bagianIsiUrl: string | null; bagianAkhirUrl: string | null };

export function validateRepositoryAccess(input: unknown): RepositoryAccessInput | null {
  if (!input || typeof input !== 'object') return null;
  const v = input as Record<string, unknown>;
  if (typeof v.documentId !== 'string' || !/^[a-zA-Z0-9_-]{5,64}$/.test(v.documentId)) return null;
  if (typeof v.nim !== 'string' || !/^[a-zA-Z0-9-]{1,32}$/.test(v.nim.trim())) return null;
  if (typeof v.purpose !== 'string' || !v.purpose.trim() || v.purpose.trim().length > 500) return null;
  if (v.section !== 'AWAL' && v.section !== 'ISI' && v.section !== 'AKHIR') return null;
  if (v.accessType !== 'READ' && v.accessType !== 'DOWNLOAD') return null;
  return { documentId: v.documentId, nim: v.nim.trim(), purpose: v.purpose.trim(), section: v.section, accessType: v.accessType };
}

export function getRepositorySectionUrl(doc: DocumentLinks, section: Section, accessType: AccessType): string | null {
  const raw = section === 'AWAL' ? doc.bagianAwalUrl : section === 'ISI' ? doc.bagianIsiUrl : doc.bagianAkhirUrl;
  if (!raw) return null;
  let url: URL;
  try { url = new URL(raw); } catch { return null; }
  if (url.protocol !== 'https:') return null;
  if (url.hostname === 'drive.google.com') {
    const id = url.pathname.match(/^\/file\/d\/([\w-]+)(?:\/|$)/)?.[1] || (url.pathname === '/open' || url.pathname === '/uc' ? url.searchParams.get('id') : null);
    if (id && /^[\w-]+$/.test(id)) {
      return accessType === 'READ' ? `https://drive.google.com/file/d/${id}/preview` : `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
    }
  }
  return url.toString();
}
