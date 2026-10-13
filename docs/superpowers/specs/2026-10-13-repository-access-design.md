# Verifikasi akses repositori FEB UB

## Tujuan
Pencarian tetap terbuka. Sebelum membuka berkas, pengguna memasukkan NIM, tujuan dan jenis akses (Baca atau Unduh). NIM wajib ditemukan dalam master Student; tidak ditemukan mendapat HTTP 403 dengan pesan tepat: Anda tidak mendapatkan akses ini.

## Alur
1. API pencarian hanya menyediakan metadata dan indikator ketersediaan bagian awal/isi/akhir, tidak URL Drive. Respons tidak membocorkan kontak atau pernyataan mahasiswa.
2. Setiap tombol berkas membuka dialog berlabel, judul dokumen, NIM, tujuan wajib dan pilihan Baca/Unduh. Form tidak menerima nama/prodi sebagai identitas terpercaya.
3. POST /api/repository/access menerima documentId, section (awal/isi/akhir), nim, purpose dan accessType (READ/DOWNLOAD). Input divalidasi panjang/enum; dokumen dipilih server-side, tidak menerima URL klien.
4. Server mencari NIM di Student. Tidak ditemukan: 403 dan pesan penolakan, tanpa URL. Dokumen/berkas tidak tersedia: 404; URL selain HTTPS ditolak. URL Google Drive dikenali berdasarkan hostname dan file ID, bukan pencocokan string sembarang.
5. Transaksi DB membuat RepositoryActivityLog menggunakan nama/prodi dari Student, tujuan, bagian, jenis akses, waktu, metadata browser/IP dan menambah counter: READ meningkatkan viewCount, DOWNLOAD meningkatkan downloadCount. Bila transaksi gagal, URL tidak dikembalikan.
6. Klien membuka tautan setelah berhasil; error/loading ditampilkan, popup dibuka dari klik pengguna atau tersedia link lanjut bila browser memblokirnya. Baca membuka Drive preview; Unduh menggunakan tautan download Drive jika dikenali, tanpa menjanjikan download pada provider non-Drive.
7. Endpoint tracking lama dibatasi ke pencarian SEARCH; tidak boleh membuat log READ/DOWNLOAD atau counter tanpa verifikasi. Identitas localStorage tidak digunakan sebagai verifikasi.

## Penyimpanan dan admin
Tambah field nullable purpose, accessType, section pada RepositoryActivityLog agar log lama tetap valid. Gunakan API statistik admin dan tabel aktivitas yang ada, tambahkan kolom tujuan, bagian dan jenis akses. Default pagination tetap server-side; data hanya staf terautentikasi. Tidak tambah model identitas, password/OTP atau dependency baru.

## Cache
API pencarian menggunakan namespace cache baru agar respons Redis lama yang berisi URL tidak dikembalikan. Respons URL akses memakai Cache-Control: no-store. URL tetap tidak disimpan dalam localStorage.

## Aksesibilitas dan tampilan
Dialog fokus awal pada NIM, focus trap, Escape/batal menutup, fokus dikembalikan ke pemicu. Label terlihat, error role=alert, tombol dinonaktifkan selama request, responsive mobile. Animasi CSS opacity/transform 180–200ms dengan prefers-reduced-motion; warna navy/gold mengikuti situs.

## Batas keamanan
NIM-only adalah pengecekan data master, bukan bukti kepemilikan identitas. NIM orang lain yang valid bisa dipakai. Google Drive yang sudah memiliki izin publik tidak terkunci oleh aplikasi; setelah URL diterima bisa dibagikan ulang. READ adalah pilihan preview, bukan pencegahan unduh atau jaminan dokumen benar-benar dibaca. Log mengukur akses yang diberikan, bukan download selesai. Tidak mengubah izin file Google Drive atau menambahkan proxy DRM.

## Pemeriksaan
Tes input kosong/terlalu panjang, enum tidak valid, NIM tidak ditemukan, URL berbahaya, dokumen tidak tersedia, mapping Drive preview/download, log identitas master dan transaksi counter. Tes hasil pencarian serta cache tidak memuat URL. Uji READ/DOWNLOAD tercatat di admin, dialog keyboard, fallback popup; build Next.js harus lulus. Schema deploy dengan npx prisma db push tanpa accept-data-loss; tidak menghapus DB, log atau arsip.
