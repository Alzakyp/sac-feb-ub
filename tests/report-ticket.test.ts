import assert from 'node:assert/strict';
import { createTicketNumber } from '../lib/report-ticket';

assert.equal(createTicketNumber(new Date('2026-10-07T00:00:00Z'), 1), 'LAP-2026-0001');
assert.equal(createTicketNumber(new Date('2026-10-07T00:00:00Z'), 42), 'LAP-2026-0042');
console.log('report ticket: OK');
