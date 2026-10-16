'use client';
import { FormEvent, useState } from 'react';
import Button from '@/components/admin/tailadmin/Button';
import Input from '@/components/admin/tailadmin/InputField';

export default function StaffLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError('');
    const response = await fetch('/api/backoffice/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) { setError(data.error || 'Login gagal.'); setLoading(false); return; }
    window.location.assign('/backoffice');
  }

  return (
    <main className="grid min-h-screen bg-gray-50 p-4 lg:grid-cols-2 lg:p-0 dark:bg-gray-900">
      <section className="flex items-center justify-center py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <img src="/logo-feb-black.png" alt="Logo FEB UB" className="h-11 w-auto" />
            <div><span className="block text-xs font-bold uppercase tracking-[.18em] text-gray-500">Backoffice</span><span className="font-bold text-gray-900 dark:text-white">SAC FEB UB</span></div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Masuk Portal Staf</h1>
          <p className="mt-2 text-sm text-gray-500">Gunakan akun resmi SAC/FEB UB.</p>
          {error && <p role="alert" className="mt-6 rounded-lg border border-error-200 bg-error-50 p-4 text-sm text-error-600">{error}</p>}
          <form onSubmit={submit} className="mt-7 space-y-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email akun
              <div className="relative mt-2"><img src="/tailadmin/icons/mail-line.svg" alt="" className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 opacity-50" /><Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@ub.ac.id" className="pl-12" /></div>
            </label>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password
              <div className="relative mt-2"><img src="/tailadmin/icons/lock.svg" alt="" className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 opacity-50" /><Input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="pl-12" /></div>
            </label>
            <Button disabled={loading} className="w-full">{loading ? 'Memeriksa kredensial…' : 'Masuk ke Dashboard'}</Button>
          </form>
          <p className="mt-8 border-t border-gray-200 pt-6 text-xs text-gray-500">© 2026 Student Advisory Center · Fakultas Ekonomi dan Bisnis · Universitas Brawijaya</p>
        </div>
      </section>
      <section className="relative hidden overflow-hidden bg-gray-900 p-12 text-white lg:flex lg:flex-col lg:justify-center before:absolute before:inset-0 before:bg-[url('/tailadmin/grid-01.svg')] before:bg-center before:bg-no-repeat before:opacity-30">
        <div className="relative z-10 mx-auto max-w-lg"><span className="rounded-full border border-brand-400/30 bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-300">Admin & Petugas Console</span><h2 className="mt-6 text-4xl font-semibold leading-tight">Student Advisory Center<br />FEB Universitas Brawijaya</h2><p className="mt-5 leading-7 text-gray-300">Kelola layanan mahasiswa, validasi karya ilmiah, repositori, keanggotaan, buku, dan data kunjungan melalui satu backoffice.</p></div>
      </section>
    </main>
  );
}
