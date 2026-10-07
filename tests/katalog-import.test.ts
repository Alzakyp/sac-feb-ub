import assert from 'node:assert/strict';
import { mapKatalogRow } from '../lib/katalog-import';

assert.equal(mapKatalogRow({ Judul: 'Data salah', Tahun: 9780367861964 })?.publicationYear, null);

const book = mapKatalogRow({
  'No. Inventaris': 102000000001,
  Register: 18000470,
  Judul: '--andai aku jadi presiden',
  Pengarang: 'Mashad, Dhurorudin',
  Edisi: 'Cet. 2',
  'Tempat Terbit': 'Jakarta',
  Penerbit: 'Khalifa',
  Tahun: 2004,
  Deskripsi: 'xv, 242 hal.; 24 cm',
  ISBN: '9789799844736',
  DDC: '351.00313 MAS -',
  Subjek: 'Presidents -- Indonesia',
});

assert.deepEqual(book, {
  inventoryNumber: '102000000001',
  registerNumber: '18000470',
  title: '--andai aku jadi presiden',
  author: 'Mashad, Dhurorudin',
  edition: 'Cet. 2',
  publicationPlace: 'Jakarta',
  publisher: 'Khalifa',
  publicationYear: 2004,
  physicalDescription: 'xv, 242 hal.; 24 cm',
  isbn: '9789799844736',
  ddc: '351.00313 MAS -',
  subject: 'Presidents -- Indonesia',
});

console.log('katalog import: OK');
