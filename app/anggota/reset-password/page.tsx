'use client';
import { FormEvent, Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  async function requestReset(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setInfo('');
    try {
      const res = await fetch('/api/members/password-reset/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identity }) });
      const data = await res.json();
      setInfo(data.message || 'Permintaan diproses.');
    } catch { setError('Gagal mengirim permintaan.'); } finally { setBusy(false); }
  }

  async function submitNewPassword(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Konfirmasi password tidak cocok.'); return; }
    setBusy(true); setError(''); setInfo('');
    try {
      const res = await fetch('/api/members/password-reset/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Reset password gagal.');
      setInfo('Password berhasil diperbarui. Silakan login dengan password baru.');
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen bg-slate-50"><Navbar/><main className="mx-auto max-w-md px-4 pb-20 pt-32">
      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-700">SAC FEB UB</p>
        <h1 className="mt-2 text-2xl font-extrabold text-[#0B2546]">{token ? 'Atur Password Baru' : 'Lupa / Buat Password'}</h1>
        <p className="mt-2 text-sm text-slate-600">{token ? 'Masukkan password baru minimal 12 karakter.' : 'Masukkan NIM atau email terdaftar. Tautan akan dikirim ke email akun.'}</p>
        {info && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{info}</p>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
        {!token ? (
          <form onSubmit={requestReset} className="mt-6 space-y-4">
            <label className="block text-sm font-bold text-slate-700">NIM atau Email<input required value={identity} onChange={e => setIdentity(e.target.value)} placeholder="NIM atau email UB" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 font-normal focus-visible:outline-2 focus-visible:outline-amber-500" /></label>
            <button disabled={busy} className="min-h-12 w-full rounded-xl bg-[#0B2546] font-bold text-white disabled:opacity-50">{busy ? 'Memproses…' : 'Kirim Tautan Reset'}</button>
          </form>
        ) : (
          <form onSubmit={submitNewPassword} className="mt-6 space-y-4">
            <label className="block text-sm font-bold text-slate-700">Password Baru<input required type="password" minLength={12} value={password} onChange={e => setPassword(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 font-normal focus-visible:outline-2 focus-visible:outline-amber-500" /></label>
            <label className="block text-sm font-bold text-slate-700">Ulangi Password Baru<input required type="password" minLength={12} value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 font-normal focus-visible:outline-2 focus-visible:outline-amber-500" /></label>
            <button disabled={busy} className="min-h-12 w-full rounded-xl bg-[#0B2546] font-bold text-white disabled:opacity-50">{busy ? 'Menyimpan…' : 'Simpan Password'}</button>
          </form>
        )}
        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-sm"><a href="/anggota/login" className="font-bold text-[#0B2546] underline">Kembali ke Login</a></div>
      </div>
    </main><Footer/></div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-slate-50">Memuat…</main>}><ResetPasswordForm /></Suspense>;
}
