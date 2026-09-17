'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import ComingSoonNotice, { ComingSoonDetails } from '@/components/ComingSoonNotice';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface ResourceItem {
  id: string;
  name: string;
  categoryBadge: string;
  accessBadge: string;
  accessIcon: string;
  icon: string;
  accentClass: string;
  iconBgClass: string;
  iconTextClass: string;
  description: string;
  publisher: string;
  actionText: string;
  url: string;
  category: string;
}

const E_RESOURCES: ResourceItem[] = [
  {
    id: 'sciencedirect',
    name: 'ScienceDirect & Scopus',
    categoryBadge: 'Jurnal Internasional',
    accessBadge: 'Akses Akun UB',
    accessIcon: 'lock_open',
    icon: 'public',
    accentClass: 'bg-secondary-fixed-dim',
    iconBgClass: 'bg-primary-container',
    iconTextClass: 'text-secondary-fixed',
    description:
      'Basis data abstrak dan sitasi ilmiah bereputasi Scimago Q1–Q4 untuk literatur ekonomi terapan, keuangan empiris, dan manajemen stratejik.',
    publisher: 'Elsevier B.V.',
    actionText: 'Buka Database',
    url: 'https://www.sciencedirect.com',
    category: 'jurnal',
  },
  {
    id: 'emerald',
    name: 'Emerald & ProQuest',
    categoryBadge: 'Bisnis & Manajemen',
    accessBadge: 'Akses Kampus',
    accessIcon: 'domain',
    icon: 'source_notes',
    accentClass: 'bg-primary-container',
    iconBgClass: 'bg-surface-container',
    iconTextClass: 'text-primary',
    description:
      'Koleksi jurnal peer-reviewed global bidang Akuntansi Publik, Manajemen Pemasaran, Perilaku Organisasi, dan Islamic Banking.',
    publisher: 'ProQuest / Emerald',
    actionText: 'Buka Database',
    url: 'https://www.emerald.com/insight',
    category: 'jurnal',
  },
  {
    id: 'repository',
    name: 'Repositori Skripsi FEB UB',
    categoryBadge: 'Tugas Akhir & Riset Lokal',
    accessBadge: 'Akses Sivitas',
    accessIcon: 'school',
    icon: 'history_edu',
    accentClass: 'bg-secondary-fixed-dim',
    iconBgClass: 'bg-primary-container',
    iconTextClass: 'text-secondary-fixed',
    description:
      'Arsip digital 7.600+ karya ilmiah skripsi S1, tesis S2, dan disertasi S3 mahasiswa FEB UB dengan berkas resmi Google Drive dan pencarian cepat.',
    publisher: 'Katalog SAC FEB UB',
    actionText: 'Buka Katalog Repositori',
    url: '/repository',
    category: 'skripsi',
  },
  {
    id: 'bps',
    name: 'Pojok Statistik BPS FEB',
    categoryBadge: 'Data Sektoral & Makro',
    accessBadge: 'Kerjasama Resmi',
    accessIcon: 'verified',
    icon: 'query_stats',
    accentClass: 'bg-primary-container',
    iconBgClass: 'bg-surface-container',
    iconTextClass: 'text-primary',
    description:
      'Layanan konsultasi data statistik resmi, penyediaan dataset mikro/makro Susenas, Sakernas, dan PDRB untuk keperluan olah data kuantitatif mahasiswa.',
    publisher: 'BPS Jawa Timur',
    actionText: 'Akses Data BPS',
    url: 'https://bps.go.id',
    category: 'statistik',
  },
  {
    id: 'idx',
    name: 'Galeri Investasi & BEI Corner',
    categoryBadge: 'Finansial & Pasar Modal',
    accessBadge: 'Live Data IDX',
    accessIcon: 'monitoring',
    icon: 'candlestick_chart',
    accentClass: 'bg-secondary-fixed-dim',
    iconBgClass: 'bg-primary-container',
    iconTextClass: 'text-secondary-fixed',
    description:
      'Data historis emiten Bursa Efek Indonesia, annual report audit, ICMD, serta terminal edukasi pergerakan indeks saham dan pasar uang global.',
    publisher: 'IDX & FEB UB',
    actionText: 'Akses Galeri Investasi',
    url: 'https://www.idx.co.id',
    category: 'finansial',
  },
  {
    id: 'ebooks',
    name: 'E-Books & Direktori OA',
    categoryBadge: 'Buku Teks Mandiri',
    accessBadge: 'Open Access',
    accessIcon: 'auto_stories',
    icon: 'library_books',
    accentClass: 'bg-primary-container',
    iconBgClass: 'bg-surface-container',
    iconTextClass: 'text-primary',
    description:
      'Direktori buku teks ekonomi terverifikasi, Wiley Online Library, SpringerLink, buku metodologi penelitian, dan kurasi bab esensial gratis mahasiswa.',
    publisher: 'Perpustakaan UB',
    actionText: 'Buka Direktori',
    url: 'https://perpustakaan.ub.ac.id',
    category: 'jurnal',
  },
];

