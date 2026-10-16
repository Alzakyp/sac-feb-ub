# TailAdmin Full Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrasikan seluruh UI backoffice SAC FEB UB ke komponen TailAdmin asli dari `free-nextjs-admin-dashboard-main` dengan memecah panel modular dan mempertahankan fungsionalitas serta identitas SAC FEB UB.

**Architecture:** Ekstrak komponen inti TailAdmin (icons, primitives, layout), pecah `app/admin/page.tsx` menjadi sub-panel modular (`components/admin/panels/`), selaraskan login, hapus sisa styling lama.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-14-tailadmin-sac-backoffice-design.md`

## Global Constraints
- Tetap gunakan identitas SAC FEB UB.
- 9 modul SAC tetap utuh.
- Kontrak API, otorisasi `sac_session`, dan alur bisnis tidak berubah.
- Tidak ada push atau deployment otomatis.

---

### Task 1: Setup Worktree & TailAdmin Core Components
- [ ] Buat worktree `feat/tailadmin-complete`
- [ ] Salin SVG icons TailAdmin yang dibutuhkan ke `components/admin/tailadmin/icons/`
- [ ] Buat UI primitives TailAdmin (`Button`, `Badge`, `Modal`, `Table`, `Input`, `Card`)

### Task 2: Modul Panel Refactor
- [ ] Ekstrak `OverviewPanel.tsx`
- [ ] Ekstrak `DepositsPanel.tsx`
- [ ] Ekstrak `ReportsPanel.tsx`
- [ ] Ekstrak `StaffPanel.tsx`
- [ ] Ekstrak `SheetDataPanel.tsx`
- [ ] Perbarui `CrudPanel.tsx` agar 100% konsisten TailAdmin

### Task 3: Admin Shell & Page Composition
- [ ] Perbarui `AdminShell.tsx` dengan SVG icons TailAdmin asli & layout responsif
- [ ] Komposisikan ulang `app/admin/page.tsx` tanpa duplikasi kode lama

### Task 4: Login Page Migration
- [ ] Selaraskan `app/backoffice/login/page.tsx` dengan pattern SignInForm TailAdmin

### Task 5: Testing & Verification
- [ ] TypeScript check (`npx tsc --noEmit`)
- [ ] Production build (`npm run build`)
- [ ] Playwright visual & functional tests
