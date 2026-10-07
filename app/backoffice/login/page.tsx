'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError('');
    const response = await fetch('/api/backoffice/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await response.json();
    if (!response.ok) setError(data.error || 'Login gagal.'); else router.push('/backoffice');
    setLoading(false);
  }

  return <main className="min-h-screen grid place-items-center bg-[#0B2546] p-4"><form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"><p className="text-xs font-bold tracking-[.2em] text-amber-600">SAC FEB UB</p><h1 className="mt-2 text-2xl font-extrabold text-[#0B2546]">Portal Staf</h1><p className="mt-2 text-sm text-slate-500">Khusus petugas SAC. Gunakan email UB.</p><label className="mt-8 block text-sm font-bold">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border p-3 font-normal outline-none focus:ring-2 focus:ring-amber-400" placeholder="nama@ub.ac.id" /></label><label className="mt-4 block text-sm font-bold">Password<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border p-3 font-normal outline-none focus:ring-2 focus:ring-amber-400" /></label>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={loading} className="mt-6 w-full rounded-xl bg-[#0B2546] py-3 font-bold text-white disabled:opacity-50">{loading ? 'Memeriksa…' : 'Masuk'}</button></form></main>;
}
