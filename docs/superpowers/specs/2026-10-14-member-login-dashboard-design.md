# Login dan Dashboard Anggota SAC — Design

## Tujuan

Anggota aktif dapat login dengan NIM atau email dan password dari data keanggotaan, melihat data layanan miliknya, serta mengajukan Serah Simpan tanpa mengetik ulang identitas.

## Ruang Lingkup

- Login, logout, sesi anggota, dashboard anggota.
- Impor password dari Google Sheet keanggotaan sebagai hash bcrypt.
- Riwayat/status Serah Simpan milik anggota.
- Form Serah Simpan sadar-sesi: NIM, nama, dan program studi dari sesi/DB.
- Baris keanggotaan tanpa password belum dapat login; aktivasi/reset ditunda.

## Model dan Migrasi Data

`MembershipRecord` ditambah `passwordHash String?`. Nilai plaintext dari kolom `Password` Sheet hanya berada di memori selama sinkronisasi, langsung di-hash bcrypt sebelum ditulis. Plaintext tidak dicatat ke log atau response API.

Impor tetap idempotent. Password kosong tidak menghapus hash yang sudah ada. Password Sheet yang berubah menghasilkan hash baru. `Member.passwordHash` yang berasal dari pendaftaran web tetap dipakai langsung.

Status login aktif menerima `ACTIVE` dan `APPROVED` untuk kompatibilitas dua sumber saat ini. Status lain ditolak.

## Autentikasi

Login menerima `identity` (NIM atau email) dan `password`. Pencarian dilakukan pada `Member`, lalu `MembershipRecord`. Password diverifikasi dengan bcrypt. Jika dua sumber cocok, `Member` aktif diprioritaskan.

Cookie `sac_member_session`:
- ditandatangani `SESSION_SECRET`;
- `httpOnly`, `sameSite=lax`, path `/`;
- masa berlaku 8 jam;
- payload minimal: sumber akun, ID record, NIM, timestamp;
- terpisah dari `sac_session` admin.

Logout hanya menghapus cookie anggota. API tidak mengembalikan hash atau data identitas sensitif.

## Dashboard Anggota

Rute `/anggota/login` dan `/anggota`.

Dashboard menampilkan:
- salam, nama, NIM, program studi, status anggota;
- ringkasan Serah Simpan: total, menunggu, revisi, disetujui;
- daftar pengajuan `ScientificWorkDeposit` berdasarkan NIM sesi;
- status, judul, waktu pengajuan, hardcopy, catatan staf, dan bukti jika tersedia;
- CTA membuat pengajuan baru dan logout.

Tampilan mengikuti identitas SAC: navy, amber, kartu ringan, responsif, aksesibel, fokus keyboard jelas, serta animasi menghormati `prefers-reduced-motion`.

## Integrasi Serah Simpan

Saat sesi anggota valid, `/serah-simpan` mengisi NIM, nama, dan program studi dari endpoint profil anggota lalu mengunci field identitas. API pengajuan membaca sesi anggota dan menimpa identitas kiriman dengan data server. Pengguna tanpa sesi tetap memakai alur publik saat ini.

Dashboard dan endpoint anggota hanya boleh membaca pengajuan dengan NIM dari sesi; parameter NIM dari browser diabaikan.

## Error dan Keamanan

- Kredensial salah: pesan generik, tidak mengungkap akun terdaftar.
- Akun tanpa password: pesan bahwa login belum tersedia dan diminta menghubungi SAC.
- Status belum aktif: akses ditolak.
- Cookie tidak valid/kedaluwarsa: 401 dan redirect login.
- Tidak ada reset password mandiri tanpa SMTP.
- Password Sheet tidak pernah disimpan plaintext.

## Pengujian

- Mapper mengenali kolom `Password` tanpa membocorkannya.
- Sinkronisasi menghasilkan bcrypt; password kosong mempertahankan hash.
- Login NIM/email berhasil untuk akun aktif; gagal untuk password salah, hash kosong, status nonaktif.
- Sesi anggota tervalidasi dan logout menghapus cookie.
- Dashboard hanya mengembalikan pengajuan berdasarkan NIM sesi.
- Serah Simpan pengguna login tidak dapat mengganti identitas.
- TypeScript dan production build lulus.
