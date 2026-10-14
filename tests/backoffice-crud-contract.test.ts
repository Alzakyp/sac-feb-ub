import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const roots = [
  'app/api/backoffice/staff/[id]/route.ts',
  'app/api/backoffice/repository/[id]/route.ts',
  'app/api/backoffice/repository/route.ts',
  'app/api/backoffice/members/[id]/route.ts',
  'app/api/backoffice/members/route.ts',
  'app/api/backoffice/membership-records/[id]/route.ts',
  'app/api/backoffice/membership-records/route.ts',
  'app/api/backoffice/books/[id]/route.ts',
  'app/api/backoffice/books/route.ts',
];

for (const file of roots) {
  const code = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  assert.match(code, /verifySession/);
  assert.doesNotMatch(code, /passwordHash:\s*true/);
}

const ui = readFileSync(new URL('../app/admin/page.tsx', import.meta.url), 'utf8');
assert.match(ui, /CrudPanel kind="repository"/);
assert.match(ui, /CrudPanel kind="members"/);
assert.match(ui, /CrudPanel kind="books"/);
const staff = readFileSync(new URL('../app/api/backoffice/staff/[id]/route.ts', import.meta.url), 'utf8');
assert.match(staff, /session\.role !== 'PROGRAMMER' && target\.role === 'PROGRAMMER'/);

console.log('Backoffice CRUD contract passed.');
