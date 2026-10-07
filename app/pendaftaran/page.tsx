'use client';
import { FormEvent, useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function PendaftaranPage() {
  const [initialNim, setInitialNim] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const nimParam = new URLSearchParams(window.location.search).get('nim') || '';
    if (nimParam) setInitialNim(nimParam.replace(/\D/g, ''));
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setMessage('');
    const res = await fetch('/api/members/register', { method: 'POST', body: new FormData(e.currentTarget) });
    const json = await res.json(); setMessage(json.success ? `Pendaftaran berhasil. NIM ${json.data.nim} menunggu verifikasi staf.` : json.error); setLoading(false);
    if (json.success) e.currentTarget.reset();
  }
  const input = 'w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400';
  return <div className="min-h-screen bg-slate-50"><Navbar/><main className="mx-auto max-w-4xl px-4 pb-16 pt-28"><div className="mb-8"><p className="text-xs font-bold tracking-widest text-amber-700">SAC FEB UB</p><h1 className="mt-2 text-3xl font-extrabold text-[#0B2546]">Pendaftaran Data Anggota</h1><p className="mt-2 text-sm text-slate-500">Data digunakan untuk verifikasi NIM dan layanan SAC. Tidak ada kartu anggota.</p></div><form onSubmit={submit} className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm sm:grid-cols-2"><input required name="fullName" placeholder="Nama lengkap" className={input}/><input required name="nim" defaultValue={initialNim} key={initialNim} inputMode="numeric" placeholder="NIM" className={input}/><select required name="memberType" className={input}><option value="">Jenis keanggotaan</option><option>Mahasiswa FEB-UB</option><option>Non FEB-UB</option><option>Dosen/Tendik FEB-UB</option></select><input name="studyLevel" placeholder="Jenjang (S1/S2/S3)" className={input}/><input required name="studyProgram" placeholder="Program studi" className={input}/><input required name="whatsapp" placeholder="WhatsApp, contoh 08123456789" className={input}/><input required type="email" name="email" placeholder="Email aktif" className={input}/><select required name="identityType" className={input}><option value="">Jenis identitas</option><option>Kartu Tanda Mahasiswa</option><option>KTP</option><option>Kartu Pegawai</option><option>Paspor</option></select><textarea required name="mailingAddress" placeholder="Alamat surat" className={`${input} sm:col-span-2`} rows={3}/><input required type="password" minLength={6} name="password" placeholder="Password minimal 6 karakter" className={input}/><div className="grid gap-2 sm:grid-cols-2"><label className="text-xs font-bold text-slate-600">Foto diri<input required type="file" name="selfie" accept="image/jpeg,image/png,image/webp" className="mt-1 w-full text-xs"/></label><label className="text-xs font-bold text-slate-600">File identitas<input required type="file" name="identityFile" accept="image/jpeg,image/png,image/webp,application/pdf" className="mt-1 w-full text-xs"/></label></div><button disabled={loading} className="rounded-xl bg-[#0B2546] py-3 font-bold text-white sm:col-span-2 disabled:opacity-50">{loading ? 'Menyimpan…' : 'Daftar'}</button>{message&&<p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 sm:col-span-2">{message}</p>}</form></main><Footer/></div>;
}