const CATEGORY_TABS = [
  { id: 'all', label: 'Semua Database', icon: 'grid_view' },
  { id: 'jurnal', label: 'Jurnal Internasional', icon: 'public' },
  { id: 'skripsi', label: 'Tugas Akhir / Skripsi', icon: 'history_edu' },
  { id: 'statistik', label: 'Data BPS & Statistik', icon: 'query_stats' },
  { id: 'finansial', label: 'Pasar Modal & BEI', icon: 'candlestick_chart' },
  { id: 'ebook', label: 'E-Book Mandiri', icon: 'library_books' },
];

const FAQ_RESPONSES: Record<string, string> = {
  'Panduan Akses VPN & SSO UB':
    'Akses dari luar kampus dapat menggunakan portal ezproxy.ub.ac.id dengan login email/SIAM @student.ub.ac.id, atau sambungkan EduVPN resmi Universitas Brawijaya (bits.ub.ac.id). Di dalam ruangan SAC Gedung F Pascasarjana Lantai 1, perangkat Anda otomatis terhubung tanpa login tambahan via Wi-Fi SAC-FEB.',
  'Cara Cek Turnitin FEB UB':
    'Pengujian orisinalitas Turnitin untuk skripsi/tesis dilayani di meja asistensi SAC Gedung F Pascasarjana Lantai 1. Bawa draf file Bab 1 s.d. Bab 5 format .docx/.pdf atau kirim email ke sac.feb@ub.ac.id dengan subjek "Cek Turnitin - NIM - Nama". Laporan similarity index diproses dalam 1x24 jam kerja.',
  'Peminjaman Ruang Diskusi Privat':
    'Bilik Diskusi Privat (Discussion Pods) dapat dipinjam oleh kelompok mahasiswa aktif FEB UB (minimal 3 orang). Fasilitas dilengkapi Smart TV UHD 50" untuk presentasi, whiteboard kaca, AC mandiri, dan stopkontak portabel dengan durasi maksimal 2 jam per sesi.',
  'Jam Operasional & Layanan':
    'SAC Gedung F Pascasarjana Lantai 1 melayani pengunjung setiap Senin s.d. Jumat pukul 08.00–15.00 WIB (istirahat Jumat 11.00–13.00 WIB). Layanan ditutup pada hari Sabtu, Minggu, dan hari libur nasional.',
};

const BERANDA_HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80',
    title: 'Ruang Belajar Mandiri & Kolaborasi Mahasiswa',
  },
  {
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1920&q=80',
    title: 'Pusat Studi & Akses E-Resource Ilmiah',
  },
  {
    url: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1920&q=80',
    title: 'Ruang Baca Hening & Konsultasi Riset',
  },
  {
    url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1920&q=80',
    title: 'Fasilitas Akademik Unggul FEB Universitas Brawijaya',
  },
];

