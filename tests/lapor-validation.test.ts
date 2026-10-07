import assert from 'node:assert/strict';
import { validateLaporPayload } from '../lib/lapor-validation';

assert.equal(validateLaporPayload({ fullName: 'A', identityNumber: '123', email: 'a@ub.ac.id', phone: '08123', description: 'x' }), 'NIM minimal 5 digit.');
assert.equal(validateLaporPayload({ fullName: 'A', identityNumber: '12345', email: 'bukan-email', phone: '08123', description: 'x' }), 'Email tidak valid.');
assert.equal(validateLaporPayload({ fullName: 'A', identityNumber: '12345', email: 'a@ub.ac.id', phone: '', description: 'x' }), 'Nomor WhatsApp wajib diisi.');
assert.equal(validateLaporPayload({ fullName: 'A', identityNumber: '12345', email: 'a@ub.ac.id', phone: '123', description: 'x' }), 'Nomor WhatsApp minimal 9 digit.');
assert.equal(validateLaporPayload({ fullName: 'A', identityNumber: '12345', email: 'a@ub.ac.id', phone: '08123456789', description: 'x' }), null);
console.log('lapor validation: OK');
