# Google Sheets Sync & Multi-Dataset Dashboard Integration Design

## Overview
Integrate 4 official Google Sheets into SAC FEB UB database with idempotent sync scripts, backoffice admin panels with server-side pagination/search, and summary widgets.

## Datasets & Sheets
1. **Repository / Skripsi & Tesis / Pengganti**:
   - URL: `https://docs.google.com/spreadsheets/d/1EyvdG4x1rV3pyytt4smIHs6Mpu3nhSGnfiB_vg9vtAg/export?format=csv&gid=1485930570`
   - Target Model: `RepositoryDocument`
   - Columns: Timestamp, Jenis, NIM, Nama, Prodi, WhatsApp, Email, Pembimbing, Ko-Promotor, Penguji, Judul, File Awal, File Isi, File Akhir, Pernyataan, Nomor Berkas.
2. **Keanggotaan**:
   - URL: `https://docs.google.com/spreadsheets/d/1PHZ9uBjJ61Sf1Pt6kCUOG0uGVOEM2bHzJEkduxXv-Mo/export?format=csv`
   - Target Model: `MembershipRecord`
   - Columns: Tanggal, Jam, Admin, Jenis Anggota, NIM, Nama, Prodi, WhatsApp, Email, Alamat Surat, Identitas, Foto Identitas, Foto Selfie, Status, Tanggal Aktif, Berlaku Sampai.
3. **Bukti Serah Simpan**:
   - URL: `https://docs.google.com/spreadsheets/d/1MtkNXJn5Mcac9YzxeZnrkjmzpsrBD0WhsUeHpGd5T3c/export?format=csv`
   - Target Model: `DepositRecord`
   - Columns: Tanggal, Jenis, Nama, NIM, Prodi, WhatsApp, Email, Judul, Bagian Awal, Bagian Isi, Bagian Akhir, Nomor Bukti, Perbaikan, Tanggal Cek, Jam Cek, Hardcopy, Tgl Hardcopy, Bukti Hardcopy, Tanggal Validasi, Plagiasi, Kirim Email, Kirim Bukti, Unduh Bukti, Drive.
4. **Check-In / Buku Tamu**:
   - URL: `https://docs.google.com/spreadsheets/d/1dksQK8-m9XiByAbmYNUBGTMbcS7-ed78OMedWqF6lXU/export?format=csv`
   - Target Model: `VisitorLog` (or updated fields)
   - Columns: Tanggal, Check-In, Admin, NIM, Nama, Program Studi, Loker Tas, Loker Sepatu, Check-Out.

## Architecture
- **Prisma Schema**: Add `MembershipRecord`, `DepositRecord`, and enrich `VisitorLog` and `RepositoryDocument`. Imported membership history remains separate from `Member` accounts and `Student` master records; no passwords imported.
- Preserve all meaningful source columns in admin-only source details; exclude passwords and internal BDA columns. Validate document URLs as HTTP/HTTPS before rendering links.
- Sync identity: repository uses NIM + original submission timestamp, with stable source row keys where valid; membership uses NIM + registration timestamp; deposits use proof number, falling back to NIM + submission timestamp + title; visitors use date + NIM + check-in time. Persist a SHA-256 source key under a unique constraint. Skip invalid rows with reason counts; reject missing required headers before writing.
- Preserve local records, repository activity logs, document IDs and counters. Match existing repository records by NIM/title before assigning source keys; ambiguous matches are reported rather than deleted.
- Interpret spreadsheet dates in Asia/Jakarta. Historical visitor rows without checkout are not automatically treated as current active sessions.
- Import commands support dry-run; report inserted, updated, unchanged, invalid and duplicate counts. Sync never deletes rows absent from a sheet; failed fetches leave stored data intact.
- Admin sync runs through the same server-side service as commands, protected by staff authentication, same-origin checks and a per-dataset database lock. Concurrent runs are rejected, failures shown explicitly; no background job subsystem added.
- **Scripts**:
  - `scripts/import-repository-sheets.ts` (updated)
  - `scripts/import-membership-sheets.ts`
  - `scripts/import-deposits-sheets.ts`
  - `scripts/import-visitors-sheets.ts`
  - `scripts/sync-all-sheets.ts`
- **APIs**:
  - `/api/backoffice/repository` (paginated & filtered)
  - `/api/backoffice/memberships` (paginated & filtered)
  - `/api/backoffice/deposits` (paginated & filtered)
  - `/api/backoffice/visitors` (paginated & filtered)
  - `/api/backoffice/sync` (authenticated sync per dataset; same sync service as CLI)
- **Commands**: `import:repository`, `import:membership`, `import:deposits`, `import:visitors`, `sync:all`. Re-running updates source-owned fields without duplicating records. Schema deployment uses `npx prisma db push`, not migrations.
- **UI & Dashboard**:
  - Update `app/backoffice/page.tsx` with high-level KPI cards for all 4 datasets.
  - Add navigation tabs / sub-views: Overview, Buku Tamu, Bukti Serah Simpan, Keanggotaan, Repositori, Buku, Staf, Laporan.
  - Search, filters, status labels and server-side pagination (default 25, maximum 100 rows). Detail views expose remaining source columns only to staff.
  - Retain existing navy/gold visual identity, readable text, keyboard focus, mobile layouts, labelled controls, loading/error/empty states. Summary counts come from the database, not page length.

## Acceptance checks
- Import twice produces no duplicate records; changed source fields update existing records.
- Parser tests cover new headers, blank rows, duplicate identities, Jakarta timestamps and missing checkout.
- API checks reject unauthenticated reads/sync and cap page size.
- Existing repository counters and activity references survive sync.
- Run tests and production build before claiming completion; actual database import requires a reachable configured database and reports observed counts.
