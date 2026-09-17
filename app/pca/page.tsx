'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function PcaPage() {
  const RATES = [
    {
      category: 'Cetak Hitam Putih (B/W)',
      description: 'Naskah skripsi, tugas kuliah, draf laporan penelitian kertas A4 70/80 gsm.',
      price: 'Rp 300',
      unit: '/ halaman',
      badge: 'Paling Populer',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: 'description',
    },
    {
      category: 'Hitam Putih Bolak-Balik (Duplex)',
      description: 'Cetak dua sisi otomatis, hemat kertas dan ramah lingkungan.',
      price: 'Rp 500',
      unit: '/ lembar (2 halaman)',
      badge: 'Eco-Save',
      badgeColor: 'bg-blue-100 text-blue-800',
      icon: 'auto_stories',
    },
    {
      category: 'Cetak Warna Hemat (Teks & Bagan)',
      description: 'Grafik batang, diagram alir, tabel warna, dan logo fakultas tajam.',
      price: 'Rp 1.000',
      unit: '/ halaman',
      badge: 'Warna Standar',
      badgeColor: 'bg-amber-100 text-amber-900',
      icon: 'palette',
    },
    {
      category: 'Cetak Full Color Kualitas Tinggi',
      description: 'Cover skripsi glossy/matte, sertifikat, poster ilmiah riset.',
      price: 'Rp 2.500',
      unit: '/ halaman',
      badge: 'High-Res Laser',
      badgeColor: 'bg-purple-100 text-purple-900',
      icon: 'photo_size_select_actual',
    },
    {
      category: 'Jilid Mika & Lakban Skripsi',
      description: 'Jilid mika bening transparan + buffalo biru FEB untuk ujian seminar/proposal.',
      price: 'Rp 5.000',
      unit: '/ eksemplar',
      badge: 'Finishing',
      badgeColor: 'bg-slate-100 text-slate-800',
      icon: 'menu_book',
    },
  ];

  const STEPS = [
    {
      step: '01',
      title: 'Kirim Dokumen dari Smartphone / Laptop',
      description:
        'Unggah dokumen PDF / DOCX langsung melalui aplikasi PCA Android atau portal web print di jaringan Wi-Fi SAC-FEB.',
      icon: 'cloud_upload',
    },
    {
      step: '02',
      title: 'Dapatkan Kode PIN / QR Print',
      description:
        'Sistem otomatis memvalidasi jumlah halaman, memilih opsi warna/duplex, dan menerbitkan kode PIN 6-digit serta QR Code.',
      icon: 'qr_code_2',
    },
    {
      step: '03',
      title: 'Scan & Cetak di Kiosk Gedung F Pascasarjana Lt. 1',
      description:
        'Datangi mesin cetak Printer Corner di samping resepsionis SAC, scan QR code, bayar instan via QRIS, dan cetak selesai seketika.',
      icon: 'print',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col justify-between">
      <Navbar />

      <main className="w-full pt-20">
        {/* HERO BANNER */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0B2546] to-[#081B33] text-white py-14 lg:py-20">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center -rotate-6">
            <span className="material-symbols-outlined text-[600px] text-white">print</span>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-400/40">
              <span className="material-symbols-outlined text-[16px]">local_printshop</span>
              <span>Printer Corner App (PCA) • Smart Kiosk Print</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
              Cetak Mandiri Tugas &amp; Naskah <br className="hidden sm:inline" />
              <span className="text-amber-400">Cepat, Murah, dan Tanpa Antre</span>
            </h1>

            <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">
              Solusi pencetakan dokumen digital nirkabel khusus mahasiswa FEB UB. Cetak berkas langsung
              dari smartphone Anda dan ambil hasil cetakan di Kiosk Mandiri SAC Gedung F Pascasarjana Lantai 1.
            </p>

            {/* CTA BUTTONS */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://play.google.com/store/apps/details?id=com.pca.feb.ub"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all active:scale-95 group"
              >
                <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">
                  shop
                </span>
                <span>Unduh PCA di Google Play</span>
              </a>

              <a
                href="https://wa.me/6282315377515?text=Halo%20Admin%20SAC,%20saya%20butuh%20bantuan%20terkait%20mesin%20cetak%20Printer%20Corner%20App%20(PCA)..."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all"
              >
                <span className="material-symbols-outlined text-[20px] text-emerald-400">chat</span>
                <span>Bantuan Helpdesk Kiosk</span>
              </a>
            </div>
          </div>
        </section>

        {/* 3-STEP GUIDE SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-amber-600 block mb-1">
              Alur Penggunaan Mudah
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2546]">
              3 Langkah Cetak Dokumen Mandiri
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Tanpa perlu flashdisk bebas virus, tanpa registrasi manual ke staf meja resepsionis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <div
                key={step.step}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#0B2546] text-amber-300 flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[26px]">{step.icon}</span>
                    </div>
                    <span className="font-mono text-3xl font-black text-slate-200">{step.step}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug pt-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING RATE CARD */}
        <section className="bg-slate-100/70 border-y border-slate-200 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-black uppercase tracking-wider text-amber-600 block mb-1">
                Transparan &amp; Terjangkau
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B2546]">
                Daftar Tarif Cetak Resmi SAC
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Tarif bersubsidi civitas akademika Fakultas Ekonomi dan Bisnis Universitas Brawijaya.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {RATES.map((rate, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[22px]">{rate.icon}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${rate.badgeColor}`}>
                        {rate.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{rate.category}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rate.description}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#0B2546] font-mono">{rate.price}</span>
                    <span className="text-xs text-slate-400 font-medium">{rate.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SPECIFICATION & HARDWARE LOCATION */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                <span>Lokasi Kiosk Mesin Cetak: Gedung F Pascasarjana Lantai 1</span>
              </div>
              <h3 className="text-xl font-bold text-[#0B2546]">
                Didukung Mesin Laser Berkecepatan Tinggi 45 PPM
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tersedia 2 unit workstation printer mandiri di samping meja resepsionis SAC. Mendukung pembayaran
                non-tunai QRIS Bank Mandiri, BCA, BRI, BNI, GoPay, OVO, dan ShopeePay.
              </p>
            </div>

            <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
              <Link
                href="/presensi"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0B2546] hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-amber-400">qr_code_scanner</span>
                <span>Kios Presensi Ruangan</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
