import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const ui = readFileSync(new URL('../components/admin/CrudPanel.tsx', import.meta.url), 'utf8');
assert.match(ui, /divide-y divide-slate-100/);
assert.match(ui, /hover:bg-amber-50/);
assert.match(ui, /aria-label=\{`Detail/);
assert.match(ui, /material-symbols-outlined/);
assert.doesNotMatch(ui, /my-5 grid gap-4/);
console.log('CRUD list visual contract passed.');
