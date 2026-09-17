# 📊 Laporan Gap Analysis: Web Legacy vs Next.js SAC FEB UB

**Dokumen Referensi Audit:**
- **Web Sumber (Legacy):** `https://sites.google.com/view/sac-feb-ub`
- **Target Aplikasi (Next.js Modern):** Codebase lokal SAC FEB UB (`app/`, `components/`, `lib/`, `prisma/`)
- **Tanggal Audit:** 17 September 2026
- **Auditor:** Senior Software Architect & QA Lead Orchestrator

---

## 1. Matriks Perbandingan Halaman & Fitur

| No | Menu / Halaman Legacy | URL Legacy / Tipe Embed | Status di Next.js | Urgensi | Catatan Perbedaan & Kebutuhan |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | **Beranda / Portal Utama** | `/view/sac-feb-ub/Home` | **Ada (Dirombak Modern)** | Low | Beranda Next.js (`app/page.tsx`) memiliki UI jauh lebih baik (Tailwind CSS, material icons, hero, catalog showcase, FAQ accordion). Namun data kontak masih dummy (`081234567890`) dan lokasi fisik perlu sinkronisasi. |
| 2 | **Katalog Buku Fisik (OPAC)** | `/view/sac-feb-ub/Katalog`<br>*(Embed Google Apps Script)* | **BELUM ADA (Missing)** | **HIGH** | Di Next.js hanya ada katalog repositori karya ilmiah (`/repository`). Katalog penelusuran buku fisik (buku teks, DDC, nomor rak, warna label, ISBN) **sama sekali belum ada rutenya**. |
| 3 | **Repository FEB** | `/view/sac-feb-ub/Repository`<br>*(Embed Google Apps Script)* | **Ada (Dioptimasi)** | Low | Di Next.js diimplementasikan di `/repository` dengan SQLite/Prisma + Redis caching, pencarian debounce, filter prodi, dan link Google Drive per bagian (Awal, Isi, Akhir). |
| 4 | **Repository Induk UB** | `/view/sac-feb-ub/Repository-UB`<br>*(Proxy / Redirect)* | **Parsial** | Medium | Legacy mengarahkan penelusuran ke EPrints UB (`repository.ub.ac.id`). Di Next.js hanya tercantum sebagai link biasa di footer/e-resources tanpa form filter khusus. |
| 5 | **Akses E-Resources** | `/view/sac-feb-ub/eResources`<br>*(Embed GAS + EduVPN Guide)* | **Parsial** | Medium | Etalase 6 database jurnal sudah ada di Beranda Next.js dengan telemetri `POST /api/log-resource`. Namun **Panduan EduVPN UB** (PDF BITS UB untuk akses remote luar kampus) belum disematkan. |
| 6 | **Serah Simpan Karya Ilmiah** | `/view/sac-feb-ub/Serah-Simpan`<br>*(Embed Google Apps Script)* | **Ada (Sangat Lengkap)** | Low | Rute `/serah-simpan` (SAC-ONE) 4 langkah dengan validasi NIM, upload naskah 3 bagian PDF, dan cetak tanda terima. Namun berkas fisik upload di admin masih 404 (`/uploads/...`) dan klausul dropbox hardcopy S2/S3 belum ditegaskan. |
| 7 | **Layanan Mandiri (Check-In & Loker)** | `sites.google.com/view/layananmandirisac/Check-In`<br>*(Embed GAS)* | **Parsial** | **HIGH** | Di Next.js diimplementasikan di `/presensi` (Kiosk NIM check-in/out). Namun alur **Manajemen Loker (Loker Tas & Loker Sepatu/Sandal)** serta **Survei Rating Kepuasan (Bintang 1–5)** saat check-out **hilang**. |
| 8 | **Asisten Virtual (ChatSAC)** | `/view/sac-feb-ub/ChatSAC`<br>*(Embed GAS + WA direct)* | **Parsial** | Medium | Di Next.js berwujud floating widget bot di Beranda. Halaman dedicated `/chat-sac` untuk cek mandiri status tanda terima serah simpan via NIM dan query katalog buku belum ada. |
| 9 | **LaporSAC (Pusat Aduan)** | Embed Google Apps Script Form | **BELUM ADA (Missing)** | Medium | Formulir aduan, keluhan fasilitas, dan kritik saran mahasiswa belum ada wadahnya di Next.js (hanya ada link WA). |
| 10 | **Event & Gallery (Edukasi)** | `/view/sac-feb-ub/Event-Gallery`<br>*(11 Video YouTube & Embed GAS)* | **BELUM ADA (Missing)** | **HIGH** | Koleksi 11 video pelatihan metodologi penelitian, etika ruang SAC, kajian pustaka, dan literasi digital belum diintegrasikan ke Next.js. |
| 11 | **Statistik Publik** | `/view/sac-feb-ub/Statistik`<br>*(Embed Looker Studio)* | **Parsial** | Low | Di Next.js analitik hanya ada di `/admin` (khusus staf). Halaman transparansi statistik pengunjung/koleksi untuk publik belum tersedia. |
| 12 | **PCA (Printer Corner App)** | `/view/sac-feb-ub/PCA`<br>*(Info App + Play Store link)* | **BELUM ADA (Missing)** | Low | Halaman informasi layanan mandiri cetak/print jarak jauh dan link Play Store (`com.pca.feb.ub`) belum dibuat di Next.js. |
| 13 | **Pendaftaran Anggota (KTA)** | Form pendaftaran manual / GAS | **Ada (Inovasi Baru)** | Low | Di Next.js diimplementasikan di `/register` lengkap dengan 5 langkah registrasi civitas/non-civitas, hashing password, dan kartu digital SAC card. |
| 14 | **Admin Console & Validasi** | Dashboard Spreadsheet manual | **Ada (Inovasi Baru)** | Low | Di Next.js diimplementasikan di `/admin` dengan 5 tab: Overview, Presensi Ruangan, Verifikasi Serah Simpan, Data Anggota, dan Log Repositori. |

