import assert from 'node:assert/strict';
import { depositWorkflow } from '../lib/deposit-workflow';
import { validateDepositDecision } from '../lib/deposit-decision';

// Task 1: Workflow status testing
assert.equal(depositWorkflow({ degreeLevel: 'S1', verificationStatus: 'PENDING', hardcopySubmitted: false }).label, 'Menunggu pemeriksaan');
assert.equal(depositWorkflow({ degreeLevel: 'S1', verificationStatus: 'REVISION_NEEDED', hardcopySubmitted: false }).label, 'Perlu revisi');
assert.equal(depositWorkflow({ degreeLevel: 'S1', verificationStatus: 'RESUBMITTED', hardcopySubmitted: false }).label, 'Revisi diajukan ulang');
assert.equal(depositWorkflow({ degreeLevel: 'S1', verificationStatus: 'APPROVED', hardcopySubmitted: false }).label, 'Disetujui (Menunggu penerbitan bukti)');
assert.equal(depositWorkflow({ degreeLevel: 'S1', verificationStatus: 'PROOF_ISSUED', hardcopySubmitted: false }).label, 'Bukti terbit');
assert.equal(depositWorkflow({ degreeLevel: 'S2', verificationStatus: 'APPROVED', hardcopySubmitted: false }).label, 'Menunggu hardcopy');
assert.equal(depositWorkflow({ degreeLevel: 'S2', verificationStatus: 'APPROVED', hardcopySubmitted: true }).label, 'Disetujui (Menunggu penerbitan bukti)');
assert.equal(depositWorkflow({ degreeLevel: 'S2', verificationStatus: 'PROOF_ISSUED', hardcopySubmitted: true }).label, 'Bukti terbit');

// Decision validation
assert.equal(typeof validateDepositDecision({ status: 'REVISION_NEEDED', notes: '', degreeLevel: 'S1', hardcopy: false }), 'string');
assert.equal(typeof validateDepositDecision({ status: 'REJECTED', notes: '', degreeLevel: 'S1', hardcopy: false }), 'string');
assert.equal(validateDepositDecision({ status: 'APPROVED', notes: '', degreeLevel: 'S1', hardcopy: false }), null);
assert.equal(typeof validateDepositDecision({ status: 'APPROVED', notes: '', degreeLevel: 'S2', hardcopy: false }), 'string');
assert.equal(validateDepositDecision({ status: 'APPROVED', notes: '', degreeLevel: 'S2', hardcopy: true }), null);
console.log('Task 1 workflow test passed.');
