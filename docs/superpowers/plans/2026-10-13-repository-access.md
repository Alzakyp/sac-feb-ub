# Verifikasi Akses Repositori FEB UB Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require verified master-student NIM, purpose, and READ/DOWNLOAD choice before exposing repository files while recording every granted access.

**Architecture:** Remove file URLs from public search responses. Add one authenticated-by-master-data access endpoint that validates input, resolves the document and section server-side, writes the access log and counters transactionally, then returns a safe provider URL. Replace direct client links with an accessible lightweight dialog.

**Tech Stack:** Next.js App Router, TypeScript, Prisma/MySQL, React, Tailwind CSS, Web Crypto/Node standard library only.

**Spec:** `docs/superpowers/specs/2026-10-13-repository-access-design.md`

## Global Constraints
- Pencarian dan metadata repositori tetap terbuka.
- NIM yang tidak ada di `Student` mendapat HTTP 403 dengan pesan tepat: `Anda tidak mendapatkan akses ini.`
- URL berkas tidak dikirim oleh API pencarian dan tidak dipercaya dari client.
- Log menyimpan tujuan, jenis akses, bagian, dokumen, identitas master, waktu, browser/IP.
- API akses memakai `Cache-Control: no-store`; cache search tidak boleh mengandung URL.
- Tidak menambah dependency, password, OTP, atau DRM.
- UI keyboard-accessible, labelled controls, error `role="alert"`, reduced motion.

---

### Task 1: Schema, pure validation, and provider URL helpers

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `lib/repository-access.ts`
- Test: `tests/repository-access.test.ts`

**Interfaces:**
- Produces `validateRepositoryAccess(input)`, `getRepositorySectionUrl(document, section, accessType)`, and `RepositoryAccessInput`.
- `section` is `'AWAL' | 'ISI' | 'AKHIR'`; `accessType` is `'READ' | 'DOWNLOAD'`.

- [ ] Add nullable `purpose`, `accessType`, and `section` fields to `RepositoryActivityLog`; preserve existing rows.
- [ ] Write failing tests for empty/overlong NIM and purpose, invalid enums, missing section URL, HTTPS-only URLs, Drive preview/download mapping.
- [ ] Run `npx tsx tests/repository-access.test.ts`; confirm failure before implementation.
- [ ] Implement minimal validation and URL helper. Google Drive links map READ to preview/open and DOWNLOAD to `uc?export=download&id=...`; reject non-HTTPS links.
- [ ] Run the test; expected PASS.
- [ ] Run `npx prisma format && npx prisma db push && npx prisma generate`.

### Task 2: Hide URLs from search and add access API

**Files:**
- Modify: `app/api/repository/search/route.ts`
- Create: `app/api/repository/access/route.ts`
- Modify: `app/api/repository/track/route.ts`
- Test: `tests/repository-access-route.test.ts`

**Interfaces:**
- `POST /api/repository/access` body: `{ documentId, section, nim, purpose, accessType }`.
- Success: `{ success: true, url, accessType, section }` with `Cache-Control: no-store`.
- Rejected NIM: HTTP 403 `{ success: false, error: 'Anda tidak mendapatkan akses ini.' }`.

- [ ] Write route tests for no URL fields in search select, missing NIM 403, unknown NIM exact 403 message, invalid input 400, missing document/section 404, successful Student-backed log and counter.
- [ ] Run route tests; confirm failure.
- [ ] Remove `bagianAwalUrl`, `bagianIsiUrl`, `bagianAkhirUrl` from public search select; expose only availability booleans if needed.
- [ ] Implement server-side Student lookup, document/section lookup, HTTPS URL validation, Prisma transaction for activity log and view/download counter.
- [ ] Restrict legacy `/api/repository/track` to SEARCH logging; reject READ/DOWNLOAD and any counter mutation.
- [ ] Run route tests and `npx tsc --noEmit`.

### Task 3: Repository access dialog and event flow

**Files:**
- Modify: `app/repository/page.tsx`
- Test: `tests/repository-ui-contract.test.ts`

**Interfaces:**
- `handleFileClick` opens the access dialog instead of opening a URL.
- Dialog submits to `/api/repository/access`, then opens returned URL.

- [ ] Write a contract test ensuring no direct `window.open(url)` occurs before access API success and the dialog contains NIM/purpose/access-type controls.
- [ ] Run test; confirm failure.
- [ ] Replace direct URL buttons with section buttons carrying only document ID and section.
- [ ] Add responsive dialog: visible labels, purpose required, radio READ/DOWNLOAD, NIM required, loading/error states, Escape/cancel, focus restoration, `role="dialog"`, `aria-modal`, `role="alert"`.
- [ ] On success call `window.open(result.url, '_blank', 'noopener,noreferrer')`; retain lightweight toast.
- [ ] Remove localStorage identity from access verification; it may remain unused for legacy SEARCH context only.
- [ ] Use 180–200ms opacity/transform animation with `motion-reduce:transition-none`.
- [ ] Run contract test and `npx tsc --noEmit`.

### Task 4: Admin activity visibility

**Files:**
- Modify: `app/api/admin/repository-stats/route.ts`
- Modify: `app/admin/page.tsx`
- Test: `tests/repository-admin-access.test.ts`

**Interfaces:**
- Admin activity rows expose `purpose`, `accessType`, and `section`.

- [ ] Write failing test for stats query selecting the new fields and UI labels for `READ`/`DOWNLOAD` plus purpose.
- [ ] Run test; confirm failure.
- [ ] Select and render new fields in authenticated admin activity table; keep server pagination.
- [ ] Add filters for access type if existing filter pattern supports it; otherwise display the fields without new abstraction.
- [ ] Run test and build.

### Task 5: Integration verification

**Files:**
- No new production files.

- [ ] Run `npx prisma db push` without data loss flags.
- [ ] Run `npx tsx tests/repository-access.test.ts`, route/UI/admin tests, existing sheet/deposit tests.
- [ ] Run `npx tsc --noEmit`.
- [ ] Run `npm run build`.
- [ ] Verify manually: unknown NIM shows exact denial; valid Student NIM logs READ/DOWNLOAD; public search response contains no Drive URLs; admin shows purpose/type/section.
