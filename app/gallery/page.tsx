'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface VideoItem {
  id: string; // YouTube Video ID
  title: string;
  category: 'Etika & Fasilitas' | 'Metodologi Penelitian' | 'Literasi Digital';
  duration: string;
  description: string;
}

const VIDEOS: VideoItem[] = [
  {
    id: '3v_AhB3kx_0',
    title: 'Tata Tertib & Etika Pengunjung SAC FEB UB',
    category: 'Etika & Fasilitas',
    duration: '04:12',
    description:
      'Panduan etika berpakaian sopan, SOP penggunaan loker mandiri, batas suci alas kaki, dan ketertiban area baca hening.',
  },
  {
    id: 'Av3C5c_CtKg',
    title: 'Eksplorasi Fasilitas & Layanan Mandiri SAC FEB UB',
    category: 'Etika & Fasilitas',
    duration: '05:48',
    description:
      'Mengenal bilik diskusi privat (discussion pods), terminal workstation riset SPSS/Stata, dan koleksi literatur fisik.',
  },
  {
    id: 'f6EaLKLvCd4',
    title: 'Pelatihan Metodologi Penelitian Kuantitatif - Bagian #1',
    category: 'Metodologi Penelitian',
    duration: '45:10',
    description:
      'Sesi fundamental perumusan hipotesis penelitian ekonomi terapan, identifikasi variabel, dan teknik operasionalisasi konsep.',
  },
  {
    id: '5oeki8kbTC0',
    title: 'Pelatihan Metodologi Penelitian Kuantitatif - Bagian #2',
    category: 'Metodologi Penelitian',
    duration: '48:35',
    description:
      'Lanjutan pengujian asumsi klasik, analisis regresi data sekunder, dan interpretasi output statistik estimasi model.',
  },
  {
    id: '18l5EBW8um8',
    title: 'Workshop Penulisan & Kajian Pustaka Komprehensif',
    category: 'Metodologi Penelitian',
    duration: '38:22',
    description:
      'Teknik sintesis literatur ilmiah, pemetaan matriks jurnal (literature mapping), serta perumusan research gap yang kuat.',
  },
  {
    id: 'XB55d1f4OLg',
    title: 'Best Practices Penulisan Research Paper Terindeks Internasional',
    category: 'Metodologi Penelitian',
    duration: '42:15',
    description:
      'Kiat menyusun naskah artikel ilmiah berstandar Scopus/SINTA, pemilihan target jurnal, dan merespons review editor.',
  },
  {
    id: 'D3O65FdoXU8',
    title: 'Penyusunan Kerangka Konseptual & Model Hipotesis Riset',
    category: 'Metodologi Penelitian',
    duration: '35:40',
    description:
      'Panduan membuat kerangka pemikiran teoritis yang runut dan menghubungkan landasan teori dengan variabel empiris.',
  },
  {
    id: 'vHttFDdHHd8',
    title: 'Komponen Dasar Penelitian Ilmiah - Sesi 1',
    category: 'Metodologi Penelitian',
    duration: '29:50',
    description:
      'Pemahaman paradigma penelitian, latar belakang masalah yang berbobot, dan batasan ruang lingkup riset skripsi/tesis.',
  },
  {
    id: 'U-4d_wDMp1s',
    title: 'Komponen Dasar Penelitian Ilmiah - Sesi 2',
    category: 'Metodologi Penelitian',
    duration: '32:18',
    description:
      'Teknik penentuan populasi, purposive sampling, perancangan instrumen kuesioner, dan uji reliabilitas data.',
  },
  {
    id: 'KyCd93aLfv8',
    title: 'Tutorial Penelusuran Koleksi Digital Inlislite Perpustakaan',
    category: 'Literasi Digital',
    duration: '11:45',
    description:
      'Panduan navigasi sistem otomasi perpustakaan Inlislite, penelusuran katalog OPAC, dan reservasi buku digital.',
  },
  {
    id: 'YDOgvOSmG0g',
    title: 'Pelatihan Peningkatan Layanan Literasi Tenaga Kependidikan',
    category: 'Literasi Digital',
    duration: '27:30',
    description:
      'Workshop peningkatan kompetensi staf layanan referensi, temu balik informasi ilmiah, dan asistensi penelusuran mahasiswa.',
  },
];

const CATEGORIES = ['Semua', 'Etika & Fasilitas', 'Metodologi Penelitian', 'Literasi Digital'] as const;

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  const filteredVideos =
    selectedCategory === 'Semua'
      ? VIDEOS
      : VIDEOS.filter((v) => v.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col justify-between">
      <Navbar />

      <main className="w-full pt-20">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0B2546] to-[#081B33] text-white py-12 lg:py-16">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center -rotate-6">
            <span className="material-symbols-outlined text-[600px] text-white">play_circle</span>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-400/40">
              <span className="material-symbols-outlined text-[16px]">ondemand_video</span>
              <span>Pusat Edukasi Literasi &amp; Video Pelatihan Riset</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
              Galeri Edukasi &amp; Workshop <br className="hidden sm:inline" />
              <span className="text-amber-400">SAC FEB Universitas Brawijaya</span>
            </h1>

            <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">
              Kumpulan video resmi pelatihan metodologi penelitian kuantitatif, penulisan artikel ilmiah,
              serta pengenalan fasilitas dan etika ruang baca di Gedung F Pascasarjana Lantai 1.
            </p>

            {/* CATEGORY FILTER PILLS */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* VIDEOS GRID */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0B2546]">
                Daftar Video Pelatihan ({filteredVideos.length})
              </h2>
              <p className="text-xs text-slate-500">
                Klik kartu video untuk memutar materi pelatihan secara langsung.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => setActiveVideo(video)}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between hover:border-amber-400/80"
              >
                <div>
                  {/* Video Thumbnail Wrapper */}
                  <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                    <img
                      src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#0B2546]/90 text-amber-400 border border-amber-400/40 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <span className="material-symbols-outlined text-[28px] translate-x-0.5">
                          play_arrow
                        </span>
                      </div>
                    </div>

                    {/* Duration badge */}
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-white text-[11px] font-mono font-bold">
                      {video.duration}
                    </span>

                    {/* Category pill */}
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-[#0B2546]/90 text-amber-300 text-[10px] font-extrabold border border-amber-400/30">
                      {video.category}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#0B2546] leading-snug line-clamp-2 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex items-center justify-between text-xs font-bold text-[#0B2546]">
                  <span className="inline-flex items-center gap-1 text-amber-600">
                    <span className="material-symbols-outlined text-[16px]">play_circle</span>
                    <span>Tonton Video</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">YouTube SAC FEB</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* MODAL VIDEO PLAYER */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#0B2546] text-white px-6 py-4 flex items-center justify-between border-b border-amber-400/30">
              <div className="flex items-center gap-2 truncate pr-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-400 text-slate-950 uppercase">
                  {activeVideo.category}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {activeVideo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                aria-label="Tutup pemutar video"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Video Player Iframe */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Modal Footer Description */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <p className="text-slate-600 leading-relaxed max-w-2xl">
                {activeVideo.description}
              </p>
              <a
                href={`https://www.youtube.com/watch?v=${activeVideo.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shrink-0 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                <span>Buka di YouTube</span>
              </a>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
