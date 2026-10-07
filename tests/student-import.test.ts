import assert from 'node:assert/strict';
import { mapStudentRow } from '../lib/student-import';

assert.deepEqual(mapStudentRow({ NIM: '105020101111016', Nama: 'Nama', Prodi: 'S1 Manajemen' }), { nim: '105020101111016', fullName: 'Nama', studyProgram: 'S1 Manajemen' });
assert.equal(mapStudentRow({ NIM: '1.76E+20', Nama: 'Nama', Prodi: 'S1' }), null);
console.log('student import: OK');
