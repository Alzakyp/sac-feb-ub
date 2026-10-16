import assert from 'node:assert/strict';
import { registrationPrograms, studyLevelFor } from '../lib/registration-programs';
assert.equal(Object.keys(registrationPrograms).length, 3);
assert.equal(Object.values(registrationPrograms).flat().length, 17);
assert.equal(studyLevelFor('S3 Ilmu Akuntansi Kampus Jakarta'), 'S3');
assert.equal(studyLevelFor('Profesi Akuntan'), 'Profesi');
assert.equal(studyLevelFor('tidak dikenal'), '');
assert.equal(new Set(Object.values(registrationPrograms).flat()).size, 17);
console.log('Registration programs passed');