---

## 2. Rincian Halaman & Konten yang Hilang

### 2.1 Halaman yang Sepenuhnya Hilang (Missing Routes)
1. **`/katalog` (Katalog Buku Fisik / OPAC SAC):**
   - Web legacy memiliki fitur pencarian koleksi buku fisik yang memuat metadata: Judul, Judul Bahasa Inggris, Pengarang, Penerbit, Tahun Terbit, Edisi, Cetakan, Deskripsi Fisik, Subjek/Topik, Lokasi Rak (`Bookshelf`), Nomor Registrasi, Kode Klasifikasi DDC, dan Warna Label Rak.
   - Codebase Next.js saat ini hanya memiliki `/repository` (khusus Skripsi/Tesis/Disertasi). Koleksi buku fisik belum dapat diakses pengguna secara mandiri.
2. **`/gallery` atau `/event` (Event & Edukasi Literasi):**
   - Web legacy memuat kurasi 11 video pelatihan resmi YouTube:
     - Etika Pengunjung SAC (`3v_AhB3kx_0`)
     - Fasilitas SAC FEB UB (`Av3C5c_CtKg`)
     - Metodologi Kuantitatif Bagian #1 (`f6EaLKLvCd4`) & Bagian #2 (`5oeki8kbTC0`)
     - Pelatihan Kajian Pustaka (`18l5EBW8um8`)
     - Best Practices Research Paper (`XB55d1f4OLg`)
     - Kerangka Konsep Penelitian (`D3O65FdoXU8`)
     - Komponen Dasar Penelitian #1 (`vHttFDdHHd8`) & #2 (`U-4d_wDMp1s`)
     - Inlislite Koleksi Digital (`KyCd93aLfv8`)
     - Pelatihan Tendik (`YDOgvOSmG0g`)
   - Next.js belum memiliki halaman atau rute galeri edukasi video ini.
3. **`/statistik` (Statistik Publik & Transparansi Layanan):**
   - Web legacy menyediakan dashboard publik interaktif (Looker Studio) untuk memantau tren kunjungan mahasiswa per jurusan dan per bulan.
   - Di Next.js, statistik hanya dapat dilihat oleh admin terautentikasi di `/admin`.
4. **`/pca` (Printer Corner App):**
   - Informasi layanan cetak naskah mandiri, konektivitas cloud print, dan link unduh APK Android Play Store (`com.pca.feb.ub`).
5. **`/chat-sac` (Dedicated Page ChatSAC & Self-Service Portal):**
   - Di legacy, ChatSAC adalah halaman tersendiri dengan fungsi praktis: cek status tanda terima serah simpan via NIM, bantuan pencarian koleksi, dan live routing ke WhatsApp Helpdesk.
6. **`/lapor` (LaporSAC - Formulir Aspirasi & Pengaduan Layanan):**
   - Layanan pengaduan fasilitas, kendala akses internet/jurnal, dan saran pengembangan ruang.

---

### 2.2 Konten & Regulasi Operasional yang Belum Masuk (Missing Content)
1. **SOP & Prosedur Loker Mandiri di `/presensi`:**
   - **Loker Tas:** Mahasiswa wajib menyimpan tas, jaket, dan buku luar ke dalam loker. Makanan/minuman berbau dilarang keras masuk area baca.
   - **Loker Sepatu & Sandal Khusus:** Pengunjung wajib melepas sepatu luar dan mengenakan sandal internal SAC yang disediakan di dalam loker sepatu.
   - Peta visual nomor loker aktif.
