import assert from 'node:assert/strict';
import { depositWorkflow } from '../lib/deposit-workflow';

assert.equal(depositWorkflow({ degreeLevel: 'S1', verificationStatus: 'PENDING', hardcopySubmitted: false }).label, 'Menunggu pemeriksaan');
assert.equal(depositWorkflow({ degreeLevel: 'S2', verificationStatus: 'APPROVED', hardcopySubmitted: false }).label, 'Menunggu hardcopy');
assert.equal(depositWorkflow({ degreeLevel: 'S2', verificationStatus: 'APPROVED', hardcopySubmitted: true }).label, 'Disetujui (Menunggu penerbitan bukti)');
assert.equal(depositWorkflow({ degreeLevel: 'S1', verificationStatus: 'REVISION_NEEDED', hardcopySubmitted: false }).tone, 'revision');
assert.equal(depositWorkflow({ degreeLevel: 'S1', verificationStatus: 'REJECTED', hardcopySubmitted: false }).tone, 'rejected');
console.log('Deposit workflow test passed.');
