# SAC FEB UB Auth & Access Rework Implementation Plan

> **For agentic workers:** Use executing-plans to implement this plan task-by-task.

**Goal:** Bangun system autentikasi bersih — staf login email+password, mahasiswa cek serah simpan via NIM, admin URL tersembunyi dari publik, hapus fitur kartu anggota/register yang tidak dipakai.

**Architecture:** Session berbasis cookie HttpOnly signed dengan `crypto` (no external auth library). Tabel `Staff` di Prisma. Middleware guard `/sac-staff/**`. Mahasiswa tidak punya akun — hanya form cek NIM di `/chat-sac`.

**Tech Stack:** Next.js 16 App Router, Prisma 6 (MySQL), bcryptjs, node:crypto (sudah ada), Tailwind CSS 4

**Spec:** Percakapan user di atas (login mahasiswa=NIM cek status, staf=email+password, admin URL tersembunyi publik, hapus kartu anggota)

## Global Constraints
- Tidak menambah dependency baru — semua sudah tersedia (bcryptjs, prisma, next)
- Admin route: `/sac-staff/login` dan `/sac-staff/**` — tidak ada link di navbar/footer publik
- Route lama `/admin/login` dan `/admin` tetap ada tapi di-redirect ke `/sac-staff/login`
- Email staf wajib domain `@ub.ac.id` atau `@student.ub.ac.id`
- Session cookie: `sac_session`, HttpOnly, Secure (prod), SameSite=lax, maxAge 8 jam
- Hapus `Member` model dari schema (tabel kosong, fitur tidak dipakai)
- Navbar: hapus tombol "Daftar Anggota", `/register` dinonaktifkan (redirect `/`)
- Mahasiswa: form NIM di `/chat-sac` sudah ada — hanya perlu verifikasi tanpa session

---

## Task 1: Prisma — Tambah tabel Staff, hapus Member

**Files:**
- Modify: `prisma/schema.prisma`
- Run: `npx prisma db push`

**Interfaces:**
- Produces: `Staff { id, email, name, role, passwordHash, active, createdAt }`

- [ ] **Step 1: Edit schema.prisma** — hapus model `Member`, tambah model `Staff`

```prisma
// HAPUS seluruh model Member {...}

model Staff {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String
  role         String   @default("PETUGAS") // SUPERADMIN | ADMIN | PETUGAS
  passwordHash String
  active       Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([email])
}
```

- [ ] **Step 2: Push schema ke DB**
```bash
npx prisma db push
```
Expected: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 3: Seed akun staf awal**

Edit `prisma/seed.ts` — tambah di fungsi `main()`:

```typescript
import bcrypt from 'bcryptjs';

const passwordHash = await bcrypt.hash('sacfeb2026!', 10);
await prisma.staff.upsert({
  where: { email: 'admin.sac@ub.ac.id' },
  update: {},
  create: {
    email: 'admin.sac@ub.ac.id',
    name: 'Administrator SAC',
    role: 'SUPERADMIN',
    passwordHash,
    active: true,
  },
});
console.log('Staf awal berhasil dibuat: admin.sac@ub.ac.id / sacfeb2026!');
```

- [ ] **Step 4: Jalankan seed**
```bash
npx tsx prisma/seed.ts
```

- [ ] **Step 5: Commit**
```bash
git add prisma/schema.prisma prisma/seed.ts
git commit -m "feat: add Staff model, remove unused Member model"
```

---

## Task 2: Session utility — sign & verify cookie

**Files:**
- Create: `lib/session.ts`
- Test: `tests/session.test.ts`

**Interfaces:**
- Produces:
  - `createSession(staffId, role): string` — returns signed token string
  - `verifySession(token: string): { staffId: string; role: string } | null`

- [ ] **Step 1: Tulis test dulu**

```typescript
// tests/session.test.ts
import assert from 'node:assert/strict';
process.env.SESSION_SECRET = 'test-secret-32-chars-minimum-ok!';
const { createSession, verifySession } = await import('../lib/session.ts');

const token = createSession('id-123', 'ADMIN');
assert.ok(token.length > 20, 'token harus ada isinya');

const payload = verifySession(token);
assert.deepEqual(payload, { staffId: 'id-123', role: 'ADMIN' });

assert.equal(verifySession('invalid-token'), null);
assert.equal(verifySession(''), null);

console.log('session: OK');
```

