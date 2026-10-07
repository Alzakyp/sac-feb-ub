import assert from 'node:assert/strict';
import { normalizeWhatsapp, validateMemberInput } from '../lib/member-registration';

assert.equal(normalizeWhatsapp('0812-3456-7890'), '6281234567890');
assert.equal(normalizeWhatsapp('+62 812 3456 7890'), '6281234567890');
assert.equal(validateMemberInput({ fullName: 'A', nim: '123', email: 'a@b.com', whatsapp: '08123456789', password: '12345678' }), 'NIM minimal 5 digit.');
assert.equal(validateMemberInput({ fullName: 'A', nim: '12345', email: 'a@b.com', whatsapp: '08123456789', password: '12345678' }), null);
console.log('member registration: OK');
