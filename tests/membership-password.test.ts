import assert from 'node:assert/strict';
import { membershipRow } from '../lib/sheet-mappers';

const row: any = { Tanggal: '2026-01-01', Jam: '10:00', NIM: '12345', Nama: 'A', Email: 'a@x.test', Password: 'secret123' };
const mapped = membershipRow(row);
assert.equal(mapped.password, 'secret123');
assert.doesNotMatch(JSON.stringify(mapped), /passwordHash/);
console.log('Membership password mapper passed.');
