# Google Sheets Sync & Multi-Dataset Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Import, sync, and present all four official Google Sheets (Keanggotaan, Bukti Serah Simpan, Buku Tamu, Repositori baru) into SAC FEB UB with server-side paginated backoffice management panels and idempotent sync commands.

**Architecture:** Extend Prisma schema with dedicated models, implement fast chunked CSV streaming/parsers, create idempotent sync scripts, build REST endpoints with pagination/filtering, and build polished responsive admin views in `/backoffice`.

**Tech Stack:** Next.js App Router, Prisma ORM (MySQL), TypeScript, Tailwind CSS, XLSX / Fast CSV streaming.

**Spec:** `docs/superpowers/specs/2026-10-07-sheets-integration-design.md`

## Global Constraints
- Do not expose sensitive personal documents (selfie, ID, proof) on public unauthenticated endpoints.
- All dashboard tables must be server-side paginated (no client loading of 50k+ rows).
- Scripts must be runnable via `npm run <command>` without interactive prompts.
- Database syncs must be idempotent using distinct unique keys / hashes.

---

### Task 1: Update Prisma Schema & Generate Client
- [ ] Add `MembershipRecord`, `VerifiedDepositRecord`, and update `VisitorLog` and `RepositoryDocument` with external sheet identifiers.
- [ ] Run `npx prisma db push` and `npx prisma generate`.

### Task 2: Build Parsers & Sync Logic for All 4 Sheets
- [ ] Create `lib/sheets-parsers.ts` with testable row mappers and date/time parsers.
- [ ] Create test `tests/sheets-parsers.test.ts` to verify row transformations and edge cases.

### Task 3: Implement Import & Sync Scripts
- [ ] Update `scripts/import-repository-sheets.ts` with new sheet URL and fields.
- [ ] Create `scripts/import-membership-sheets.ts`.
- [ ] Create `scripts/import-deposits-sheets.ts`.
- [ ] Create `scripts/import-visitors-sheets.ts`.
- [ ] Create `scripts/sync-all-sheets.ts` to sync everything in one command.
- [ ] Add scripts to `package.json`.

### Task 4: Backoffice APIs with Server-Side Pagination & Filtering
- [ ] Add `/api/backoffice/memberships/route.ts` with pagination, search, status filter.
- [ ] Add `/api/backoffice/verified-deposits/route.ts` with pagination, search, status filter.
- [ ] Add `/api/backoffice/visitors/route.ts` with pagination, search, date filter.
- [ ] Add `/api/backoffice/sync-sheets/route.ts` allowing staff to trigger sync per sheet from UI.

### Task 5: Upgrade Backoffice Dashboard & Management Panels
- [ ] Create UI panels for Keanggotaan, Bukti Serah Simpan, and Buku Tamu with search, badge styling, modal detail preview, and pagination.
- [ ] Update `/backoffice` dashboard KPI summary cards to count all datasets live.
- [ ] Add sync buttons directly in the backoffice headers.

### Task 6: Verification & Test
- [ ] Run parser unit tests.
- [ ] Run build test `npm run build`.
