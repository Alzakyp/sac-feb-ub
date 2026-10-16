# TailAdmin SAC Backoffice Design

## Goal
Mengganti total visual `/backoffice` dan `/backoffice/login` dengan struktur dan komponen TailAdmin Next.js, sambil mempertahankan perilaku SAC, logo FEB UB, API, otorisasi, dan data nyata.

## Scope
- Gunakan struktur TailAdmin: sidebar responsif/collapsible, header, content wrapper, page breadcrumb, cards, tables, badges, pagination, form controls, dialog.
- Salin komponen/aset TailAdmin yang dibutuhkan ke aplikasi SAC. Pertahankan pemberitahuan lisensi MIT TailAdmin pada file asal atau `NOTICE`.
- Logo/identitas tetap FEB UB/SAC; jangan gunakan logo TailAdmin.
- Semua tab: overview, Serah Simpan, Lapor, staf, repositori, keanggotaan, bukti, buku tamu, buku menggunakan pola visual yang sama.
- Login mengikuti layout auth TailAdmin, tanpa tombol OAuth palsu.

## Non-goals
- Tidak mengganti aplikasi publik.
- Tidak mengganti API, schema, query, alur CRUD, session, role, atau sinkronisasi Sheet kecuali bug ditemukan saat integrasi.
- Tidak mempertahankan chart/kartu dummy TailAdmin.

## Constraints
- Accessibility: semua ikon tombol berlabel, focus visible, kontrol min 44px.
- Mobile: sidebar overlay/collapse, tabel overflow aman.
- Data sensitif tetap detail-only; hash/password tidak dirender.
- Tidak ada dependency baru jika Tailwind dan Material Symbols saat ini cukup.

## Visual tokens
- Primary SAC: `#0B2546`; operational accent: TailAdmin blue; warning amber; success emerald; error rose.
- Font/spacing/card/table mengikuti template TailAdmin; jangan mencampur rounded/card style lama.
