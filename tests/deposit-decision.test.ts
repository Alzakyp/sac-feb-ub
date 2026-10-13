import assert from 'node:assert/strict';
import { validateDepositDecision } from '../lib/deposit-decision';

assert.equal(validateDepositDecision({ status: 'REVISION_NEEDED', notes: '', degreeLevel: 'S1', hardcopy: false }), 'Catatan pemeriksaan wajib diisi.');
assert.equal(validateDepositDecision({ status: 'REJECTED', notes: '   ', degreeLevel: 'S2', hardcopy: false }), 'Catatan pemeriksaan wajib diisi.');
assert.equal(validateDepositDecision({ status: 'APPROVED', notes: '', degreeLevel: 'S2', hardcopy: false }), 'Hardcopy S2/S3 harus diterima sebelum disetujui.');
assert.equal(validateDepositDecision({ status: 'APPROVED', notes: '', degreeLevel: 'S1', hardcopy: false }), null);
console.log('Deposit decision test passed.');