2. **Survei Kepuasan Pengunjung (Check-Out Flow):**
   - Saat pengunjung melakukan check-out di kios presensi, web legacy memunculkan rating kepuasan instan (1–5 bintang) dan kolom masukan singkat. Di Next.js hanya menampilkan waktu selesai tanpa penampung feedback.
3. **Panduan Resmi Akses E-Resource Luar Kampus (EduVPN UB):**
   - Mahasiswa yang mengakses database ScienceDirect, Emerald, ProQuest dari luar jaringan kampus (bukan Wifi.UB) wajib menggunakan EduVPN. Tautan unduh panduan resmi BITS UB (`https://bits.ub.ac.id/wp-content/uploads/2023/02/Panduan-Setting-EduVPN_2-17-23.pdf`) belum ada di etalase e-resources.
4. **Detail Regulasi Khusus Serah Simpan:**
   - Kewajiban penyerahan 1 eksemplar naskah cetak (*hardcopy*) via Dropbox SAC atau ekspedisi pos khusus mahasiswa jenjang Magister (S2) dan Doktor (S3).
   - Penegasan SLA verifikasi petugas: maksimal 1x24 jam kerja (Senin–Jumat, 08.00–15.00 WIB).
   - Pernyataan klausul lisensi non-eksklusif alih media perpustakaan.
5. **Koreksi Data Kontak & Lokasi Fisik:**
   - Nomor WhatsApp resmi SAC: `+6282315377515` (di Next.js `app/page.tsx:1143` masih tertulis dummy `https://wa.me/6281234567890`).
   - Telepon kantor: `(0341) 555-000 ext. 204` masih berstatus dummy placeholder.
   - Lokasi fisik di legacy tercatat: **Gedung F Pascasarjana Lantai 1**, sedangkan pada beberapa salinan di Next.js tertulis Gedung F Lantai 2.

---

### 2.3 Fitur Interaktif & Embed (Missing Features)
1. **Fitur Cek Mandiri Tanda Terima Serah Simpan:**
   - Pada legacy ChatSAC, mahasiswa dapat mengetikkan NIM untuk mengecek apakah naskah mereka sudah disetujui (APPROVED) dan mengunduh ulang bukti serah simpan tanpa harus login ke dashboard admin.
2. **Katalog Buku Fisik Interaktif (OPAC Engine):**
   - Fitur pencarian buku berbasis judul, pengarang, subjek, serta indikator lokasi rak dan warna label DDC agar mahasiswa mudah mencari letak fisik buku di rak perpustakaan SAC.
3. **Penyimpanan Berkas Upload Serah Simpan (File Storage):**
   - Pada `app/serah-simpan/page.tsx`, berkas PDF Bagian Awal, Isi, dan Akhir hanya ditangkap nama string-nya oleh form klien.
   - Di `app/admin/page.tsx:1439-1469`, link berkas mengarah ke `/uploads/...` yang belum ada folder fisiknya (`public/uploads`) maupun endpoint handler penyimpanan berkasnya. Mengklik berkas ini memicu 404.

---

### 2.4 Inkonsistensi Navigasi & Arsitektur Kode
1. **Redundansi Header & Footer (Belum Terpusat):**
   - Codebase Next.js belum memiliki komponen reusable `components/layout/navbar.tsx` dan `components/layout/footer.tsx`. Struktur markup header dan footer diulang-ulang di `app/page.tsx`, `app/repository/page.tsx`, `app/serah-simpan/page.tsx`, dan `app/register/page.tsx`. Jika ada pembaruan link, harus mengedit banyak file.
2. **Tombol "ComingSoonNotice" Tanpa Kejelasan Roadmap:**
   - Quick chips "Panduan Skripsi FEB" (`app/page.tsx:576`), "Lihat Denah & Status Meja" (`app/page.tsx:819`), "Reservasi Online Pod" (`app/page.tsx:867`), "Cek Antrean PC" (`app/page.tsx:915`), dan "Ekspor Sitasi" RIS/BibTeX (`app/repository/page.tsx:430`) saat ini memunculkan modal `ComingSoonNotice`. Fitur-fitur ini perlu diprioritaskan atau diganti tautan dokumen panduan PDF yang sudah ada.

---

## 3. Rekomendasi Aksi & Rencana Pembuatan File (Action Plan)

