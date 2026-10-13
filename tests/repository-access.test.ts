import assert from 'node:assert/strict';
import { getRepositorySectionUrl, validateRepositoryAccess } from '../lib/repository-access';

const input = { documentId: 'clxexample123456789', nim: '215020300111057', purpose: 'Referensi skripsi', section: 'AWAL', accessType: 'READ' };
assert.deepEqual(validateRepositoryAccess(input), input);
for (const change of [{ nim: '' }, { nim: '1'.repeat(60) }, { purpose: '' }, { purpose: 'x'.repeat(501) }, { section: 'UNKNOWN' }, { accessType: 'UNKNOWN' }]) {
  assert.equal(validateRepositoryAccess({ ...input, ...change }), null);
}
const doc = { bagianAwalUrl: 'https://drive.google.com/file/d/abc_123/view?usp=sharing', bagianIsiUrl: null, bagianAkhirUrl: 'http://example.org/file.pdf' };
assert.equal(getRepositorySectionUrl(doc, 'AWAL', 'READ'), 'https://drive.google.com/file/d/abc_123/preview');
assert.equal(getRepositorySectionUrl(doc, 'AWAL', 'DOWNLOAD'), 'https://drive.google.com/uc?export=download&id=abc_123');
assert.equal(getRepositorySectionUrl(doc, 'ISI', 'READ'), null);
assert.equal(getRepositorySectionUrl(doc, 'AKHIR', 'DOWNLOAD'), null);
assert.equal(getRepositorySectionUrl({ ...doc, bagianAwalUrl: 'https://evil.example/file/d/abc_123/view' }, 'AWAL', 'DOWNLOAD'), 'https://evil.example/file/d/abc_123/view');
console.log('Repository access validation passed.');
