'use client';
import { FormEvent, useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { registrationPrograms, studyLevelFor } from '@/lib/registration-programs';

const field = 'min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100';
const label = 'mb-2 block text-sm font-bold text-slate-700';

function FileField({ name, title, hint, accept }: { name: string; title: string; hint: string; accept: string }) {
  const [filename, setFilename] = useState('Belum ada file dipilih');
  return <label className="group block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 transition hover:border-amber-500 hover:bg-amber-50/40 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-100">
    <span className="flex items-center gap-3"><span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#0B2546] text-xl text-white">↑</span><span className="min-w-0"><span className="block text-sm font-bold text-slate-800">{title}</span><span className="block truncate text-xs text-slate-500">{filename}</span></span><span className="ml-auto hidden rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 sm:block">Pilih file</span></span>
    <span className="mt-3 block text-xs text-slate-500">{hint}</span><input required type="file" name={name} accept={accept} className="sr-only" onChange={e => setFilename(e.target.files?.[0]?.name || 'Belum ada file dipilih')}/>
  </label>;
}

export default function PendaftaranPage() {
  const [initialNim, setInitialNim] = useState('');
  const [department, setDepartment] = useState('');
  const [program, setProgram] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => { const nim = new URLSearchParams(window.location.search).get('nim') || ''; if (nim) setInitialNim(nim.replace(/\D/g, '')); }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setMessage(''); setSuccess(false);
    try { const res = await fetch('/api/members/register', { method: 'POST', body: new FormData(e.currentTarget) }); const json = await res.json(); setSuccess(json.success); setMessage(json.success ? `Pendaftaran berhasil. NIM ${json.data.nim} menunggu verifikasi staf.` : json.error); if (json.success) { e.currentTarget.reset(); setDepartment(''); setProgram(''); } }
    catch { setMessage('Pendaftaran gagal. Periksa koneksi lalu coba lagi.'); }
    finally { setLoading(false); }
  }

  const programs = department ? registrationPrograms[department as keyof typeof registrationPrograms] : [];
  return <div className="min-h-screen bg-slate-50"><Navbar/><main className="mx-auto max-w-5xl px-4 pb-20 pt-28 sm:px-6">
    <header className="mx-auto mb-8 max-w-3xl text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">SAC FEB UB</p><h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0B2546] sm:text-4xl">Pendaftaran Anggota</h1><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">Lengkapi data berikut untuk verifikasi keanggotaan dan akses layanan SAC FEB UB.</p></header>
    <form onSubmit={submit} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
      <div className="border-b border-slate-200 bg-[#0B2546] px-6 py-5 text-white sm:px-8"><h2 className="text-lg font-extrabold">Data pendaftaran</h2><p className="mt-1 text-sm text-blue-100">Kolom bertanda * wajib diisi.</p></div>
      <div className="space-y-8 p-5 sm:p-8">
        <section aria-labelledby="identity-heading"><h2 id="identity-heading" className="mb-4 border-b border-slate-100 pb-3 text-base font-extrabold text-[#0B2546]">1. Identitas anggota</h2><div className="grid gap-5 sm:grid-cols-2">
          <label><span className={label}>Nama lengkap *</span><input required name="fullName" autoComplete="name" placeholder="Sesuai identitas" className={field}/></label>
          <label><span className={label}>NIM *</span><input required name="nim" defaultValue={initialNim} key={initialNim} inputMode="numeric" pattern="[0-9]+" placeholder="Masukkan NIM" className={field}/></label>
          <label><span className={label}>Jenis keanggotaan *</span><select required name="memberType" className={field} defaultValue=""><option value="" disabled>Pilih jenis keanggotaan</option><option>Mahasiswa FEB-UB</option><option>Non FEB-UB</option><option>Dosen/Tendik FEB-UB</option></select></label>
          <label><span className={label}>Jenis identitas *</span><select required name="identityType" className={field} defaultValue=""><option value="" disabled>Pilih jenis identitas</option><option>Kartu Tanda Mahasiswa</option><option>KTP</option><option>Kartu Pegawai</option><option>Paspor</option></select></label>
        </div></section>
        <section aria-labelledby="academic-heading"><h2 id="academic-heading" className="mb-4 border-b border-slate-100 pb-3 text-base font-extrabold text-[#0B2546]">2. Data akademik</h2><div className="grid gap-5 sm:grid-cols-2">
          <label><span className={label}>Departemen *</span><select required value={department} onChange={e => { setDepartment(e.target.value); setProgram(''); }} className={field}><option value="" disabled>Pilih departemen</option>{Object.keys(registrationPrograms).map(item => <option key={item}>{item}</option>)}</select></label>
          <label><span className={label}>Program studi *</span><select required name="studyProgram" value={program} disabled={!department} onChange={e => setProgram(e.target.value)} className={field}><option value="" disabled>{department ? 'Pilih program studi' : 'Pilih departemen terlebih dahulu'}</option>{programs.map(item => <option key={item}>{item}</option>)}</select></label>
          <label><span className={label}>Jenjang</span><input readOnly name="studyLevel" value={studyLevelFor(program)} placeholder="Terisi otomatis" className={field}/></label>
        </div></section>
        <section aria-labelledby="contact-heading"><h2 id="contact-heading" className="mb-4 border-b border-slate-100 pb-3 text-base font-extrabold text-[#0B2546]">3. Kontak dan akun</h2><div className="grid gap-5 sm:grid-cols-2">
          <label><span className={label}>WhatsApp *</span><input required name="whatsapp" inputMode="tel" autoComplete="tel" placeholder="Contoh: 08123456789" className={field}/></label>
          <label><span className={label}>Email aktif *</span><input required type="email" name="email" autoComplete="email" placeholder="nama@email.com" className={field}/></label>
          <label className="sm:col-span-2"><span className={label}>Alamat surat *</span><textarea required name="mailingAddress" autoComplete="street-address" placeholder="Masukkan alamat lengkap" className={`${field} min-h-28 py-3`} rows={3}/></label>
          <label className="sm:col-span-2"><span className={label}>Password *</span><input required type="password" minLength={12} maxLength={72} name="password" autoComplete="new-password" placeholder="Minimal 12 karakter" className={field}/><span className="mt-2 block text-xs text-slate-500">Gunakan minimal 12 karakter. Jangan gunakan password akun lain.</span></label>
        </div></section>
        <section aria-labelledby="document-heading"><h2 id="document-heading" className="mb-4 border-b border-slate-100 pb-3 text-base font-extrabold text-[#0B2546]">4. Dokumen verifikasi</h2><div className="grid gap-4 sm:grid-cols-2"><FileField name="selfie" title="Foto diri *" hint="JPG, PNG, atau WebP · Maksimal 5 MB" accept="image/jpeg,image/png,image/webp"/><FileField name="identityFile" title="File identitas *" hint="JPG, PNG, WebP, atau PDF · Maksimal 5 MB" accept="image/jpeg,image/png,image/webp,application/pdf"/></div></section>
        {message && <p role={success ? 'status' : 'alert'} className={`rounded-xl border p-4 text-sm font-semibold ${success ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>{message}</p>}
        <button disabled={loading} className="min-h-12 w-full rounded-xl bg-[#0B2546] px-5 font-bold text-white transition hover:bg-[#123968] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:cursor-wait disabled:opacity-60">{loading ? 'Menyimpan…' : 'Daftar sebagai Anggota'}</button>
      </div>
    </form>
  </main><Footer/></div>;
}
