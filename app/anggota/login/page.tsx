'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function MemberLogin() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError('');
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/members/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identity: data.get('identity'), password: data.get('password') }) });
      const result = await response.json();
      if (!response.ok) { setError(result.error || 'Login gagal.'); return; }
      router.replace('/anggota'); router.refresh();
    } catch { setError('Koneksi bermasalah. Coba lagi.'); } finally { setLoading(false); }
  }
  return <div className="min-h-screen bg-slate-50"><Navbar/><main className="mx-auto max-w-md px-4 pb-20 pt-32"><form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50"><p className="text-xs font-bold uppercase tracking-widest text-amber-700">SAC FEB UB</p><h1 className="mt-2 text-2xl font-extrabold text-[#0B2546]">Masuk Anggota</h1><p className="mt-2 text-sm text-slate-600">Pantau pengajuan Serah Simpan Anda.</p><label className="mt-7 block text-sm font-bold text-slate-700">NIM atau email<input required name="identity" autoComplete="username" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 font-normal focus-visible:outline-2 focus-visible:outline-amber-500" /></label><label className="mt-5 block text-sm font-bold text-slate-700">Password<input required name="password" type="password" autoComplete="current-password" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 font-normal focus-visible:outline-2 focus-visible:outline-amber-500" /></label>{error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}<button disabled={loading} className="mt-6 min-h-12 w-full rounded-xl bg-[#0B2546] font-bold text-white disabled:opacity-50">{loading ? 'Memeriksa…' : 'Masuk'}</button><p className="mt-5 text-center text-sm text-slate-600">Belum menjadi anggota? <a href="/pendaftaran" className="font-bold text-[#0B2546] underline">Daftar</a></p><p className="mt-3 text-center text-xs text-slate-500">Belum punya password atau lupa? <a href="/anggota/reset-password" className="font-bold text-[#0B2546] underline">Buat / Reset Password</a></p></form></main><Footer/></div>;
}
