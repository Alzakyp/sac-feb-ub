'use client';

import { useState } from 'react';
import Link from 'next/link';

type ProgressItem = {
  id: string;
  source: 'system' | 'archive';
  number: string;
  fullName: string;
  nim: string;
  program: string | null;
  type: string;
  title: string;
  status: string;
  hardcopy: boolean;
  notes: string | null;
  downloadUrl: string | null;
  date: string | null;
  plagiarismScore?: string | null;
};

const statusLabels: Record<string, string> = {
  PENDING: 'Menunggu pemeriksaan',
  REVISION_NEEDED: 'Perlu perbaikan',
  APPROVED: 'Selesai',
  REJECTED: 'Ditolak',
};

export default function TrackDepositPage() {
  const [nim, setNim] = useState('');
  const [items, setItems] = useState<ProgressItem[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function track(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSearched(false);
    const response = await fetch('/api/serah-simpan/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nim }) });
    const json = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok || !json.success) { setError(json.error || 'Gagal mencari data.'); return; }
    setItems(json.data);
    setSearched(true);
  }

  return <main className="min-h-screen bg-[#f8f9ff] pt-32 pb-20 text-[#0b2546]">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <Link href="/serah-simpan" className="text-sm font-bold text-amber-700 hover:underline">← Pengajuan Serah Simpan</Link>
      <div className="mt-6 rounded-3xl bg-[#0B2546] p-7 text-white shadow-lg sm:p-10">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-300">Layanan Serah Simpan • Submission Service</span>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl">Lacak Progres & Download Bukti</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200">Untuk memulai, verifikasi NIM Anda terlebih dahulu. Gunakan layanan ini untuk melihat progres, memeriksa status, serta mengunduh Bukti Serah Simpan jika tersedia.</p>
        <p className="mt-1 max-w-3xl text-sm leading-7 text-slate-300">Verify your NIM to track your submission and download your receipt when available.</p>
      </div>
      <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_1.4fr]">
        <section className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Verifikasi NIM <span className="text-sm font-normal text-slate-500">/ Verify NIM</span></h2>
          <p className="mt-2 text-sm text-slate-600">Masukkan Nomor Induk Mahasiswa untuk menemukan data Serah Simpan Anda.</p>
          <form onSubmit={track} className="mt-5 space-y-4">
            <label className="block text-sm font-bold" htmlFor="nim-lacak">NIM <span className="font-normal text-slate-500">/ Student Identification Number</span></label>
            <input id="nim-lacak" value={nim} onChange={e => setNim(e.target.value)} required inputMode="numeric" autoComplete="off" className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-amber-400" placeholder="Nomor Induk Mahasiswa" />
            <button disabled={loading} className="min-h-12 w-full rounded-xl bg-amber-400 px-4 font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60">{loading ? 'Mencari data…' : 'Verifikasi NIM / Verify NIM'}</button>
          </form>
          {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
          <p className="mt-5 text-xs leading-6 text-slate-500">Pastikan NIM benar. Jangan bagikan bukti yang memuat data pribadi. / Make sure your NIM is correct. Do not share receipts containing personal information.</p>
        </section>
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Panduan Layanan <span className="text-sm font-normal text-slate-500">/ Service Guide</span></h2>
            <ol className="mt-4 grid gap-3 text-sm text-slate-700">
              {['Verifikasi NIM / Verify your student number.', 'Lacak progres pengajuan / Track submission progress.', 'Periksa softcopy, hardcopy, catatan admin, dan status akhir / Check all submission statuses.', 'Unduh bukti jika tersedia / Download your receipt when available.', 'Jika masih diproses, cek kembali berkala / Check back later if still in progress.'].map((step, index) => <li key={step} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-100 font-bold text-amber-900">{index + 1}</span><span className="pt-1">{step}</span></li>)}
            </ol>
          </section>
          {searched && (items.length === 0 ? <p role="status" className="rounded-2xl border border-slate-200 bg-white p-6 text-sm">Belum ada data Serah Simpan untuk NIM tersebut. / No submission found.</p> : <section aria-live="polite" className="space-y-4"><h2 className="text-lg font-bold">Hasil Pencarian ({items.length})</h2>{items.map(item => <article key={`${item.source}-${item.id}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap justify-between gap-2"><span className="text-xs font-bold uppercase tracking-wider text-amber-700">{item.source === 'archive' ? 'Arsip Bukti Serah Simpan' : 'Pengajuan Serah Simpan'}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-950">{statusLabels[item.status] || item.status}</span></div>
            <h3 className="mt-3 font-bold">{item.title}</h3><p className="mt-1 text-sm text-slate-600">{item.fullName} · {item.nim} · {item.program || item.type}</p>
            <dl className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">Nomor bukti / pengajuan</dt><dd className="font-semibold">{item.number}</dd></div><div><dt className="text-slate-500">Tanggal pengajuan</dt><dd className="font-semibold">{item.date ? new Date(item.date).toLocaleDateString('id-ID') : '-'}</dd></div><div><dt className="text-slate-500">Softcopy</dt><dd className="font-semibold">{statusLabels[item.status] || item.status}</dd></div><div><dt className="text-slate-500">Hardcopy</dt><dd className="font-semibold">{item.hardcopy ? 'Diterima' : 'Belum tercatat'}</dd></div><div><dt className="text-slate-500">Hasil pemeriksaan Admin</dt><dd className="font-semibold">{statusLabels[item.status] || item.status}</dd></div><div><dt className="text-slate-500">Catatan / perbaikan</dt><dd className="font-semibold">{item.notes || 'Tidak ada catatan'}</dd></div></dl>
            {item.downloadUrl && <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#0B2546] px-4 text-sm font-bold text-white hover:bg-[#16365c]">Download Bukti Serah Simpan ↗</a>}
            {!item.downloadUrl && <p className="mt-5 text-xs text-slate-500">Bukti belum tersedia. Silakan cek kembali secara berkala.</p>}
          </article>)}</section>)}
        </div>
      </div>
    </div>
  </main>;
}
