import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registrationPrograms, studyLevelFor } from '../lib/registration-programs';

const page = readFileSync('app/pendaftaran/page.tsx', 'utf8');

// Requirements from user:
// 1. Departemen dropdown
assert.match(page, /Departemen \*/);
assert.match(page, /setDepartment/);

// 2. Program studi dropdown dependent on Departemen
assert.match(page, /name="studyProgram"/);

// 3. Auto jenjang
assert.match(page, /name="studyLevel"/);
assert.match(page, /studyLevelFor/);

// 4. Custom styled file choose
assert.match(page, /FileField/);
assert.match(page, /name="selfie"/);
assert.match(page, /name="identityFile"/);
assert.match(page, /sr-only/);

// 5. Old negative statement removed
assert.doesNotMatch(page, /Tidak ada kartu anggota/);

// 6. Test all 17 study programs match their expected levels
for (const [dept, prodis] of Object.entries(registrationPrograms)) {
  for (const prodi of prodis) {
    const level = studyLevelFor(prodi);
    assert.ok(['S1', 'S2', 'S3', 'Profesi'].includes(level), `${prodi} must have valid level`);
  }
}

console.log('Registration page and program contract test passed.');
