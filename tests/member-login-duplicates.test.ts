import assert from 'node:assert/strict';
import { membershipAccountQuery, preferredMembership } from '../lib/member-login';

assert.deepEqual(membershipAccountQuery('student@ub.ac.id'), {
  where: { OR: [{ nim: 'student@ub.ac.id' }, { email: 'student@ub.ac.id' }], status: { in: ['ACTIVE', 'APPROVED'] } },
  orderBy: [{ registeredAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
});
assert.equal(preferredMembership([{ passwordHash: null, id: 'old' }, { passwordHash: '$2b$hash', id: 'new' }])?.id, 'new');
console.log('Duplicate membership selection passed');
