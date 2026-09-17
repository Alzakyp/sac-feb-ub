'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface TicketData {
  ticketNumber: string;
  fullName: string;
  identityNumber: string;
  email: string;
  phone: string;
  category: string;
  description: string;
  submittedAt: string;
  slaHours: string;
}

export default function LaporPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    identityNumber: '',
    email: '',
    phone: '',
    category: 'Fasilitas Ruangan',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<TicketData | null>(null);

  const CATEGORIES = [
    { value: 'Fasilitas Ruangan', label: 'Fasilitas Ruangan (AC, Meja, Kursi, Loker, Kebersihan)' },
    { value: 'Akses E-Resources', label: 'Akses E-Resources (ScienceDirect, EduVPN, Akun UB)' },
    { value: 'Layanan & Sikap Staf', label: 'Layanan & Sikap Staf (Pelayanan Meja, Asistensi)' },
    { value: 'Kritik & Saran', label: 'Kritik & Saran Pengembangan Layanan SAC' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.fullName.trim() || !formData.identityNumber.trim() || !formData.email.trim() || !formData.description.trim()) {
      setErrorMsg('Mohon lengkapi seluruh kolom bertanda bintang (*).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/lapor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal mengirim laporan aduan.');
      }

      setSubmittedTicket(json.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col justify-between">
      <Navbar />

      <main className="w-full pt-20">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0B2546] to-[#081B33] text-white py-12 lg:py-16">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center -rotate-6">
            <span className="material-symbols-outlined text-[600px] text-white">report_problem</span>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider mb-4 border border-rose-400/40">
              <span className="material-symbols-outlined text-[16px]">support_agent</span>
              <span>Pusat Pengaduan &amp; Aspirasi Mahasiswa (LaporSAC)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
              Lapor Kendala &amp; Aspirasi <br className="hidden sm:inline" />
              <span className="text-amber-400">Self Access Centre FEB UB</span>
            </h1>

            <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">
              Sampaikan keluhan fasilitas ruangan, kendala akses pangkalan data e-resources, kritik, maupun saran.
              Setiap tiket ditindaklanjuti maksimal 1×24 jam kerja oleh Tim Pengelola SAC.
            </p>
          </div>
        </section>

        {/* CONTENT SECTION */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {submittedTicket ? (
            /* SUCCESS TICKET CARD */
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">
              <div className="bg-emerald-700 text-white p-6 sm:p-8 text-center relative">
                <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/30 text-white flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <span className="material-symbols-outlined text-[36px]">verified</span>
                </div>
                <span className="text-xs uppercase font-extrabold text-emerald-200 tracking-wider">
                  Tiket Aduan Berhasil Diterbitkan
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-1 font-mono text-amber-300">
                  {submittedTicket.ticketNumber}
                </h2>
                <p className="text-xs text-emerald-100 mt-2 max-w-md mx-auto">
                  Bukti aduan telah tercatat di sistem kami. Salinan dan tindak lanjut penanganan akan dikirimkan ke alamat email terdaftar.
                </p>
              </div>

              <div className="p-6 sm:p-8 space-y-6 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Nama Pengadu</span>
                    <span className="font-bold text-slate-900 text-sm">{submittedTicket.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">NIM / Identitas</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{submittedTicket.identityNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Email Civitas</span>
                    <span className="font-semibold text-slate-800">{submittedTicket.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Kategori Masalah</span>
                    <span className="font-bold text-[#0B2546]">{submittedTicket.category}</span>
                  </div>
                  <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Isi Laporan</span>
                    <p className="text-slate-700 leading-relaxed mt-1 text-[11.5px]">{submittedTicket.description}</p>
                  </div>
                  <div className="sm:col-span-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">SLA Penanganan: <strong>{submittedTicket.slaHours}</strong></span>
                    <span className="text-slate-400 text-[11px] font-mono">
                      {new Date(submittedTicket.submittedAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <a
                    href="https://wa.me/6282315377515?text=Halo%20Admin%20SAC,%20saya%20ingin%20menanyakan%20status%20tiket%20aduan%20LaporSAC%20saya..."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    <span>Hubungi Helpdesk via WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedTicket(null);
                      setFormData({
                        fullName: '',
                        identityNumber: '',
                        email: '',
                        phone: '',
                        category: 'Fasilitas Ruangan',
                        description: '',
                      });
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                  >
                    Buat Aduan Baru
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* FORM CARD */
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
              <div className="bg-[#0B2546] text-white p-6 sm:p-8 flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                    Formulir Tiket LaporSAC
                  </h2>
                  <p className="text-xs text-amber-300 mt-1">
                    Gedung F Pascasarjana Lantai 1 • Layanan Responsif &amp; Terbuka
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">edit_note</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">error</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Nama Lengkap Mahasiswa / Civitas <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Contoh: Muhammad Zaky"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B2546] focus:ring-2 focus:ring-[#0B2546]/10 text-xs text-slate-900"
                    />
                  </div>

                  {/* NIM */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Nomor Induk Mahasiswa (NIM) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.identityNumber}
                      onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                      placeholder="Contoh: 215020200111001"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B2546] focus:ring-2 focus:ring-[#0B2546]/10 text-xs font-mono text-slate-900"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Alamat Email Aktif <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Contoh: mahasiswa@student.ub.ac.id"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B2546] focus:ring-2 focus:ring-[#0B2546]/10 text-xs text-slate-900"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Nomor WhatsApp (Opsional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B2546] focus:ring-2 focus:ring-[#0B2546]/10 text-xs font-mono text-slate-900"
                    />
                  </div>
                </div>

                {/* Category Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Kategori Pengaduan / Masukan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B2546] focus:ring-2 focus:ring-[#0B2546]/10 text-xs text-slate-900 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Deskripsi Lengkap Aduan / Kendala <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tuliskan secara spesifik kendala Anda (lokasi meja, nama database jurnal, pesan galat, atau waktu kejadian)..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B2546] focus:ring-2 focus:ring-[#0B2546]/10 text-xs text-slate-900 leading-relaxed"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#0B2546] hover:bg-slate-900 text-amber-300 hover:text-white font-extrabold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                        <span>Menerbitkan Tiket Aduan...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">send</span>
                        <span>Kirim Laporan Aduan</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
