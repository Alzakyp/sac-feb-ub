import assert from 'node:assert/strict';
import { createSession, verifySession } from '../lib/session';

process.env.SESSION_SECRET = 'test-secret-at-least-32-chars-long-random!';

const token = createSession('staff_123', 'ADMIN');
assert.ok(token.length > 20, 'token harus string panjang');
assert.deepEqual(verifySession(token), { staffId: 'staff_123', role: 'ADMIN' });
assert.equal(verifySession(`${token.split('.')[0]}.fakeSignature`), null);
assert.equal(verifySession(''), null);
assert.equal(verifySession('garbage'), null);
console.log('session: OK');