Berikut adalah urutan kerja terstruktur untuk menyelesaikan seluruh kesenjangan fitur:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ROADMAP IMPLEMENTASI GAP ANALYSIS                     │
├─────────────────┬───────────────────────────────────────────────────────────┤
│ FASE 1 (Fondasi)│ Koreksi Kontak Resmi, Penyatuan Navbar/Footer Global      │
│ FASE 2 (Katalog)│ Rute Baru: /katalog (Katalog Buku Fisik & OPAC DDC)       │
│ FASE 3 (Presensi│ Integrasi Alur Loker & Rating Kepuasan di /presensi       │
│ FASE 4 (Portal) │ Rute Baru: /gallery, /statistik, /pca, /chat-sac, /lapor  │
│ FASE 5 (Storage)│ Handler Upload Berkas Serah Simpan & Cek Mandiri Tanda    │
└─────────────────┴───────────────────────────────────────────────────────────┘
```

### Langkah 1: Refactoring Fondasi Navigasi & Koreksi Kontak (Prioritas Cepat)
1. Buat komponen navigasi terpusat:
   - `components/layout/Navbar.tsx`: Navbar responsif dengan tautan lengkap (Beranda, Katalog Buku, Repositori FEB, Serah Simpan, Presensi, Edukasi, Bantuan).
   - `components/layout/Footer.tsx`: Footer terpusat dengan jam operasional (Senin–Jumat 08.00–15.00 WIB), alamat resmi Gedung F Pascasarjana Lt. 1, dan link WhatsApp resmi `+6282315377515`.
2. Koreksi link WhatsApp di `app/page.tsx` dari `081234567890` ke `https://wa.me/6282315377515?text=Halo%20Admin%2C%20saya%20mau%20tanya%20tentang%20layanan%20SAC.`

### Langkah 2: Pembuatan Halaman Katalog Buku Fisik (OPAC)
1. Buat data model atau mock data koleksi buku fisik:
   - `lib/katalog-buku-data.ts`: Memuat daftar buku teks dengan field `judul`, `pengarang`, `penerbit`, `tahun`, `isbn`, `ddc`, `rak`, `warnaLabel`, `lokasi`, `status`.
2. Buat rute halaman:
   - `app/katalog/page.tsx`: Halaman katalog pencarian buku fisik, filter kategori DDC, visualisasi kartu buku dengan label warna rak, dan ketersediaan stok pinjam.
3. Buat rute API pendukung:
   - `app/api/katalog/route.ts`: Endpoint pencarian buku dengan debounce.

### Langkah 3: Penyempurnaan Kios Presensi & Layanan Mandiri (`/presensi`)
1. Edit `app/presensi/page.tsx`:
   - Tambahkan modal informasi **SOP Loker & Ganti Sandal** saat berhasil Check-In.
   - Tambahkan modal **Survei Kepuasan (Rating Bintang 1–5 & Catatan)** saat pengunjung melakukan Check-Out.
2. Tambahkan field `satisfactionRating` dan `feedbackNotes` pada tabel `VisitorLog` di `prisma/schema.prisma`.

### Langkah 4: Pembuatan Halaman Konten Pendukung
1. `app/gallery/page.tsx`:
   - Galeri edukasi literasi memuat 11 video YouTube pelatihan metodologi, etika ruang, dan tutorial sitasi dengan pemutar modal interaktif.
2. `app/statistik/page.tsx`:
   - Halaman statistik publik yang menampilkan grafik kunjungan bulanan, prodi teraktif, dan koleksi terpopuler (bisa mengintegrasikan Looker Studio embed atau visualisasi chart lokal).
3. `app/pca/page.tsx`:
   - Landing page Printer Corner App, panduan cetak mandiri, tarif per lembar, dan link download APK Google Play Store.
4. `app/chat-sac/page.tsx`:
   - Halaman khusus Asisten ChatSAC yang dilengkapi formulir **"Cek Status Tanda Terima Serah Simpan"** berbasis input NIM mahasiswa.
5. `app/lapor/page.tsx`:
   - Formulir LaporSAC untuk penampungan kritik, saran, aduan kerusakan fasilitas atau kendala akses e-resources.

### Langkah 5: Penyelesaian Upload Fisik Berkas Serah Simpan
1. Perbaiki endpoint `app/api/serah-simpan/submit/route.ts` untuk menerima `FormData` multipart dan menyimpan berkas PDF secara aman di direktori penyimpanan lokal server (`public/uploads/deposits/`) atau cloud bucket.
2. Hubungkan kembali link tombol di `app/admin/page.tsx` agar admin dapat mengunduh dan memverifikasi dokumen naskah secara nyata tanpa kendala 404.

---
*Laporan ini disusun secara komprehensif untuk menjadi acuan kerja tim pengembang dalam mewujudkan paritas fitur 100% dari web legacy ke aplikasi modern SAC FEB UB.*
