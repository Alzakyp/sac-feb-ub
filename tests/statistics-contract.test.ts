import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const route = readFileSync(new URL('../app/api/statistik/route.ts', import.meta.url), 'utf8');
const page = readFileSync(new URL('../app/statistik/page.tsx', import.meta.url), 'utf8');
assert.match(route, /prisma\.visitorLog/);
assert.match(route, /prisma\.repositoryDocument\.count/);
assert.match(route, /prisma\.resourceAccessLog\.groupBy/);
assert.doesNotMatch(page, /14\.850|28\.450|Kiosk Log SQLite/);
console.log('Statistics real-data contract passed.');