- [ ] **Step 2: Jalankan test (harus FAIL)**
```bash
npx tsx tests/session.test.ts
```
Expected: `Cannot find module '../lib/session.ts'`

- [ ] **Step 3: Implementasi `lib/session.ts`**

```typescript
import { createHmac, timingSafeEqual } from 'node:crypto';

const SECRET = process.env.SESSION_SECRET ?? 'change-me-in-production-min-32ch';
const SEP = '.';

export function createSession(staffId: string, role: string): string {
  const payload = Buffer.from(JSON.stringify({ staffId, role, ts: Date.now() })).toString('base64url');
  const sig = createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}${SEP}${sig}`;
}

export function verifySession(token: string): { staffId: string; role: string } | null {
  if (!token) return null;
  const idx = token.lastIndexOf(SEP);
  if (idx < 0) return null;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = createHmac('sha256', SECRET).update(payload).digest('base64url');
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
  return { staffId: data.staffId, role: data.role };
}
```

- [ ] **Step 4: Jalankan test lagi (harus PASS)**
```bash
npx tsx tests/session.test.ts
```
Expected: `session: OK`

- [ ] **Step 5: Tambah `SESSION_SECRET` ke `.env`**
```bash
echo 'SESSION_SECRET="'$(openssl rand -hex 32)'"' >> .env
```

- [ ] **Step 6: Commit**
```bash
git add lib/session.ts tests/session.test.ts .env
git commit -m "feat: add session sign/verify utility"
```

---

## Task 3: API login staf — `/api/sac-staff/login`

**Files:**
- Create: `app/api/sac-staff/login/route.ts`
- Retire: `app/api/admin/login/route.ts` — ganti isinya jadi redirect ke route baru

**Interfaces:**
- Consumes: `Staff` model dari Prisma, `createSession` dari `lib/session.ts`
- Produces: POST `/api/sac-staff/login` → set cookie `sac_session`, return `{ success, user: { name, email, role } }`

- [ ] **Step 1: Buat `app/api/sac-staff/login/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json().catch(() => ({}));

  if (!email || !password) {
    return NextResponse.json({ success: false, error: 'Email dan password wajib diisi.' }, { status: 400 });
  }

  const clean = String(email).trim().toLowerCase();
  if (!clean.endsWith('@ub.ac.id') && !clean.endsWith('@student.ub.ac.id')) {
    return NextResponse.json({ success: false, error: 'Gunakan email resmi UB (@ub.ac.id).' }, { status: 403 });
  }

  const staff = await prisma.staff.findUnique({ where: { email: clean } });
  if (!staff || !staff.active) {
    return NextResponse.json({ success: false, error: 'Akun tidak ditemukan atau nonaktif.' }, { status: 401 });
  }

  const ok = await bcrypt.compare(String(password), staff.passwordHash);
  if (!ok) {
    return NextResponse.json({ success: false, error: 'Password salah.' }, { status: 401 });
  }

  const token = createSession(staff.id, staff.role);
  const res = NextResponse.json({
    success: true,
    user: { name: staff.name, email: staff.email, role: staff.role },
  });

  res.cookies.set('sac_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 jam
    secure: process.env.NODE_ENV === 'production',
  });

  return res;
}
```

- [ ] **Step 2: Retire `/api/admin/login/route.ts`**

Ganti seluruh isi file dengan:

```typescript
import { NextResponse } from 'next/server';
export async function POST() {
  return NextResponse.redirect(new URL('/sac-staff/login', process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'));
}
```

- [ ] **Step 3: Commit**
```bash
git add app/api/sac-staff/login/route.ts app/api/admin/login/route.ts
git commit -m "feat: staff login API with bcrypt + signed session cookie"
```

---

## Task 4: API logout staf — `/api/sac-staff/logout`

**Files:**
- Create: `app/api/sac-staff/logout/route.ts`

- [ ] **Step 1: Buat file**

```typescript
import { NextResponse } from 'next/server';
export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set('sac_session', '', { maxAge: 0, path: '/' });
  return res;
}
```

- [ ] **Step 2: Commit**
```bash
git add app/api/sac-staff/logout/route.ts
git commit -m "feat: staff logout API clears session cookie"
```

---

## Task 5: API me — `/api/sac-staff/me`

**Files:**
- Create: `app/api/sac-staff/me/route.ts`

**Interfaces:**
- Consumes: `verifySession` dari `lib/session.ts`, cookie `sac_session`
- Produces: GET → `{ success, staff: { name, email, role } }` atau 401

- [ ] **Step 1: Buat file**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sac_session')?.value ?? '';
  const session = verifySession(token);
  if (!session) return NextResponse.json({ success: false }, { status: 401 });

  const staff = await prisma.staff.findUnique({
    where: { id: session.staffId },
    select: { name: true, email: true, role: true, active: true },
  });

  if (!staff || !staff.active) return NextResponse.json({ success: false }, { status: 401 });

  return NextResponse.json({ success: true, staff });
}
```

- [ ] **Step 2: Commit**
```bash
git add app/api/sac-staff/me/route.ts
git commit -m "feat: /api/sac-staff/me returns current staff session"
```

---

## Task 6: Middleware — guard `/sac-staff/**` dan semua `/api/admin/**` `/api/sac-staff/**`

**Files:**
- Modify: `middleware.ts`

**Interfaces:**
- Consumes: `verifySession` dari `lib/session.ts`, cookie `sac_session`

- [ ] **Step 1: Edit `middleware.ts`** — tambah guard `sac-staff` ke blok yang sudah ada

Tambah blok ini SEBELUM return `NextResponse.next()`:

```typescript
// Guard: /sac-staff/* dan API admin
if (
  pathname.startsWith('/sac-staff') ||
  pathname.startsWith('/api/sac-staff') ||
  pathname.startsWith('/api/admin')
) {
  const { verifySession } = await import('@/lib/session');
  const token = request.cookies.get('sac_session')?.value ?? '';
  const session = verifySession(token);

  // Biarkan halaman login lewat tanpa session
  if (pathname === '/sac-staff/login' || pathname === '/api/sac-staff/login') {
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/sac-staff/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}
```

Update `config.matcher`:
```typescript
export const config = {
  matcher: [
    '/presensi/:path*',
    '/api/presensi/:path*',
    '/sac-staff/:path*',
    '/api/sac-staff/:path*',
    '/api/admin/:path*',
  ],
};
```

- [ ] **Step 2: Redirect `/admin` → `/sac-staff`**

Buat `app/admin/page.tsx` tetap ada tapi tambah redirect di top:

Buat file `app/admin/redirect.ts` tidak perlu — cukup buat:

```typescript
// app/api/admin/redirect/route.ts  — TIDAK PERLU, pakai next.config.ts redirects
```

Lebih simpel: tambah di `next.config.ts`:

```typescript
async redirects() {
  return [
    { source: '/admin', destination: '/sac-staff', permanent: false },
    { source: '/admin/login', destination: '/sac-staff/login', permanent: false },
  ];
},
```

- [ ] **Step 3: Commit**
```bash
git add middleware.ts next.config.ts
git commit -m "feat: middleware guards /sac-staff and /api/admin routes"
```

---

## Task 7: Halaman Login Staf — `/sac-staff/login`

**Files:**
- Create: `app/sac-staff/login/page.tsx`
- Create: `app/sac-staff/layout.tsx`

**Interfaces:**
- Consumes: POST `/api/sac-staff/login`
- Produces: Redirect ke `/sac-staff` setelah berhasil

- [ ] **Step 1: Buat `app/sac-staff/layout.tsx`**

```typescript
export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-100 font-sans antialiased">{children}</div>;
}
```

- [ ] **Step 2: Buat `app/sac-staff/login/page.tsx`**

```tsx
'use client';
import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function StaffLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') ?? '/sac-staff';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/sac-staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Login gagal.');
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0B2546]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo-feb-black.png" alt="FEB UB" width={120} height={40} className="h-10 w-auto mb-4" />
          <h1 className="text-xl font-extrabold text-[#0B2546]">Portal Staf SAC</h1>
          <p className="text-sm text-slate-500 mt-1">Masuk dengan akun email UB Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email UB</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="nama@ub.ac.id"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2546]/30"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2546]/30"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0B2546] text-white font-bold rounded-xl py-3 text-sm hover:bg-slate-900 transition disabled:opacity-50"
          >
            {loading ? 'Memverifikasi...' : 'Masuk'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Halaman ini hanya untuk staf operasional SAC FEB UB.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add app/sac-staff/
git commit -m "feat: staff login page /sac-staff/login"
```

---

## Task 8: Dashboard Staf — `/sac-staff` (pindahkan dari `/admin`)

**Files:**
- Create: `app/sac-staff/page.tsx` — wrapper yang load konten dari `/admin/page.tsx` yang sudah ada, lalu di refactor bertahap

Untuk sekarang yang paling simpel: copy isi `/admin/page.tsx` ke `/sac-staff/page.tsx`, update path API yang dipakai.

- [ ] **Step 1: Buat `app/sac-staff/page.tsx`** sebagai thin wrapper redirect sementara

```tsx
// app/sac-staff/page.tsx
// ponytail: sementara render konten admin lama. Refactor full dashboard di sprint berikutnya.
export { default } from '@/app/admin/page';
```

Ini memakai re-export supaya tidak duplikat kode. Dashboard lama tetap jalan di URL baru.

- [ ] **Step 2: Tambah logout button ke admin page**

Di `app/admin/page.tsx` bagian header/top-bar, tambah tombol logout:

```tsx
<button
  onClick={async () => {
    await fetch('/api/sac-staff/logout', { method: 'POST' });
    window.location.href = '/sac-staff/login';
  }}
  className="text-xs text-red-600 hover:underline"
>
  Keluar
</button>
```

- [ ] **Step 3: Commit**
```bash
git add app/sac-staff/page.tsx app/admin/page.tsx
git commit -m "feat: /sac-staff dashboard, logout button"
```

---

## Task 9: Bersihkan navbar & nonaktifkan /register

**Files:**
- Modify: `components/layout/Navbar.tsx`
- Modify: `app/register/page.tsx` — redirect ke `/`
- Modify: `next.config.ts` — tambah redirect `/register` → `/`

- [ ] **Step 1: Hapus tombol "Daftar Anggota" dari Navbar**

Di `components/layout/Navbar.tsx`, hapus dua `<Link href="/register" ...>` (satu desktop, satu mobile).

- [ ] **Step 2: Tambah redirect `/register` di `next.config.ts`**

```typescript
{ source: '/register', destination: '/', permanent: false },
```

- [ ] **Step 3: Commit**
```bash
git add components/layout/Navbar.tsx next.config.ts
git commit -m "feat: remove register button from navbar, redirect /register to /"
```

---

## Task 10: Build & verify

- [ ] **Step 1: Jalankan semua tests**
```bash
npx tsx tests/session.test.ts
npx tsx tests/katalog-import.test.ts
```

- [ ] **Step 2: Build production**
```bash
npm run build
```
Expected: `✓ Compiled successfully`

- [ ] **Step 3: Smoke test manual**
1. Buka `http://localhost:3000/sac-staff` → harus redirect ke `/sac-staff/login`
2. Login dengan `admin.sac@ub.ac.id` / `sacfeb2026!` → harus masuk dashboard
3. Buka `http://localhost:3000/admin` → harus redirect ke `/sac-staff`
4. Buka `http://localhost:3000/register` → harus redirect ke `/`
5. Pastikan tidak ada link admin/register di navbar publik
6. Buka `/chat-sac` → form NIM masih bisa dipakai tanpa login

- [ ] **Step 4: Commit final**
```bash
git add -A
git commit -m "feat: auth rework complete — staff email/pw login, NIM check public, admin hidden"
```
