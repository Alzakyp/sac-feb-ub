'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function StatistikPage() {
  const [showEmbed, setShowEmbed] = useState(false);

  const MONTHLY_VISITS = [
    { month: 'Jan', count: 1120, percentage: 68 },
    { month: 'Feb', count: 1450, percentage: 88 },
    { month: 'Mar', count: 1680, percentage: 100 },
    { month: 'Apr', count: 1540, percentage: 92 },
    { month: 'Mei', count: 1390, percentage: 83 },
    { month: 'Jun', count: 1250, percentage: 74 },
    { month: 'Jul', count: 980, percentage: 58 },
    { month: 'Agu', count: 1320, percentage: 79 },
    { month: 'Sep', count: 1610, percentage: 96 },
    { month: 'Okt', count: 1580, percentage: 94 },
    { month: 'Nov', count: 1490, percentage: 89 },
    { month: 'Des', count: 1180, percentage: 70 },
  ];

  const PRODI_DISTRIBUTION = [
    { name: 'S1 Manajemen & Kewirausahaan', share: '38%', color: 'bg-blue-600', visitors: '5.640' },
    { name: 'S1 Akuntansi', share: '32%', color: 'bg-emerald-600', visitors: '4.750' },
    { name: 'S1 Ekonomi Pembangunan & Syariah', share: '18%', color: 'bg-amber-500', visitors: '2.670' },
    { name: 'Program Pascasarjana (S2/S3 & Dosen)', share: '12%', color: 'bg-purple-600', visitors: '1.790' },
  ];

  const E_RESOURCE_STATS = [
    {
      name: 'ScienceDirect & Scopus',
      category: 'Jurnal Internasional Q1/Q2',
      hits: '28.450 Akses',
      badge: 'Paling Populer',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      name: 'Emerald Insight',
      category: 'Bisnis, Manajemen & Pemasaran',
      hits: '19.200 Akses',
      badge: 'Tinggi',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      name: 'ProQuest E-Book Central',
      category: 'Buku Teks Referensi Terapan',
      hits: '14.800 Akses',
      badge: 'Stabil',
      badgeColor: 'bg-amber-100 text-amber-900',
    },
    {
      name: 'Data Makroekonomi BPS & CEIC',
      category: 'Statistik & Ekonometrika',
      hits: '12.350 Akses',
      badge: 'Riset Skripsi',
      badgeColor: 'bg-purple-100 text-purple-900',
    },
    {
      name: 'Bursa Efek Indonesia (IDX Data)',
      category: 'Laporan Keuangan Perusahaan Terbuka',
      hits: '9.600 Akses',
      badge: 'Keuangan',
      badgeColor: 'bg-slate-100 text-slate-800',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col justify-between">
      <Navbar />

      <main className="w-full pt-20">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0B2546] to-[#081B33] text-white py-12 lg:py-16">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center -rotate-6">
            <span className="material-symbols-outlined text-[600px] text-white">analytics</span>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-400/40">
              <span className="material-symbols-outlined text-[16px]">insights</span>
              <span>Transparansi Kinerja &amp; Analitik Layanan</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
              Statistik &amp; Transparansi Publik <br className="hidden sm:inline" />
              <span className="text-amber-400">SAC FEB Universitas Brawijaya</span>
            </h1>

            <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">
              Ringkasan pemanfaatan ruang baca mandiri, tingkat kepuasan pengunjung, utilisasi repositori tugas akhir,
              serta lalu lintas pangkalan data jurnal ilmiah terakreditasi internasional.
            </p>
          </div>
        </section>

        {/* 4 KEY METRICS CARDS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-lg">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Kunjungan
                </span>
                <span className="material-symbols-outlined text-amber-500 text-[22px]">groups</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#0B2546] font-mono">14.850+</div>
              <span className="text-[11px] text-emerald-700 font-bold mt-1 inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                <span>+12.4% vs Tahun Lalu</span>
              </span>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-lg">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Koleksi Repositori
                </span>
                <span className="material-symbols-outlined text-blue-600 text-[22px]">local_library</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#0B2546] font-mono">7.600+</div>
              <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                Skripsi, Tesis &amp; Disertasi
              </span>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-lg">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Rata-Rata Durasi
                </span>
                <span className="material-symbols-outlined text-emerald-600 text-[22px]">timer</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#0B2546] font-mono">1j 45m</div>
              <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                Per Sesi Kunjungan Fisik
              </span>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-lg">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Indeks Kepuasan
                </span>
                <span className="material-symbols-outlined text-amber-500 text-[22px]">star</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#0B2546] font-mono">4.88 / 5.0</div>
              <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
                Predikat: Sangat Memuaskan
              </span>
            </div>
          </div>
        </section>

        {/* VISUAL CHARTS SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
          {/* Monthly Trend & Prodi Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Monthly Trend Chart */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0B2546]">
                    Tren Kunjungan Bulanan (Tahun Berjalan)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rata-rata 1.200 – 1.600 kunjungan per bulan di Gedung F Pascasarjana Lantai 1.
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                  Data Presensi Kiosk
                </span>
              </div>

              {/* Bar Chart Visualization */}
              <div className="grid grid-cols-12 gap-2 items-end h-48 pt-6 pb-2 border-b border-slate-100">
                {MONTHLY_VISITS.map((m) => (
                  <div key={m.month} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="text-[9px] font-mono font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {m.count}
                    </div>
                    <div
                      style={{ height: `${m.percentage}%` }}
                      className="w-full bg-[#0B2546] group-hover:bg-amber-400 rounded-t-md transition-colors shadow-2xs"
                      title={`${m.month}: ${m.count} Kunjungan`}
                    />
                    <span className="text-[10px] font-semibold text-slate-500 font-mono">
                      {m.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prodi Share Breakdown */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0B2546] mb-1">
                  Distribusi Asal Program Studi
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Proporsi pengguna aktif ruang baca dan fasilitas komputasi statistik.
                </p>

                <div className="space-y-4">
                  {PRODI_DISTRIBUTION.map((item) => (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800">{item.name}</span>
                        <span className="font-mono font-bold text-[#0B2546]">{item.share}</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: item.share }}
                          className={`h-full ${item.color} rounded-full`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium block text-right">
                        ~{item.visitors} sesi kunjungan
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Sumber: Kiosk Log SQLite DB</span>
                <span className="font-semibold text-[#0B2546]">N = 14.850 Sesi</span>
              </div>
            </div>
          </div>

          {/* Popular E-Resources Table */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0B2546]">
                  Peringkat Pemanfaatan Pangkalan Data E-Resources
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Basis data jurnal bereputasi dan statistik ekonomi yang paling sering dirujuk mahasiswa.
                </p>
              </div>
              <Link
                href="/#eresource"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B2546] hover:text-amber-600 transition-colors"
              >
                <span>Buka Direktori E-Resource</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Nama Basis Data</th>
                    <th className="py-3 px-4">Cakupan Keilmuan</th>
                    <th className="py-3 px-4">Volume Penelusuran</th>
                    <th className="py-3 px-4 text-right">Status Aktivitas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {E_RESOURCE_STATS.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{row.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{row.category}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0B2546]">{row.hits}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${row.badgeColor}`}>
                          {row.badge}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* LOOKER STUDIO EMBED MODAL / SECTION */}
          <div className="bg-gradient-to-r from-[#0B2546] to-[#081B33] text-white rounded-3xl p-6 sm:p-8 border border-amber-400/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-extrabold uppercase">
                <span className="material-symbols-outlined text-[14px]">query_stats</span>
                <span>Portal Dasbor Lanjutan</span>
              </div>
              <h3 className="text-xl font-bold">Dasbor Interaktif Google Looker Studio</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Akses laporan multi-dimensi visualisasi grafik kunjungan harian, jam sibuk okupansi ruangan,
                dan pemanfaatan bilik diskusi privat secara real-time.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowEmbed(!showEmbed)}
                className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {showEmbed ? 'Sembunyikan Dasbor' : 'Buka Dasbor Interaktif'}
              </button>
            </div>
          </div>

          {/* EMBEDDED LOOKER STUDIO IFRAME */}
          {showEmbed && (
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-2xl p-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-[#0B2546] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">visibility</span>
                  <span>Pratinjau Langsung: Looker Studio Reporting SAC FEB UB</span>
                </span>
                <a
                  href="https://lookerstudio.google.com/embed/reporting/1f4deba7-9e1e-41b8-a9f0-3ae2a7e9fabf/page/oNSSF"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>Buka di Tab Baru</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>
              <div className="relative aspect-[16/9] w-full bg-slate-100 rounded-2xl overflow-hidden">
                <iframe
                  src="https://lookerstudio.google.com/embed/reporting/1f4deba7-9e1e-41b8-a9f0-3ae2a7e9fabf/page/oNSSF"
                  title="Dasbor Statistik Looker Studio SAC FEB UB"
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
