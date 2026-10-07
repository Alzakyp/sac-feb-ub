'use client';
import { FormEvent, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function TurnitinPage() {
  const [step, setStep] = useState<'terms' | 'nim' | 'form' | 'success'>('terms');
  const [verifiedMember, setVerifiedMember] = useState<{ fullName: string; studyProgram: string } | null>(null);
  const [nim, setNim] = useState('');
  const [checkingNim, setCheckingNim] = useState(false);
  const [unregisteredNim, setUnregisteredNim] = useState(false);
  const [manualApplicant, setManualApplicant] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  async function verifyNim() {
    const cleanNim = nim.replace(/\D/g, '');
    if (cleanNim.length < 5) { setError('NIM minimal 5 digit.'); return; }
    setCheckingNim(true); setError(''); setUnregisteredNim(false);
    const res = await fetch(`/api/students/verify?nim=${encodeURIComponent(cleanNim)}`);
    const json = await res.json().catch(() => ({}));
    setCheckingNim(false);
    if (!res.ok || !json.success) {
      setError('NIM tidak ditemukan di master mahasiswa. Lengkapi data pemohon di bawah untuk melanjutkan.');
      setUnregisteredNim(true);
      setManualApplicant(true);
      return;
    }
    setNim(cleanNim); setVerifiedMember(json.data); setStep('form');
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/turnitin', { method: 'POST', body: form });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || 'Gagal mengirimkan permohonan.');
      setLoading(false);
      return;
    }
    setResult(json.data);
    setStep('success');
    setLoading(false);
  }

  const inputClass = 'w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs outline-none focus:border-[#0B2546] focus:ring-2 focus:ring-[#0B2546]/10';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col justify-between">
      <Navbar />

      <main className="w-full pt-20">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0B2546] to-[#081B33] text-white py-12 lg:py-16">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Cek Plagiasi Skripsi / Tesis / Disertasi
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 italic">
              Plagiarism Checking for Undergraduate Thesis / Master&apos;s Thesis / Dissertation
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {step === 'nim' && (
            <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
              <span className="material-symbols-outlined text-5xl text-amber-500">verified_user</span>
              <h2 className="mt-4 text-xl font-extrabold text-[#0B2546]">Verifikasi NIM</h2>
              <p className="mt-2 text-xs leading-5 text-slate-500">Verifikasi NIM terlebih dahulu terhadap database master mahasiswa sebelum mengajukan cek plagiasi.</p>
              <input value={nim} onChange={(e) => { setNim(e.target.value.replace(/\D/g, '')); setError(''); }} inputMode="numeric" placeholder="Masukkan NIM" className={`${inputClass} mt-6 text-center font-mono`} />
              {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
              {unregisteredNim && <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-xs text-amber-900"><b>Data anggota belum ditemukan.</b><p className="mt-1">Anda tetap dapat melanjutkan dengan mengisi data pemohon secara manual.</p><button onClick={() => setStep('form')} className="mt-3 inline-flex rounded-lg bg-[#0B2546] px-3 py-2 font-bold text-white">Lanjut Isi Data Pemohon</button></div>}
              <button onClick={verifyNim} disabled={checkingNim} className="mt-4 w-full rounded-xl bg-[#0B2546] py-3 text-xs font-bold text-amber-300 disabled:opacity-50">{checkingNim ? 'Memverifikasi…' : 'Verifikasi NIM'}</button>
            </div>
          )}
          {step === 'terms' && (
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-8">
              {/* 1. Persyaratan Administrasi */}
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#0B2546]">
                  Persyaratan Administrasi <span className="block text-xs font-normal text-slate-500 italic">Administrative Requirements</span>
                </h2>
                <p className="mt-2 text-xs text-slate-600">
                  Pemohon wajib mengisi data dengan lengkap dan benar. <span className="italic block text-slate-400">Applicants must provide complete and accurate information.</span>
                </p>
                <ul className="mt-3 grid sm:grid-cols-2 gap-2 text-xs text-slate-700 list-disc list-inside">
                  <li>NIM / Student Identification Number</li>
                  <li>Nama lengkap / Full name</li>
                  <li>Program studi / Study program</li>
                  <li>Nomor WhatsApp aktif / Active WhatsApp number</li>
                  <li>Email institusi/mahasiswa / Institutional or student email</li>
                  <li>Jenis karya ilmiah / Scientific work type</li>
                  <li>Nama Pembimbing/Promotor / Supervisor/Promoter</li>
                  <li>Judul karya ilmiah / Scientific work title</li>
                </ul>
              </div>

              {/* 2. Persyaratan File */}
              <div className="border-t border-slate-100 pt-6">
                <h2 className="text-base sm:text-lg font-bold text-[#0B2546]">
                  Persyaratan File <span className="block text-xs font-normal text-slate-500 italic">File Requirements</span>
                </h2>
                <ul className="mt-3 space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2"><span>✓</span><div><b>File harus dalam format PDF (.pdf).</b> <span className="block text-slate-400 italic">The file must be in PDF format (.pdf).</span></div></li>
                  <li className="flex items-start gap-2"><span>✓</span><div><b>File dapat dibuka dan dibaca dengan normal.</b> <span className="block text-slate-400 italic">The file must be readable and open normally.</span></div></li>
                  <li className="flex items-start gap-2"><span>✓</span><div><b>File tidak diproteksi password.</b> <span className="block text-slate-400 italic">The file must not be password protected.</span></div></li>
                  <li className="flex items-start gap-2"><span>✓</span><div><b>Dokumen harus merupakan satu file utuh.</b> <span className="block text-slate-400 italic">The document must be submitted as one complete file.</span></div></li>
                </ul>
              </div>

              {/* 3. Kelengkapan Softcopy */}
              <div className="border-t border-slate-100 pt-6">
                <h2 className="text-base sm:text-lg font-bold text-[#0B2546]">
                  Kelengkapan Softcopy <span className="block text-xs font-normal text-slate-500 italic">Softcopy Content</span>
                </h2>
                <p className="mt-2 text-xs text-slate-600">
                  Pengecekan dilakukan hanya pada bagian isi/utama: <span className="block text-slate-400 italic">The plagiarism check covers only the main content:</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {['Bab 1 / Chapter 1', 'Bab 2 / Chapter 2', 'Bab 3 / Chapter 3', 'Bab 4 / Chapter 4', 'Bab 5 / Chapter 5', 'Bab 6 / Chapter 6 (opsional)'].map((b) => (
                    <span key={b} className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-medium">{b}</span>
                  ))}
                </div>
              </div>

              {/* 4. Ketentuan Pengajuan */}
              <div className="border-t border-slate-100 pt-6">
                <h2 className="text-base sm:text-lg font-bold text-[#0B2546]">
                  Ketentuan Pengajuan <span className="block text-xs font-normal text-slate-500 italic">Submission Rules</span>
                </h2>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                  <li>Setiap mahasiswa hanya mengajukan satu versi dokumen dalam satu permohonan.</li>
                  <li>Revisi dapat diajukan kembali maksimal 3 kali.</li>
                  <li>Dokumen yang diajukan menjadi tanggung jawab pemohon.</li>
                  <li>Pastikan seluruh data sesuai dengan dokumen.</li>
                </ul>
              </div>

              {/* ACTION GATE */}
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 text-center space-y-4">
                <p className="text-xs sm:text-sm font-bold text-[#0B2546] leading-relaxed">
                  Apakah Dokumen Anda Sudah Siap dan Sesuai dengan Ketentuan? Jika Sudah Apakah Anda Akan Melakukan Permohonan Cek Plagiasi?
                  <span className="block font-normal text-xs text-slate-500 italic mt-1">
                    Is your document ready and compliant with the requirements? If yes, would you like to submit a plagiarism checking request?
                  </span>
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => setStep('nim')}
                    className="px-6 py-2.5 rounded-xl bg-[#0B2546] text-amber-300 hover:text-white font-bold text-xs shadow-md transition"
                  >
                    ✓ YA / YES
                  </button>
                  <a
                    href="/"
                    className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-100 transition"
                  >
                    ✕ TIDAK / NO
                  </a>
                </div>
              </div>
            </div>
          )}

          {step === 'form' && (
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-[#0B2546]">Formulir Permohonan Cek Plagiasi</h2>
                <button onClick={() => setStep('terms')} className="text-xs text-slate-500 hover:underline">← Baca Syarat</button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {error && <p className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">{error}</p>}
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">NIM *</label>
                    <input required name="nim" value={nim} readOnly className={`${inputClass} bg-slate-100`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                    <input required name="fullName" defaultValue={verifiedMember?.fullName || ''} readOnly={!manualApplicant} placeholder="Nama lengkap tanpa gelar" className={`${inputClass} ${!manualApplicant ? 'bg-slate-100' : ''}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Institusi/Aktif *</label>
                    <input required type="email" name="email" placeholder="nama@student.ub.ac.id" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp Aktif *</label>
                    <input required type="tel" name="whatsapp" placeholder="081234567890" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Program Studi *</label>
                    <input required name="studyProgram" defaultValue={verifiedMember?.studyProgram || ''} readOnly={!manualApplicant} placeholder="S1 Manajemen" className={`${inputClass} ${!manualApplicant ? 'bg-slate-100' : ''}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Karya Ilmiah *</label>
                    <select required name="workType" className={inputClass}>
                      <option>Skripsi</option>
                      <option>Tesis</option>
                      <option>Disertasi</option>
                      <option>Artikel Ilmiah</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Dosen Pembimbing / Promotor *</label>
                  <input required name="advisor" placeholder="Prof. / Dr. ..." className={inputClass} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul Karya Ilmiah *</label>
                  <textarea required rows={3} name="title" placeholder="Judul lengkap karya ilmiah..." className={inputClass} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Upload File Karya Ilmiah (PDF, maks 20 MB) *</label>
                  <input required type="file" name="file" accept="application/pdf" className="block w-full text-xs file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0B2546] file:text-white" />
                  <p className="mt-1 text-[11px] text-slate-400 italic">File utuh Bab 1 s.d. Bab 5/6, format .pdf tanpa password.</p>
                </div>

                <div className="pt-4">
                  <button
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-[#0B2546] text-amber-300 font-extrabold text-sm shadow hover:bg-slate-900 transition disabled:opacity-50"
                  >
                    {loading ? 'Mengunggah Berkas...' : 'Kirim Permohonan Cek Plagiasi'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'success' && result && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center space-y-4">
              <span className="material-symbols-outlined text-5xl text-emerald-600">verified</span>
              <h2 className="text-2xl font-extrabold text-[#0B2546]">Permohonan Berhasil Dikirim</h2>
              <p className="text-xs text-slate-500">Nomor Registrasi Permohonan Anda:</p>
              <div className="p-4 rounded-2xl bg-amber-50 font-mono font-bold text-lg text-[#0B2546] border border-amber-200 max-w-sm mx-auto">
                {result.requestNumber}
              </div>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Berkas PDF Anda telah masuk ke dalam antrean staf SAC FEB UB. Hasil uji similarity Turnitin akan diproses dalam 1×24 jam kerja dan dilaporkan melalui email atau kontak terdaftar.
              </p>
              <div className="pt-4">
                <button onClick={() => setStep('terms')} className="px-5 py-2.5 rounded-xl bg-[#0B2546] text-white text-xs font-bold">
                  Selesai
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
