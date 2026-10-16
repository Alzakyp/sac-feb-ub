'use client';
import { FormEvent, useState } from 'react';

export default function StaffLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError('');
    const response = await fetch('/api/backoffice/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      setError(data.error || 'Login gagal.');
      setLoading(false);
      return;
    }
    // Full navigation guarantees the HttpOnly session cookie is sent to middleware.
    window.location.assign('/backoffice');
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-200 grid lg:grid-cols-2">
        <div className="p-8 sm:p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <img src="/logo-feb-black.png" alt="Logo FEB UB" className="h-10 w-auto" />
              <div>
                <span className="block text-xs font-bold uppercase tracking-widest text-slate-500">Backoffice</span>
                <span className="text-sm font-extrabold text-[#0B2546]">Self Access Centre</span>
              </div>
            </div>
            <div className="mt-8">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Masuk Portal Staf</h1>
              <p className="mt-2 text-sm text-slate-500">Gunakan akun resmi SAC / FEB UB untuk mengelola operasional perpustakaan.</p>
            </div>
            {error && <div className="mt-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm font-semibold text-rose-800">{error}</div>}
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email Akun</label>
                <div className="relative mt-2">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">mail</span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@ub.ac.id"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                <div className="relative mt-2">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">lock</span>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> : null}
                <span>{loading ? 'Memeriksa Kredensial…' : 'Masuk ke Dashboard'}</span>
              </button>
            </form>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>© 2026 SAC FEB Universitas Brawijaya</span>
            <span className="font-mono text-[11px] text-slate-400">Node F2-SRV</span>
          </div>
        </div>
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#0B2546] to-[#0f3460] p-12 text-white relative overflow-hidden">
          <div className="relative z-10">
            <span className="inline-block rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-300/30">Admin & Petugas Console</span>
            <h2 className="mt-6 text-3xl font-black leading-tight">Pusat Rujukan Akademik & Literasi Riset FEB UB</h2>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">Kelola validasi karya akhir mahasiswa, sirkulasi buku fisik, akses jurnal internasional, repositori, dan rekapitulasi data layanan perpustakaan secara terintegrasi.</p>
          </div>
          <div className="relative z-10 grid grid-cols-2 gap-4 mt-8">
            <div className="rounded-2xl bg-white/10 p-4 border border-white/10 backdrop-blur-sm">
              <span className="block text-2xl font-black text-amber-300">19K+</span>
              <span className="text-xs text-slate-300">Repositori Skripsi/Tesis</span>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 border border-white/10 backdrop-blur-sm">
              <span className="block text-2xl font-black text-emerald-400">38K+</span>
              <span className="text-xs text-slate-300">Total Kunjungan Layanan</span>
            </div>
          </div>
          <div className="relative z-10 pt-6 text-[11px] text-slate-400">
            Gedung F Pascasarjana Lantai 1 FEB UB · Jl. MT. Haryono 165 Malang
          </div>
        </div>
      </div>
    </main>
  );
}
