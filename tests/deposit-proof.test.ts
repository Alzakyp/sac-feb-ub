import assert from 'node:assert/strict';
import { escapeHtml, proofHtml, proofNumber } from '../lib/deposit-proof';
assert.equal(escapeHtml('<script>'), '&lt;script&gt;');
assert.equal(proofNumber('DEP-26-0001', new Date('2026-10-14')), 'DEP-26-0001/KIM.02/SAC.1/TH.2026');
const html = proofHtml({ proofNumber: 'X', fullName: '<img>', identityNumber: '123', studyProgram: 'FEB', titleId: 'Test', createdAt: new Date('2026-01-01'), verifiedAt: new Date('2026-01-02'), plagiarismScore: null, completeness: null });
assert.match(html, /&lt;img&gt;/); assert.doesNotMatch(html, /<img>/);
console.log('Deposit proof test passed.');
