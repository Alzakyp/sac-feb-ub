import assert from 'node:assert/strict';
import { createMemberSession, verifyMemberSession } from '../lib/member-session';
const token = createMemberSession({ source: 'sheet', accountId: 'abc', nim: '12345' });
assert.deepEqual(verifyMemberSession(token), { source: 'sheet', accountId: 'abc', nim: '12345' });
assert.equal(verifyMemberSession(`${token}x`), null);
assert.equal(verifyMemberSession(''), null);
console.log('Member session passed.');
