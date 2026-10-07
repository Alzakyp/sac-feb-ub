import assert from 'node:assert/strict';
import { normalizePlagiarismStatus } from '../lib/plagiarism';

assert.equal(normalizePlagiarismStatus('selesai'), 'COMPLETED');
assert.equal(normalizePlagiarismStatus('diproses'), 'PROCESSING');
assert.equal(normalizePlagiarismStatus('lainnya'), 'PENDING');
console.log('plagiarism: OK');
