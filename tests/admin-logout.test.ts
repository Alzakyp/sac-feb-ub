import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../app/admin/page.tsx', import.meta.url), 'utf8');
assert.match(source, /fetch\('\/api\/backoffice\/logout',\s*\{\s*method:\s*'POST'/);
assert.match(source, /window\.location\.assign\('\/backoffice\/login'\)/);
assert.doesNotMatch(source, /title="Kembali ke Beranda Publik"/);
console.log('Admin logout wiring test passed.');
