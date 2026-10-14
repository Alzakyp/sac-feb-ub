import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const ui = readFileSync(new URL('../app/repository/page.tsx', import.meta.url), 'utf8');
const route = readFileSync(new URL('../app/api/repository/access/route.ts', import.meta.url), 'utf8');
assert.match(ui, /api\/members\/me/);
assert.match(ui, /readOnly=\{memberLoggedIn\}/);
assert.match(route, /memberProfile/);
console.log('Repository member-session contract passed.');
