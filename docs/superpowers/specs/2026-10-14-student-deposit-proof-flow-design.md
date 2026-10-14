# Student Deposit Proof Flow Design

## Goal
Mahasiswa dapat mengajukan, memantau, merevisi, lalu mengunduh bukti Serah Simpan. Petugas dapat memeriksa, meminta revisi, menolak, menyetujui, dan menerbitkan bukti. Sheet tetap dapat disinkronkan sebagai arsip.

## Status
`PENDING` → `REVISION_NEEDED` → `RESUBMITTED` → `APPROVED` → `PROOF_ISSUED`.

`REJECTED` terminal. `REVISION_NEEDED` dan `REJECTED` wajib memiliki catatan. `APPROVED` berarti pemeriksaan lolos, belum ada bukti. Hanya aksi petugas **Terbitkan Bukti** yang membuat nomor bukti, menyimpan data bukti, mengubah status menjadi `PROOF_ISSUED`, dan membuka tautan unduh bagi pemilik.

## Data dan tampilan
- Pengajuan baru tetap masuk menu admin Serah Simpan.
- Bukti baru muncul di Bukti Serah Simpan bersama arsip Sheet, diberi sumber `APLIKASI` atau `SHEET`.
- Dashboard mahasiswa hanya membaca pengajuan berdasarkan sesi. Menampilkan status, catatan, nomor bukti, tautan bukti.
- Detail anggota menampilkan jenis anggota, alamat surat, foto identitas, dan foto selfie hanya di modal detail.
- Bukti menampilkan template resmi: nomor bukti, identitas, prodi, waktu unggah, judul, waktu pemeriksaan, similarity, kelengkapan, serta pernyataan.

## Constraints
- Tidak menghapus data atau tombol sinkronisasi Sheet.
- Tidak mencetak password/hash, URL berkas privat, atau foto identitas pada daftar.
- Aksi admin harus berotorisasi server-side.
- Satu pengajuan hanya memiliki satu bukti aktif.
- Bukti yang diterbitkan ulang ditandai digantikan, tidak diam-diam hilang.
