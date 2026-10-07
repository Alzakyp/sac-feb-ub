import assert from 'node:assert/strict';
import { mapRepositorySheetRow } from '../lib/repository-sheets-import';

assert.deepEqual(mapRepositorySheetRow({
  Nama: 'Nama Mahasiswa', NIM: '175020207111047', Prodi: 'S2 Manajemen', Judul: 'Judul Tesis',
  'Pembimbing/Promotor': 'Dr. Pembimbing', 'Penguji 1': 'Dr. Penguji', 'Bagian Awal': 'https://drive/a',
  'Bagian Isi': 'https://drive/b', 'Bagian Akhir': 'https://drive/c', SACRBI_ID: 'MASTER|no.: 0001/kim.02/sac/2023',
}), {
  nomor: 'MASTER|no.: 0001/kim.02/sac/2023', nama: 'Nama Mahasiswa', nim: '175020207111047', prodi: 'S2 Manajemen',
  judul: 'Judul Tesis', jenis: 'Tesis', pembimbing: 'Dr. Pembimbing', penguji1: 'Dr. Penguji', penguji2: null,
  bagianAwalUrl: 'https://drive/a', bagianIsiUrl: 'https://drive/b', bagianAkhirUrl: 'https://drive/c', viewCount: 0, downloadCount: 0,
});
console.log('repository Sheets import: OK');
