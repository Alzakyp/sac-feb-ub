import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const ui = readFileSync(new URL('../app/admin/page.tsx', import.meta.url), 'utf8');
assert.match(ui, /Tambah Staf/);
assert.match(ui, /showCreate && <div className="fixed/);
assert.doesNotMatch(ui, /<form onSubmit=\{create\} className="rounded-2xl bg-white p-5/);
console.log('Staff modal contract passed.');
