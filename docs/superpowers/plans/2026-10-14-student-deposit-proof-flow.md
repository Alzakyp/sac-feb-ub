# Student Deposit Proof Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyelesaikan perjalanan Serah Simpan dari pengajuan mahasiswa sampai bukti resmi terbit dan dapat diunduh.

**Architecture:** Pertahankan `ScientificWorkDeposit` sebagai sumber pengajuan aplikasi dan `DepositRecord` sebagai arsip Sheet. Tambahkan metadata bukti pada pengajuan aplikasi; endpoint terproteksi menerbitkan dan merender bukti HTML cetak tanpa dependency PDF baru. Gabungkan dua sumber hanya pada tampilan Bukti Serah Simpan dengan label asal eksplisit.

**Tech Stack:** Next.js 16 Route Handlers, React, Prisma/MySQL, Zod, Node test/tsx.

**Spec:** `docs/superpowers/specs/2026-10-14-student-deposit-proof-flow-design.md`

## Global Constraints
- Sinkronisasi Sheet tetap tersedia.
- Otorisasi admin dan kepemilikan mahasiswa wajib server-side.
- Tidak ada password/hash atau URL privat pada daftar/export.
- Tidak ada perubahan Prisma production tanpa `db push`; hentikan jika ada peringatan data loss.

---

### Task 1: Status dan aturan transisi
**Files:** `lib/deposit-workflow.ts`, `lib/deposit-decision.ts`, `tests/deposit-workflow.test.ts`, `tests/deposit-decision.test.ts`
- [ ] Tambah tes gagal untuk `RESUBMITTED`, `PROOF_ISSUED`, catatan wajib, dan larangan terbit sebelum approved.
- [ ] Implementasi aturan minimum.
- [ ] Jalankan tes.

### Task 2: Metadata bukti dan migrasi aman
**Files:** `prisma/schema.prisma`, `tests/deposit-proof-contract.test.ts`
- [ ] Tambah field nomor bukti, tanggal terbit, similarity, kelengkapan, versi/digantikan.
- [ ] Generate Prisma; gunakan `prisma db push` hanya setelah memastikan tanpa data loss.
- [ ] Jalankan tes kontrak dan TypeScript.

### Task 3: Endpoint terbit dan template bukti
**Files:** `app/api/admin/deposits/[id]/issue-proof/route.ts`, `app/api/serah-simpan/proof/[id]/route.ts`, `lib/deposit-proof.ts`, `tests/deposit-proof.test.ts`
- [ ] Tes nomor unik, template escape HTML, ownership/auth.
- [ ] Implementasi transaksi penerbitan.
- [ ] Implementasi halaman bukti siap cetak/Save as PDF.
- [ ] Jalankan tes.

### Task 4: UI admin Serah Simpan dan Bukti
**Files:** `app/admin/page.tsx`, `app/api/backoffice/sheets/[dataset]/route.ts`, `tests/deposit-admin-ui.test.ts`
- [ ] Tambah tombol Terbitkan Bukti hanya saat approved.
- [ ] Gabungkan bukti aplikasi dan arsip pada menu Bukti; label sumber.
- [ ] Tambah detail, filter, export; pertahankan sinkronisasi.
- [ ] Jalankan tes.

### Task 5: UI mahasiswa dan revisi
**Files:** `app/anggota/page.tsx`, `app/api/members/dashboard/route.ts`, endpoint revisi yang diperlukan, `tests/member-deposit-flow.test.ts`
- [ ] Tampilkan semua status, catatan, nomor bukti, tautan bukti.
- [ ] Tambah ajukan ulang untuk status revisi dengan validasi dan ownership.
- [ ] Jalankan tes.

### Task 6: Detail anggota lengkap
**Files:** `components/admin/CrudPanel.tsx`, endpoint member terkait, `tests/member-detail-contract.test.ts`
- [ ] Pastikan jenis anggota, alamat, foto identitas, foto selfie hanya muncul pada modal detail.
- [ ] Gunakan link/gambar aman; jangan tampil pada tabel/export.
- [ ] Jalankan tes.

### Task 7: Audit alur penuh
**Files:** scripts/fixture audit minimum bila diperlukan; tanpa data production destructive.
- [ ] Buat akun/Student/pengajuan berlabel AUDIT secara idempoten.
- [ ] Audit UI login → dashboard → pengajuan → keputusan admin → terbit bukti → unduh.
- [ ] Audit laporan dan statistik.
- [ ] Jalankan seluruh tes, `npx tsc --noEmit`, `npm run build`.
- [ ] Laporkan anomali tersisa dan data audit yang dibuat.
