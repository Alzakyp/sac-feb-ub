'use client';
import { FormEvent, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

type Result = { requestNumber: string; title: string; status: string; similarityScore: number | null; staffNotes: string | null };

export default function TurnitinPage() {
  const [mode, setMode] = useState<'submit' | 'check'>('submit');
  const [form, setForm] = useState({ nim: '', fullName: '', email: '', studyProgram: '', workType: 'Skripsi', title: '', fileName: '' });
  const [number, setNumber] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault(); setMessage('');
    const res = await fetch('/api/turnitin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const json = await res.json();
    if (!res.ok) return setMessage(json.error);
    setNumber(json.data.requestNumber); setMessage(`Pengajuan tersimpan. Nomor Anda: ${json.data.requestNumber}`);
  }
  async function check(event: FormEvent) {
    event.preventDefault(); setMessage(''); setResult(null);
    const res = await fetch(`/api/turnitin/${encodeURIComponent(number)}`); const json = await res.json();
    if (!res.ok) return setMessage(json.error); setResult(json.data);
  }

  const input = 'w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400';
  return <div className="min-h-screen bg-slate-50"><Navbar/><main className="pt-24"><section className="bg-[#0B2546] px-4 py-14 text-center text-white"><p className="text-xs font-bold tracking-[.2em] text-amber-300">LAYANAN AKADEMIK</p><h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">Cek Plagiasi / Turnitin</h1><p className="mx-auto mt-4 max-w-2xl text-sm text-slate-200">Kirim naskah untuk diproses staf SAC menggunakan layanan Turnitin resmi. Sistem ini mengelola antrean dan hasil, bukan mesin pemeriksa mandiri.</p></section><section className="mx-auto max-w-3xl px-4 py-10"><div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-200 p-1"><button onClick={() => setMode('submit')} className={`rounded-lg py-2 text-sm font-bold ${mode==='submit'?'bg-white shadow':'text-slate-600'}`}>Ajukan Pemeriksaan</button><button onClick={() => setMode('check')} className={`rounded-lg py-2 text-sm font-bold ${mode==='check'?'bg-white shadow':'text-slate-600'}`}>Cek Status</button></div>{mode==='submit'?<form onSubmit={submit} className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2"><input required className={input} placeholder="NIM" value={form.nim} onChange={e=>setForm({...form,nim:e.target.value})}/><input required className={input} placeholder="Nama lengkap" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})}/><input required type="email" className={input} placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input required className={input} placeholder="Program studi" value={form.studyProgram} onChange={e=>setForm({...form,studyProgram:e.target.value})}/><select className={input} value={form.workType} onChange={e=>setForm({...form,workType:e.target.value})}><option>Skripsi</option><option>Tesis</option><option>Disertasi</option><option>Artikel</option></select><input required className={input} placeholder="Nama file PDF/DOCX" value={form.fileName} onChange={e=>setForm({...form,fileName:e.target.value})}/><textarea required className={`${input} sm:col-span-2`} rows={3} placeholder="Judul karya" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><p className="text-xs text-amber-700 sm:col-span-2">Berkas dikirim ke staf SAC sesuai petunjuk operasional setelah nomor pengajuan diterbitkan.</p><button className="rounded-xl bg-[#0B2546] py-3 text-sm font-bold text-white sm:col-span-2">Kirim Pengajuan</button></form>:<form onSubmit={check} className="rounded-2xl bg-white p-6 shadow-sm"><label className="text-sm font-bold">Nomor Pengajuan<input required className={`${input} mt-2`} placeholder="PLG-2026-0001" value={number} onChange={e=>setNumber(e.target.value)}/></label><button className="mt-4 w-full rounded-xl bg-[#0B2546] py-3 text-sm font-bold text-white">Cek Status</button></form>}{message&&<p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-medium text-amber-900">{message}</p>}{result&&<div className="mt-4 rounded-2xl border bg-white p-6"><p className="text-xs font-bold text-amber-700">{result.requestNumber}</p><h2 className="mt-2 font-bold">{result.title}</h2><p className="mt-3 text-sm">Status: <b>{result.status}</b></p>{result.similarityScore!==null&&<p className="mt-2 text-2xl font-extrabold text-[#0B2546]">Similarity: {result.similarityScore}%</p>}{result.staffNotes&&<p className="mt-2 text-sm text-slate-600">Catatan: {result.staffNotes}</p>}</div>}</section></main><Footer/></div>;
}
