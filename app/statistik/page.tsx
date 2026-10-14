'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

type Count = { name: string; count: number };
type Statistics = {
  generatedAt: string;
  totals: { visitors: number; repositoryCount: number; repositoryAccesses: number; averageDurationMinutes: number | null; satisfactionAverage: number | null; satisfactionResponses: number };
  monthlyVisits: { month: string; count: number }[];
  programs: Count[];
  resources: Count[];
};
const number = (value: number) => value.toLocaleString('id-ID');

export default function StatistikPage() {
  const [data, setData] = useState<Statistics | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    fetch('/api/statistik').then(async response => {
      if (!response.ok) throw new Error('Statistik tidak tersedia');
      setData((await response.json()).data);
    }).catch(() => setError(true));
  }, []);
  const metrics = data ? [
    { title: 'Kunjungan tercatat', value: number(data.totals.visitors), note: 'Jumlah sesi buku tamu, bukan pengunjung unik' },
    { title: 'Koleksi repositori', value: number(data.totals.repositoryCount), note: 'Jumlah dokumen dalam database' },
    { title: 'Aktivitas repositori', value: number(data.totals.repositoryAccesses), note: 'Pencarian, baca, dan unduh yang tercatat' },
    ...(data.totals.averageDurationMinutes !== null ? [{ title: 'Rata-rata durasi', value: `${number(data.totals.averageDurationMinutes)} menit`, note: 'Rata-rata selisih keluar–masuk dari sesi bertanggal valid' }] : []),
    ...(data.totals.satisfactionAverage !== null ? [{ title: 'Kepuasan pengunjung', value: `${data.totals.satisfactionAverage.toFixed(2)} / 5`, note: `Rata-rata ${number(data.totals.satisfactionResponses)} penilaian yang tercatat` }] : []),
  ] : [];
  const maxVisits = Math.max(1, ...(data?.monthlyVisits.map(item => item.count) || []));
  return <div className="min-h-screen bg-slate-50 text-slate-800"><Navbar/><main className="pb-16 pt-28">
    <header className="bg-[#0B2546] px-4 py-12 text-white"><div className="mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-widest text-amber-300">Self Access Centre FEB UB</p><h1 className="mt-3 text-3xl font-extrabold">Statistik SAC</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">Ringkasan data yang tercatat di database SAC: arsip buku tamu Google Sheets dan aktivitas layanan website. Angka menunjukkan catatan yang tersedia, bukan estimasi penggunaan seluruh layanan.</p></div></header>
    <div className="mx-auto max-w-6xl space-y-8 px-4 pt-8">
      {error ? <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">Statistik belum dapat dimuat. Silakan coba kembali.</p> : !data ? <p role="status">Memuat statistik…</p> : <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{metrics.map(metric => <article key={metric.title} className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-sm font-bold text-slate-600">{metric.title}</h2><p className="mt-3 text-3xl font-extrabold text-[#0B2546]">{metric.value}</p><p className="mt-3 text-xs leading-5 text-slate-500">{metric.note}</p></article>)}</div>
        {data.monthlyVisits.length > 0 && <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-bold text-[#0B2546]">Tren kunjungan bulanan</h2><p className="mt-2 text-sm text-slate-500">Maksimal 12 bulan terakhir yang memiliki catatan. Tinggi batang relatif terhadap bulan dengan kunjungan terbanyak.</p><div className="mt-6 space-y-3">{data.monthlyVisits.map(item => <div key={item.month} className="grid grid-cols-[5rem_1fr_4rem] items-center gap-3 text-sm"><span>{item.month}</span><div className="h-4 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#0B2546]" style={{ width: `${item.count / maxVisits * 100}%` }} /></div><span className="text-right font-bold">{number(item.count)}</span></div>)}</div></section>}
        {data.programs.length > 0 && <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-bold text-[#0B2546]">Kunjungan menurut program studi</h2><p className="mt-2 text-sm text-slate-500">10 kategori dengan catatan kunjungan terbanyak; persentase = sesi kategori ÷ seluruh sesi × 100.</p><ul className="mt-5 divide-y divide-slate-100">{data.programs.map(item => <li key={item.name} className="flex justify-between gap-4 py-3 text-sm"><span>{item.name}</span><span className="shrink-0 font-bold">{number(item.count)} ({(item.count / Math.max(1, data.totals.visitors) * 100).toFixed(1)}%)</span></li>)}</ul></section>}
        {data.resources.length > 0 && <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-bold text-[#0B2546]">Klik tautan e-resource</h2><p className="mt-2 text-sm text-slate-500">Klik yang direkam website SAC; bukan jumlah pembacaan atau unduhan pada situs penyedia.</p><ul className="mt-5 divide-y divide-slate-100">{data.resources.map(item => <li key={item.name} className="flex justify-between gap-4 py-3 text-sm"><span>{item.name}</span><strong>{number(item.count)}</strong></li>)}</ul></section>}
        <p className="text-xs leading-6 text-slate-500">Sumber: database MySQL SAC. Dibaca {new Date(data.generatedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB. Data kosong tidak direkayasa; rincian identitas pengunjung tidak ditampilkan.</p>
      </>}
    </div></main><Footer/></div>;
}
