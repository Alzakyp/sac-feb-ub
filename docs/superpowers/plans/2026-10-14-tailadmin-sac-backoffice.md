# TailAdmin SAC Backoffice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans task-by-task.

**Goal:** Mengganti seluruh UI backoffice SAC dengan sistem visual TailAdmin tanpa mengubah perilaku bisnis.

**Architecture:** Ekstrak shell dan primitive lokal berlisensi MIT dari template, lalu bungkus konten tab yang sudah ada. Migrasikan visual per komponen agar API/state tetap stabil.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4.

**Spec:** `docs/superpowers/specs/2026-10-14-tailadmin-sac-backoffice-design.md`

## Tasks
1. Tambah `NOTICE`, primitive TailAdmin SAC (`AdminShell`, `PageHeader`, `Card`, `Badge`, `TableShell`, `Modal`).
2. Pindahkan sidebar/header ke `AdminShell`; tambah mobile sidebar.
3. Migrasikan login ke auth layout TailAdmin dengan logo FEB UB.
4. Migrasikan overview cards dan panel ke primitive.
5. Migrasikan semua tabel/filter/pagination/empty/loading states.
6. Migrasikan semua modal/form/action buttons.
7. Audit seluruh tab desktop/mobile; tes kontrak, TypeScript, build.
8. Commit, merge, push setelah verifikasi.
