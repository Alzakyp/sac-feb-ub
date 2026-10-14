# Backoffice CRUD SAC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lengkapi CRUD aman untuk staf, repositori, keanggotaan, dan katalog buku.

**Architecture:** Pertahankan endpoint CRUD yang sudah ada, lengkapi allowlist/validasi, lalu satukan panel UI dengan modal detail/edit/hapus. `Member` dan `MembershipRecord` tetap dibedakan eksplisit lewat `source`.

**Tech Stack:** Next.js Route Handlers, Prisma/MySQL, bcryptjs, React/Tailwind.

**Spec:** `docs/superpowers/specs/2026-10-14-backoffice-crud-design.md`

## Global Constraints

- Semua otorisasi server-side.
- ADMIN tidak mengelola PROGRAMMER.
- Sheet → DB satu arah; tidak menulis balik Sheet.
- Password/hash tidak pernah dikirim ke client.
- Hapus selalu konfirmasi; tidak ada bulk delete.
- Validasi input pada trust boundary.

### Task 1: Audit dan test contract API CRUD

**Files:**
- Test: `tests/backoffice-crud-contract.test.ts`.
- Inspect: `app/api/backoffice/staff/`, `app/api/backoffice/repository/`, `app/api/backoffice/members/`, `app/api/backoffice/books/`.

- [ ] Tulis assertion method GET/POST/PATCH/DELETE, auth, allowlist, no password hash.
- [ ] Jalankan test; catat kegagalan aktual.
- [ ] Perbaiki endpoint minimal tanpa mengubah schema jika memungkinkan.
- [ ] Jalankan test dan TypeScript.

### Task 2: CRUD staf hardening

**Files:**
- Modify: `app/api/backoffice/staff/route.ts`.
- Modify: `app/api/backoffice/staff/[id]/route.ts`.
- Modify: `app/admin/page.tsx` bagian StaffManagementPanel.
- Test: `tests/staff-crud.test.ts`.

- [ ] Uji admin vs programmer untuk target programmer.
- [ ] Uji self-disable/self-delete dan admin terakhir.
- [ ] Tambahkan detail/edit role/status yang diizinkan.
- [ ] Verifikasi.

### Task 3: CRUD repositori

**Files:**
- Modify: `app/api/backoffice/repository/route.ts`.
- Modify: `app/api/backoffice/repository/[id]/route.ts`.
- Modify: `app/admin/page.tsx` bagian RepositoryManagementPanel.
- Test: `tests/repository-crud.test.ts`.

- [ ] Uji URL HTTPS, metadata wajib, source warning, dan delete relation failure.
- [ ] Tambahkan modal detail/edit/create.
- [ ] Verifikasi.

### Task 4: CRUD keanggotaan dua sumber

**Files:**
- Create/modify: endpoint membership dengan parameter `source` eksplisit.
- Modify: `app/admin/page.tsx` SheetDataPanel atau panel anggota.
- Test: `tests/membership-crud.test.ts`.

- [ ] Uji Member vs MembershipRecord tanpa ID ambiguity.
- [ ] Uji password hash tidak pernah response.
- [ ] Tambahkan source/status filter, detail, create, edit, delete, warning Sheet.
- [ ] Verifikasi.

### Task 5: CRUD buku

**Files:**
- Modify: `app/api/backoffice/books/route.ts`.
- Modify: `app/api/backoffice/books/[id]/route.ts`.
- Modify: `app/admin/page.tsx` bagian BookManagementPanel.
- Test: `tests/book-crud.test.ts`.

- [ ] Uji field wajib dan nomor inventaris unik.
- [ ] Tambahkan create/detail/edit/delete UI.
- [ ] Verifikasi.

### Task 6: Full verification

- [ ] Jalankan seluruh test suite.
- [ ] Jalankan `npx tsc --noEmit`.
- [ ] Jalankan `npm run build`.
- [ ] Manual test empat panel sebagai ADMIN dan PROGRAMMER.
- [ ] Pastikan warning Sheet terlihat sebelum perubahan.
