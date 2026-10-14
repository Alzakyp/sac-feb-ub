'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

type Deposit = { id: string; titleId: string; verificationStatus: string; createdAt: string; hardcopySubmitted: boolean; revisionNotes: string | null; certificateUrl: string | null };
type Profile = { fullName: string; nim: string; studyProgram: string | null; status: string };
const labels: Record<string, string> = { PENDING: 'Menunggu', APPROVED: 'Disetujui', REVISION_NEEDED: 'Perlu Revisi', REJECTED: 'Ditolak' };
export default function MemberDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { Promise.all([fetch('/api/members/me'), fetch('/api/members/dashboard')]).then(async ([a, b]) => {
    if (!a.ok || !b.ok) { router.replace('/anggota/login'); return; }
    setProfile((await a.json()).data); setDeposits((await b.json()).data.deposits);
  }).catch(() => router.replace('/anggota/login')).finally(() => setLoading(false)); }, [router]);
  async function logout() { await fetch('/api/members/logout', { method: 'POST' }); router.replace('/anggota/login'); router.refresh(); }
  return <div className="min-h-screen bg-slate-50"><Navbar/><main className="mx-auto max-w-5xl px-4 pb-20 pt-32">{loading ? <p role="status">Memuat dashboard…</p> : profile && <><div className="rounded-3xl bg-[#0B2546] p-7 text-white sm:p-10"><p className="text-xs font-bold uppercase tracking-widest text-amber-300">Dashboard Anggota SAC</p><h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">Halo, {profile.fullName}</h1><p className="mt-2 text-sm text-slate-200">{profile.nim} · {profile.studyProgram || 'FEB UB'} · {profile.status}</p><div className="mt-6 flex flex-wrap gap-3"><a href="/serah-simpan" className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-[#0B2546] focus-visible:outline-2 focus-visible:outline-white">Ajukan Serah Simpan</a><button onClick={logout} className="rounded-xl border border-white/50 px-5 py-3 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-amber-400">Keluar</button></div></div><section className="mt-8" aria-labelledby="deposits-title"><h2 id="deposits-title" className="text-xl font-extrabold text-[#0B2546]">Pengajuan Saya</h2><div className="mt-4 grid gap-4 sm:grid-cols-4">{Object.entries(labels).map(([status, title]) => <div key={status} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold text-[#0B2546]">{deposits.filter(d => d.verificationStatus === status).length}</p></div>)}</div><div className="mt-6 space-y-4">{deposits.length === 0 ? <p className="rounded-2xl bg-white p-8 text-center text-slate-600">Belum ada pengajuan Serah Simpan.</p> : deposits.map(d => <article key={d.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold text-[#0B2546]">{d.titleId}</h3><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">{labels[d.verificationStatus] || d.verificationStatus}</span></div><p className="mt-2 text-xs text-slate-500">{new Date(d.createdAt).toLocaleDateString('id-ID')} · Hardcopy: {d.hardcopySubmitted ? 'Diterima' : 'Belum diterima'}</p>{d.revisionNotes && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Catatan: {d.revisionNotes}</p>}{d.certificateUrl && <a href={d.certificateUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-bold text-blue-700 underline">Lihat bukti ↗</a>}</article>)}</div></section></>}</main><Footer/></div>;
}
