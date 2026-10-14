# Login dan Dashboard Anggota SAC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambahkan login anggota berbasis data keanggotaan, dashboard personal, serta integrasi Serah Simpan berbasis sesi.

**Architecture:** Hash password Sheet ke `MembershipRecord.passwordHash`; autentikasi anggota memakai cookie `sac_member_session` terpisah dari admin. Endpoint dashboard memfilter `ScientificWorkDeposit` dengan NIM sesi; form Serah Simpan mengunci identitas dari server.

**Tech Stack:** Next.js App Router, Prisma/MySQL, bcryptjs, signed cookie session, React/Tailwind.

**Spec:** `docs/superpowers/specs/2026-10-14-member-login-dashboard-design.md`

## Global Constraints

- Password plaintext Sheet tidak pernah disimpan, dilog, atau dikembalikan API.
- Status aktif hanya `ACTIVE` atau `APPROVED`.
- NIM bukan bukti kepemilikan identitas; tidak ada reset password tanpa SMTP.
- Endpoint anggota hanya memakai identitas dari sesi server.
- `npx prisma db push`; tidak memakai `prisma migrate deploy`.
- UI responsif, aksesibel, `prefers-reduced-motion`.

### Task 1: Password keanggotaan

**Files:**
- Modify: `prisma/schema.prisma` — tambah `MembershipRecord.passwordHash String?`.
- Modify: `lib/sheet-mappers.ts` — baca kolom `Password`, hash bcrypt jika tidak kosong.
- Modify: `lib/sync-sheets.ts` — jangan menimpa hash lama dengan nilai kosong.
- Test: `tests/membership-password.test.ts`.

- [ ] Tulis test mapper: password menjadi `$2b$`, kosong menjadi `null`, plaintext tidak muncul.
- [ ] Jalankan `npx tsx tests/membership-password.test.ts`; pastikan gagal sebelum implementasi.
- [ ] Implementasi minimal dengan `bcrypt.hash(password, 10)`.
- [ ] Jalankan test dan `npx prisma generate`.

### Task 2: Sesi dan API login anggota

**Files:**
- Create: `lib/member-session.ts`.
- Create: `app/api/members/login/route.ts`.
- Create: `app/api/members/logout/route.ts`.
- Create: `app/api/members/me/route.ts`.
- Test: `tests/member-login.test.ts`.

- [ ] Tulis test login NIM/email, status aktif, password salah, hash kosong, cookie.
- [ ] Jalankan test untuk memastikan RED.
- [ ] Implementasikan lookup `Member` lalu `MembershipRecord`, bcrypt compare, cookie `sac_member_session` 8 jam.
- [ ] Verifikasi test, TypeScript.

### Task 3: UI login dan dashboard

**Files:**
- Create: `app/anggota/login/page.tsx`.
- Create: `app/anggota/page.tsx`.
- Create: `app/api/members/dashboard/route.ts`.
- Modify: `components/layout/Navbar.tsx` — link login/dashboard anggota.
- Test: `tests/member-dashboard.test.ts`.

- [ ] Tulis test bahwa query dashboard memakai NIM sesi dan bukan parameter URL.
- [ ] Jalankan RED.
- [ ] Buat UI kartu profil, KPI status, daftar pengajuan, empty state, CTA, logout.
- [ ] Verifikasi responsivitas kontrak, TypeScript, test.

### Task 4: Integrasi Serah Simpan

**Files:**
- Modify: `app/serah-simpan/page.tsx` — isi dan kunci NIM/nama/prodi saat login.
- Modify: `app/api/serah-simpan/route.ts` — override identity dari sesi anggota.
- Test: `tests/member-deposit-identity.test.ts`.

- [ ] Tulis test kiriman NIM palsu tidak mengubah NIM sesi.
- [ ] Jalankan RED.
- [ ] Implementasi endpoint profil dan validasi server.
- [ ] Verifikasi test.

### Task 5: Database, full verification

- [ ] Jalankan `npx prisma db push`; berhenti jika meminta data loss.
- [ ] Jalankan seluruh test relevan.
- [ ] Jalankan `npx tsc --noEmit`.
- [ ] Jalankan `npm run build`.
- [ ] Uji manual login NIM/email, akun tanpa password, dashboard, logout, dan Serah Simpan.