export default function HomePage() {
  const [searchCategory, setSearchCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [presensiUrl, setPresensiUrl] = useState('/presensi');
  const [linkCopied, setLinkCopied] = useState(false);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // Auto-advance hero background slider every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % BERANDA_HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // ChatSAC state - Minimized by default to keep page clean & uncluttered
  const [chatMinimized, setChatMinimized] = useState(true);
  const [activeFaq, setActiveFaq] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [userMessages, setUserMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Coming Soon Notification State
  const [comingSoonModalOpen, setComingSoonModalOpen] = useState(false);
  const [comingSoonDetails, setComingSoonDetails] = useState<ComingSoonDetails | null>(null);

  const handleTriggerComingSoon = (details: ComingSoonDetails) => {
    setComingSoonDetails(details);
    setComingSoonModalOpen(true);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPresensiUrl(`${window.location.origin}/presensi`);
    }
  }, []);

  const handleAccessResource = (resource: ResourceItem) => {
    // Tracking API in background
    fetch('/api/log-resource', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceName: resource.name }),
    }).catch((err) => console.error('Error logging resource access:', err));

    setToastMessage(`Membuka akses ke ${resource.name}...`);
    setTimeout(() => setToastMessage(null), 3500);

    if (resource.url.startsWith('/')) {
      window.location.href = resource.url;
      return;
    }

    window.open(resource.url, '_blank', 'noopener,noreferrer');
  };

  const handleQuickSearch = (keyword: string) => {
    setSearchQuery(keyword);
  };

  const handleManualSend = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setUserMessages((prev) => [
      ...prev,
      { sender: 'user', text: msg },
      {
        sender: 'bot',
        text: 'Terima kasih! Pesan Anda telah diteruskan ke staf pustakawan bertugas di Gedung F Pascasarjana Lantai 1.',
      },
    ]);
    setChatInput('');
  };

  const filteredResources = E_RESOURCES.filter((item) => {
    const matchesCategory = searchCategory === 'all' || item.category === searchCategory;
    const matchesQuery =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryBadge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.publisher.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="bg-surface text-on-surface min-h-screen font-sans antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50 flex items-center gap-3 bg-primary text-on-primary px-4 py-3 rounded-lg shadow-xl border border-secondary-fixed"
          >
            <span className="material-symbols-outlined text-secondary-fixed text-[20px] animate-spin">
              sync
            </span>
            <span className="text-sm font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UNIFIED TOP ACADEMIC NAVBAR */}
      <Navbar onChatClick={() => setChatMinimized(false)} />

      {/* MAIN BODY CONTENT */}
      <main className="w-full pt-28 bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          {/* HERO SECTION WITH ANIMATED IMAGE SLIDER & SEAMLESS TRANSITION */}
          <section id="hero" className="relative w-full overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24">
            {/* Continuous Smooth Crossfade Carousel */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              {BERANDA_HERO_SLIDES.map((slide, idx) => (
                <div
                  key={slide.url}
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${slide.url})`,
                    opacity: currentHeroSlide === idx ? 1 : 0,
                    transform: currentHeroSlide === idx ? 'scale(1.04)' : 'scale(1)',
                    transitionProperty: 'opacity, transform',
                    transitionDuration: '1200ms, 8000ms',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              ))}

              {/* Clean solid dark overlay */}
              <div className="absolute inset-0 bg-slate-950/70" />
            </div>

            <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8">
              <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                {/* Live Academic Operational Status Badge */}
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/15 text-white shadow-sm mb-6 border border-white/25 backdrop-blur-xs">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11.5px] uppercase tracking-wider text-white font-bold">
                    Buka: 08.00 – 15.00 WIB &bull; Lokasi: Gedung F Pascasarjana Lantai 1 FEB UB
                  </span>
                </div>

                {/* Scholarly Main Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-white tracking-tight leading-tight max-w-3xl drop-shadow-md">
                  Akses Referensi Ilmiah Global &amp; Ruang Belajar Mandiri
                </h1>

                {/* Institutional Subtitle */}
                <p className="mt-4 text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed drop-shadow-xs">
                  Gerbang kurasi jurnal internasional berlangganan, repositori tugas akhir, dan pusat studi
                  mandiri mahasiswa Fakultas Ekonomi dan Bisnis Universitas Brawijaya.
                </p>

                {/* Main Omnisearch Academic Box */}
                <div className="w-full mt-8 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/40 p-2 max-w-3xl text-slate-800">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                    }}
                    className="flex flex-col sm:flex-row items-stretch gap-2"
                  >
                    {/* Category Dropdown Filter */}
                    <div className="relative sm:w-56 shrink-0">
                      <select
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
                        className="w-full h-full appearance-none bg-slate-100 text-slate-800 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:bg-slate-200 cursor-pointer transition-colors"
                      >
                        <option value="all">Semua Kategori</option>
                        <option value="jurnal">Jurnal Internasional</option>
                        <option value="skripsi">Skripsi / Tesis / Disertasi</option>
                        <option value="finansial">Database Finansial &amp; BEI</option>
                        <option value="statistik">Data BPS &amp; Makroekonomi</option>
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">
                        unfold_more
                      </span>
                    </div>

                    {/* Search Input Field */}
                    <div className="relative flex-1 flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[22px]">
                        search
                      </span>
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full py-2.5 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 text-sm bg-transparent focus:outline-none"
                        placeholder="Cari judul jurnal, skripsi/tesis, atau database ekonomi..."
                        type="text"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="mr-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      )}
                    </div>

                    {/* Prominent Gold-Navy Action Button */}
                    <button
                      type="submit"
                      className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#0B2546] hover:bg-slate-900 text-amber-300 hover:text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        manage_search
                      </span>
                      <span>Cari Literatur</span>
                    </button>
                  </form>
                </div>

                {/* Quick Curated Discovery Chips */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-slate-200">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300 mr-1">
                    Pencarian Populer:
                  </span>
                  {[
                    'ScienceDirect',
                    'Emerald Insight',
                    'Data BPS 2025',
                    'Laporan Keuangan BEI',
                    'Panduan Skripsi FEB',
                  ].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => {
                        if (chip === 'Panduan Skripsi FEB') {
                          handleTriggerComingSoon({
                            title: 'Buku Pedoman Penulisan Skripsi & Tesis FEB UB 2026/2027',
                            category: 'Pedoman Akademik & Format Naskah',
                            description:
                              'Format buku pedoman dan template penulisan naskah revisi 2026 sedang dalam finalisasi oleh Senat Akademik Fakultas. Berkas panduan resmi akan dapat diunduh segera.',
                            estimatedRelease: 'Fase Pembaruan v1.2 (Tahun Akademik 2026/2027)',
                            alternative:
                              'Untuk konsultasi format naskah saat ini, silakan hubungi dosen pembimbing Anda atau kunjungi Meja Resepsionis SAC Gedung F Pascasarjana Lantai 1.',
                          });
                        } else {
                          handleQuickSearch(chip);
                        }
                      }}
                      className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors border border-white/20 cursor-pointer backdrop-blur-xs"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Carousel Slide Indicators (Placed at Bottom of Hero) */}
                <div className="flex items-center gap-2 mt-8">
                  {BERANDA_HERO_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.url}
                      type="button"
                      onClick={() => setCurrentHeroSlide(idx)}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        currentHeroSlide === idx
                          ? 'w-8 h-1.5 bg-amber-400'
                          : 'w-2 h-1.5 bg-white/40 hover:bg-white/75'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CURATED E-RESOURCE GRID SECTION */}
          <section id="eresource" className="w-full py-16 bg-surface">
            <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-secondary text-xs font-bold uppercase tracking-wider mb-1">
                    <span className="material-symbols-outlined text-[16px]">menu_book</span>
                    <span>Koleksi Terindeks &amp; Langganan</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                    Portal Database Ilmiah Unggulan
                  </h2>
                </div>
                <p className="text-on-surface-variant text-xs sm:text-sm max-w-md">
                  Akses resmi terintegrasi Single Sign-On (SSO) UB dan jaringan intranet Gedung F FEB Brawijaya.
                </p>
              </div>

              {/* Interactive Category Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 custom-scrollbar">
                {CATEGORY_TABS.map((tab) => {
                  const isActive = searchCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setSearchCategory(tab.id);
                        if (tab.id === 'skripsi') setSearchQuery('skripsi');
                        else if (tab.id === 'all') setSearchQuery('');
                      }}
                      className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-primary-container text-on-primary shadow-sm'
                          : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/40'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                      <span>{tab.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="categoryActiveIndicator"
                          className="absolute bottom-0 left-3 right-3 h-0.5 bg-secondary-fixed rounded-full"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 6 Curated E-Resource Cards Grid */}
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredResources.map((res) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -6, scale: 1.012 }}
                      transition={{ duration: 0.2 }}
                      key={res.id}
                      className="group bg-surface-container-lowest rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-secondary-fixed/80 transition-all duration-300 flex flex-col justify-between relative overflow-hidden border border-outline-variant/60"
                    >
                      {/* Left vertical accent bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${res.accentClass}`}></div>

                      <div>
                        {/* Badges */}
                        <div className="flex items-start justify-between gap-2 mb-4">
                          <span className="px-2.5 py-1 rounded-md bg-surface-container-high text-primary text-[11px] uppercase tracking-wider font-bold">
                            {res.categoryBadge}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary px-2.5 py-0.5 rounded-full bg-surface-container border border-outline-variant/40">
                            <span className="material-symbols-outlined text-[14px]">{res.accessIcon}</span>
                            <span>{res.accessBadge}</span>
                          </span>
                        </div>

                        {/* Header with Icon */}
                        <div className="flex items-center gap-3.5 mb-3">
                          <div
                            className={`w-12 h-12 rounded-xl ${res.iconBgClass} ${res.iconTextClass} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                          >
                            <span className="material-symbols-outlined text-[26px]">{res.icon}</span>
                          </div>
                          <h3 className="text-lg font-bold text-primary group-hover:text-primary-container transition-colors leading-snug">
                            {res.name}
                          </h3>
                        </div>

                        {/* Description */}
                        <p className="text-on-surface-variant text-sm line-clamp-3 leading-relaxed">
                          {res.description}
                        </p>
                      </div>

                      {/* Footer Action */}
                      <div className="mt-6 pt-4 border-t border-outline-variant/40 flex items-center justify-between">
                        <span className="text-xs text-outline font-medium">{res.publisher}</span>
                        <button
                          onClick={() => handleAccessResource(res)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-primary-container text-primary hover:text-on-primary font-bold text-xs sm:text-sm group-hover:shadow-sm transition-all active:scale-95 cursor-pointer"
                        >
                          <span>Akses Database</span>
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {filteredResources.length === 0 && (
                <div className="text-center py-16 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
                  <span className="material-symbols-outlined text-outline text-[40px] mb-2">
                    search_off
                  </span>
                  <p className="font-semibold text-primary">Tidak ditemukan referensi yang cocok</p>
                  <button
                    onClick={() => {
                      setSearchCategory('all');
                      setSearchQuery('');
                    }}
                    className="mt-3 text-xs text-secondary font-bold underline"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* FACILITIES & ATMOSPHERE SECTION */}
          <section id="layanan" className="w-full py-16 bg-surface-container-low border-t border-outline-variant/50">
            <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
              {/* Institutional Notice Bar (Navy & Gold Accent) */}
              <div className="bg-primary text-on-primary rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden mb-12">
                <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-primary-container to-transparent pointer-events-none opacity-40"></div>
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-secondary-fixed text-primary flex items-center justify-center shrink-0 shadow">
                      <span className="material-symbols-outlined text-[32px]">schedule</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-secondary-fixed text-xs uppercase font-bold tracking-wider">
                        <span>Informasi Kunjungan Fisik</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl text-on-primary font-bold">
                        Senin – Jumat: 08.00 – 15.00 WIB
                      </h3>
                      <p className="text-xs sm:text-sm text-primary-fixed-dim mt-0.5">
                        Lokasi: Gedung F Pascasarjana Lantai 1 FEB UB | Kapasitas Nyaman: 80 Kursi Belajar
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                    <div className="px-4 py-2 rounded-xl bg-primary-container text-primary-fixed flex items-center gap-2 w-full md:w-auto justify-center border border-on-primary-container/20">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-xs sm:text-sm font-semibold text-on-primary">
                        Status: Terbuka untuk Mahasiswa Aktif
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Highlight Layout: Photo + 3 Structural Facility Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Visual Presentation Image */}
                <div className="lg:col-span-5 flex flex-col">
                  <div className="relative w-full h-full min-h-[340px] rounded-2xl overflow-hidden shadow-md group border border-outline-variant/60">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt="Interior SAC FEB UB Study Hall"
                      src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent flex flex-col justify-end p-6 text-on-primary">
                      <span className="text-xs uppercase tracking-wider text-secondary-fixed font-bold">
                        Fasilitas Berstandar Unggul
                      </span>
                      <h4 className="text-lg font-bold text-on-primary mt-1">
                        Lingkungan Riset Nyaman &amp; Terfasilitasi
                      </h4>
                      <p className="text-xs text-primary-fixed-dim mt-1">
                        Dirancang khusus untuk mendukung konsentrasi penulisan skripsi dan kolaborasi riset dosen-mahasiswa.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3 Feature Highlight Cards (Vertical Stack) */}
                <div className="lg:col-span-7 flex flex-col justify-between gap-4">
                  {/* Item 1: Ruang Baca Hening */}
                  <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4 border border-outline-variant/60">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[26px]">volume_off</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-base font-bold text-primary">
                            Ruang Baca Hening (Silent Study Area)
                          </h4>
                          <span className="text-xs px-2.5 py-0.5 rounded bg-surface-container font-semibold text-outline">
                            48 Meja
                          </span>
                        </div>
                        <p className="text-on-surface-variant text-sm leading-relaxed">
                          Zona studi bebas kebisingan dengan sekat meja privasi individual, lampu baca terintegrasi, dan terminal daya listrik di setiap kubikel.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-outline-variant/40">
                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>48 Kubikel Belajar Aktif</span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleTriggerComingSoon({
                            title: 'Pemantauan Okupansi Meja Belajar IoT',
                            category: 'Ruang Baca Hening • Gedung F Pascasarjana Lantai 1',
                            description:
                              'Sistem sensor okupansi real-time dan denah interaktif kubikel meja belajar sedang dipersiapkan untuk memantau 48 kubikel secara live.',
                            estimatedRelease: 'Fase Rilis v1.2 (Semester Ganjil 2026/2027)',
                            alternative:
                              'Silakan langsung datang dan menempati meja belajar yang kosong di Ruang Baca Hening SAC Gedung F Pascasarjana Lantai 1.',
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-primary-container text-primary hover:text-on-primary font-bold text-xs transition-colors cursor-pointer"
                      >
                        <span>Lihat Denah &amp; Status Meja</span>
                        <span className="material-symbols-outlined text-[15px]">sensors</span>
                      </button>
                    </div>
                  </div>

                  {/* Item 2: Bilik Diskusi Kelompok */}
                  <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4 border border-outline-variant/60">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-fixed flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[26px]">groups</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-base font-bold text-primary">
                            Ruang Diskusi Privat (Discussion Pods)
                          </h4>
                          <span className="text-xs px-2.5 py-0.5 rounded bg-secondary-container font-semibold text-on-secondary-fixed">
                            4 Ruangan
                          </span>
                        </div>
                        <p className="text-on-surface-variant text-sm leading-relaxed">
                          Empat ruang rapat kedap suara yang dilengkapi Smart TV UHD 50" untuk presentasi, whiteboard kaca, dan sistem ventilasi sejuk mandiri.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-outline-variant/40">
                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-amber-600">
                          event_seat
                        </span>
                        <span>Kapasitas: 4–6 Mahasiswa/Pod</span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleTriggerComingSoon({
                            title: 'Reservasi Online Discussion Pods',
                            category: 'Ruang Diskusi Mandiri & Kelompok',
                            description:
                              'Modul pemesanan daring slot waktu diskusi, integrasi kalender akademik, dan konfirmasi otomatis berbasis PIN Anggota sedang dalam tahap pengembangan.',
                            estimatedRelease: 'Fase Rilis v1.2',
                            alternative:
                              'Reservasi manual dapat dilakukan langsung di Meja Resepsionis SAC Gedung F Pascasarjana Lantai 1 dengan menunjukkan KTM atau PIN anggota.',
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary-container hover:bg-amber-400 text-on-secondary-fixed hover:text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <span>Reservasi Online Pod</span>
                        <span className="material-symbols-outlined text-[15px]">calendar_add_on</span>
                      </button>
                    </div>
                  </div>

                  {/* Item 3: Komputer Riset & Data */}
                  <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4 border border-outline-variant/60">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[26px]">desktop_windows</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-base font-bold text-primary">
                            24 Terminal PC Riset &amp; Laboratorium Data
                          </h4>
                          <span className="text-xs px-2.5 py-0.5 rounded bg-surface-container font-semibold text-outline">
                            24 Unit PC
                          </span>
                        </div>
                        <p className="text-on-surface-variant text-sm leading-relaxed">
                          Workstation berspesifikasi tinggi terinstal software olah data statistik terlisensi (SPSS, Stata, EViews, AMOS) serta jalur intranet ultra-cepat.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-outline-variant/40">
                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-blue-600">
                          terminal
                        </span>
                        <span>SPSS, Stata, EViews, AMOS</span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleTriggerComingSoon({
                            title: 'Cek Antrean & Ketersediaan PC Riset',
                            category: 'Laboratorium Data & Workstation FEB',
                            description:
                              'Sistem antrean digital dan pemantauan terminal workstation SPSS/Stata/EViews secara real-time sedang dihubungkan ke jaringan server lokal SAC.',
                            estimatedRelease: 'Fase Rilis v1.2',
                            alternative:
                              'Silakan datang langsung ke Ruang Terminal PC SAC Gedung F Pascasarjana Lantai 1. Petugas resepsionis siap membantu aktivasi workstation.',
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-primary-container text-primary hover:text-on-primary font-bold text-xs transition-colors cursor-pointer"
                      >
                        <span>Cek Antrean PC</span>
                        <span className="material-symbols-outlined text-[15px]">
                          desktop_access_disabled
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PROFIL SAC & TATA TERTIB RUANGAN SECTION */}
          <section id="profil" className="w-full py-16 bg-surface-container-lowest border-t border-outline-variant/60">
            <div className="max-w-[1280px] mx-auto px-6 lg:px-8 flex flex-col gap-10">
              {/* Profile Intro */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-1.5 text-secondary text-xs font-bold uppercase tracking-wider mb-1">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    <span>Profil &amp; Tata Tertib Ruangan</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                    Self Access Centre (SAC) FEB UB
                  </h2>
                  <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">
                    Unit penunjang akademik strategis Fakultas Ekonomi dan Bisnis Universitas Brawijaya yang berlokasi di Gedung F Pascasarjana Lantai 1. SAC mengintegrasikan akses basis data bereputasi internasional, asistensi statistik, dan ekosistem studi mandiri yang kondusif.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <Link
                    href="/presensi"
                    className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary hover:bg-primary font-bold text-xs sm:text-sm shadow-sm transition-all"
                  >
                    Buka Buku Tamu Digital
                  </Link>
                </div>
              </div>

              {/* 3 Core Room Rules Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex flex-col gap-3 shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-[26px]">do_not_step</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-primary">1. Melepas Sepatu</h3>
                    <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                      Pengunjung wajib melepas sepatu dan menyimpannya rapi pada rak sepatu yang tersedia di area resepsionis luar pintu masuk.
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex flex-col gap-3 shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[26px]">checkroom</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-primary">2. Memakai Sandal SAC</h3>
                    <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                      Wajib mengenakan sandal khusus SAC yang telah disterilisasi selama berada di dalam ruangan guna menjaga kebersihan karpet dan kenyamanan bersama.
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex flex-col gap-3 shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[26px]">volume_off</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-primary">3. Menjaga Ketenangan Ruangan</h3>
                    <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                      Pengunjung wajib menjaga ketenangan suasana ruangan, tidak membuat kegaduhan, dan mengatur ponsel ke mode hening demi kenyamanan belajar bersama.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FLOATING VIRTUAL ASSISTANT: ChatSAC (Minimized Floating Pill Launcher & Animated Chat Dialog) */}
      <AnimatePresence>
        {chatMinimized ? (
          <motion.button
            key="chat-launcher"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setChatMinimized(false)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-2.5 bg-primary-container text-on-primary rounded-full shadow-2xl border border-secondary-fixed/40 hover:border-secondary-fixed hover:shadow-primary-container/40 transition-all group"
            id="chatSacLauncher"
            aria-label="Buka ChatSAC Asisten Virtual Layanan"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-secondary-fixed text-primary flex items-center justify-center font-bold shadow-inner">
                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-primary-container animate-pulse"></span>
            </div>
            <div className="text-left pr-1 hidden sm:block">
              <div className="text-xs font-bold text-on-primary flex items-center gap-1.5">
                <span>ChatSAC</span>
                <span className="px-1 py-0.2 rounded text-[9px] bg-secondary-fixed text-primary font-bold uppercase">
                  Online
                </span>
              </div>
              <div className="text-[11px] text-primary-fixed-dim">Bantuan &amp; FAQ Layanan</div>
            </div>
          </motion.button>
        ) : (
          <motion.aside
            key="chat-panel"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-40 w-[360px] max-w-[calc(100vw-2rem)] shadow-2xl rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant transition-all flex flex-col max-h-[580px]"
            id="chatSacWidget"
          >
            {/* Header with Online Badge */}
            <div className="bg-primary-container p-4 text-on-primary flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-secondary-fixed text-primary flex items-center justify-center font-bold text-[14px]">
                    <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-primary-container"></span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-on-primary leading-tight">ChatSAC</span>
                    <span className="px-1.5 py-0.5 rounded bg-surface-container/20 text-[10px] text-secondary-fixed font-semibold uppercase">
                      Online
                    </span>
                  </div>
                  <span className="text-[11px] text-primary-fixed-dim">Asisten Virtual Layanan SAC FEB</span>
                </div>
              </div>
              <button
                aria-label="Tutup jendela chat"
                onClick={() => setChatMinimized(true)}
                className="text-primary-fixed-dim hover:text-on-primary p-1.5 rounded-lg hover:bg-surface-container/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* ChatSAC Body */}
            <div className="p-4 flex flex-col gap-3 overflow-y-auto max-h-[460px]">
              {/* Bot Message Bubble */}
              <div className="bg-surface-container-low rounded-xl rounded-tl-none p-3 text-on-surface border border-outline-variant/40">
                <p className="text-xs leading-relaxed">
                  Halo Mahasiswa FEB UB! Ada yang bisa kami bantu seputar referensi ilmiah, jurnal
                  berlangganan, atau peminjaman ruang belajar?
                </p>
              </div>

              {/* User Interaction History */}
              {userMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-primary-container text-on-primary self-end ml-8 rounded-tr-none'
                      : 'bg-surface-container-low text-on-surface self-start mr-8 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
              ))}

              {/* FAQ Pills Container */}
              <div className="flex flex-col gap-1.5 mt-1">
                <span className="text-[11px] uppercase tracking-wider text-outline font-semibold mb-0.5">
                  Pertanyaan Cepat FAQ:
                </span>
                {[
                  'Panduan Akses VPN & SSO UB',
                  'Cara Cek Turnitin FEB UB',
                  'Peminjaman Ruang Diskusi Privat',
                  'Jam Operasional & Layanan',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setActiveFaq(activeFaq === q ? null : q)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-medium transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <span>{q}</span>
                    <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-primary">
                      {activeFaq === q ? 'expand_less' : 'chevron_right'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Quick Interactive Response Output Box */}
              {activeFaq && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 bg-surface-container-high rounded-lg text-primary text-xs border border-outline-variant/60"
                >
                  <div className="font-bold text-[11px] mb-1 text-primary">
                    Jawaban: {activeFaq}
                  </div>
                  <p className="leading-relaxed">{FAQ_RESPONSES[activeFaq]}</p>
                </motion.div>
              )}

              {/* Direct WhatsApp Staff Support Button */}
              <div className="pt-1">
                <a
                  href="https://wa.me/6282315377515?text=Halo%20Staf%20SAC%20FEB%20UB,%20saya%20ingin%20konsultasi%20layanan%20ruangan%20dan%20e-resource..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98"
                >
                  <span className="material-symbols-outlined text-[17px]">chat</span>
                  <span>Hubungi Staf via WhatsApp</span>
                </a>
              </div>

              {/* Input placeholder for text enquiry */}
              <div className="pt-2 flex items-center gap-2 border-t border-outline-variant/40 mt-auto">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleManualSend();
                  }}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
                  placeholder="Tulis pertanyaan Anda..."
                  type="text"
                />
                <button
                  onClick={handleManualSend}
                  aria-label="Kirim pesan"
                  className="p-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* UNIFIED GLOBAL FOOTER */}
      <Footer />

      {/* MODAL: QR CODE PRESENSI RUANGAN */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-outline-variant relative"
            >
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-outline hover:text-on-surface hover:bg-surface-container transition"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>

              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-fixed flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <span className="material-symbols-outlined text-[28px]">qr_code_scanner</span>
                </div>
                <h3 className="text-xl font-bold text-primary font-sans">
                  Presensi Pengunjung SAC FEB UB
                </h3>
                <p className="text-xs text-on-surface-variant mt-1 mb-5">
                  Scan QR code menggunakan kamera smartphone Anda di pintu masuk Gedung F Pascasarjana Lantai 1
                </p>

                {/* High Resolution QR Code */}
                <div className="bg-surface-container-low p-4 rounded-xl border-2 border-dashed border-secondary inline-block mb-4">
                  <QRCodeSVG
                    value={presensiUrl}
                    size={200}
                    level="H"
                    includeMargin
                    fgColor="#0B2546"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-surface-container rounded-lg mb-5 border border-outline-variant/50">
                  <span className="text-xs font-mono text-outline truncate">{presensiUrl}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== 'undefined') {
                        navigator.clipboard.writeText(presensiUrl);
                        setLinkCopied(true);
                        setTimeout(() => setLinkCopied(false), 2500);
                      }
                    }}
                    className="shrink-0 px-2.5 py-1 rounded bg-surface-container-high hover:bg-primary-container text-primary hover:text-on-primary text-[11px] font-semibold transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {linkCopied ? 'done' : 'content_copy'}
                    </span>
                    <span>{linkCopied ? 'Tersalin!' : 'Salin'}</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href="/presensi"
                    className="w-full py-2.5 px-4 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-sm"
                  >
                    <span>Buka Form Presensi Mobile</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>

                  <button
                    onClick={() => setShowQrModal(false)}
                    className="w-full py-2 text-xs text-on-surface-variant hover:text-on-surface font-medium"
                  >
                    Tutup Jendela
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: FITUR SEGERA HADIR (COMING SOON NOTICE) */}
      <ComingSoonNotice
        isOpen={comingSoonModalOpen}
        onClose={() => setComingSoonModalOpen(false)}
        details={comingSoonDetails}
        onOpenChat={() => setChatMinimized(false)}
      />
    </div>
  );
}
