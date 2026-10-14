# Backoffice CRUD SAC — Design

## Tujuan

Melengkapi pengelolaan staf, repositori, keanggotaan, dan katalog buku dengan operasi tambah, lihat detail, ubah, status/aktivasi yang relevan, serta hapus melalui UI backoffice dan API tervalidasi.

## Prinsip Umum

- Semua otorisasi diterapkan di API, bukan hanya menyembunyikan tombol UI.
- Semua perubahan memerlukan sesi staf valid.
- `PROGRAMMER` memiliki seluruh izin.
- `ADMIN` dapat mengelola `ADMIN` dan `PETUGAS`, tetapi tidak dapat membuat, mengubah, reset password, menonaktifkan, atau menghapus `PROGRAMMER`.
- Password/hash, dokumen identitas privat, dan URL sensitif tidak dimasukkan ke daftar umum atau export.
- Hapus memakai dialog konfirmasi yang menyebut objek; tidak ada bulk delete.
- Form menampilkan validasi dan kegagalan API secara jelas.
- Operasi gagal tidak menutup dialog atau menghilangkan input.

## Kelola Staf

Fungsi:
- daftar staf;
- tambah staf `PETUGAS`/`ADMIN`; `PROGRAMMER` hanya dapat dibuat oleh programmer;
- lihat detail non-sensitif;
- ubah nama dan role;
- aktif/nonaktif;
- reset password;
- hapus.

Pembatasan:
- akun tidak boleh menonaktifkan atau menghapus dirinya;
- admin aktif terakhir tidak boleh dihapus/dinonaktifkan;
- admin tidak boleh mengelola target programmer atau menaikkan role menjadi programmer;
- hash password tidak pernah dikirim ke client.

## Kelola Repositori

Fungsi:
- daftar dan pencarian;
- tambah dokumen;
- lihat detail lengkap untuk staf;
- ubah metadata, pembimbing/penguji, dan URL Google Drive per bagian;
- hapus dengan konfirmasi.

Dokumen hasil sinkronisasi Sheet tetap dapat diedit lokal. Sinkronisasi selanjutnya dapat menimpa field lokal atau memunculkan kembali record yang dihapus. UI menampilkan label sumber (`SHEET` bila `sourceKey` ada, `LOCAL` bila tidak) dan peringatan tersebut.

Penghapusan dokumen yang memiliki log aktivitas harus menjaga integritas database. Bila relasi tidak mengizinkan penghapusan, API menolak dengan pesan jelas; log tidak dihapus diam-diam.

## Kelola Keanggotaan

Dua sumber ditampilkan dalam satu panel dengan filter sumber:
- `Member`: pendaftaran website;
- `MembershipRecord`: arsip Google Sheet.

Kolom bersama: nama, NIM, email, jenis, program studi, status, sumber, tanggal. Detail sensitif hanya tersedia bagi staf yang berwenang dan tidak ikut export umum.

Fungsi untuk kedua sumber:
- daftar, cari, filter sumber/status;
- tambah record lokal;
- lihat detail;
- ubah data profil dan status;
- hapus dengan konfirmasi.

Aturan:
- password/hash tidak pernah ditampilkan;
- perubahan password akun web hanya melalui aksi reset khusus;
- password arsip Sheet tidak diubah lewat form profil;
- record Sheet menampilkan peringatan bahwa perubahan lokal dapat tertimpa dan penghapusan lokal dapat muncul kembali setelah sinkronisasi;
- tambah dari panel menghasilkan sumber lokal yang sesuai pilihan operator; default `Member` untuk akun login, `MembershipRecord` hanya untuk arsip tanpa akun aktif.

## Kelola Buku

Fungsi:
- daftar, cari, pagination;
- tambah;
- lihat detail;
- ubah metadata katalog;
- hapus dengan konfirmasi.

Nomor inventaris/identitas unik divalidasi server. API menolak duplikasi dan input wajib kosong.

## UI

Setiap panel memakai pola konsisten:
- toolbar pencarian/filter dan tombol Tambah;
- tabel responsif dengan aksi Detail, Edit, Hapus;
- modal atau dialog terfokus dengan judul objek;
- target sentuh minimal 44 px, fokus keyboard jelas, escape untuk menutup bila tidak sedang menyimpan;
- status loading/sukses/error;
- warning amber untuk record Sheet;
- destructive action merah dan konfirmasi eksplisit.

## API dan Validasi

Endpoint collection menyediakan GET/POST; endpoint `[id]` menyediakan GET/PATCH/DELETE. Keanggotaan menggunakan endpoint yang menyertakan tipe sumber agar ID dari tabel berbeda tidak ambigu.

Semua payload memakai allowlist field. URL diverifikasi sebagai `https://` bila diisi. Email dinormalisasi lowercase. NIM dinormalisasi tanpa spasi. Pagination dibatasi server. Response tidak memuat password hash.

## Sinkronisasi

Google Sheet tetap sumber eksternal satu arah `Sheet → DB`. CRUD lokal tidak menulis balik ke Sheet. UI menjelaskan konsekuensi ini sebelum perubahan record Sheet. Tidak ada tombstone atau mekanisme merge baru pada tahap ini.

## Pengujian

- role programmer/admin pada operasi staf;
- field allowlist dan hash tidak bocor;
- CRUD sukses dan validasi gagal untuk keempat modul;
- sumber keanggotaan tidak ambigu;
- warning record Sheet hadir;
- duplikasi buku ditolak;
- penghapusan repositori dengan relasi ditangani aman;
- TypeScript dan production build lulus.
