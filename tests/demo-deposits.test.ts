import assert from 'node:assert/strict';
import { demoDeposits } from '../lib/demo-deposits';

assert.equal(demoDeposits.length, 4);
assert.deepEqual(demoDeposits.map((item) => item.verificationStatus), [
  'PENDING', 'REVISION_NEEDED', 'APPROVED', 'REJECTED',
]);
assert.ok(demoDeposits.every((item) => item.depositNumber.startsWith('DEP-26-')));
console.log('Demo deposit fixtures passed.');
