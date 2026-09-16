'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import ComingSoonNotice, { ComingSoonDetails } from '@/components/ComingSoonNotice';

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
    'Akses dari luar kampus dapat menggunakan portal ezproxy.ub.ac.id dengan login email/SIAM @student.ub.ac.id, atau sambungkan OpenVPN resmi Universitas Brawijaya (vpn.ub.ac.id). Di dalam ruangan SAC Gedung F Lt. 2, perangkat Anda otomatis terhubung tanpa login tambahan via Wi-Fi SAC-FEB.',
  'Cara Cek Turnitin FEB UB':
    'Pengujian orisinalitas Turnitin untuk skripsi/tesis dilayani di meja asistensi SAC Gedung F Lt. 2. Bawa draf file Bab 1 s.d. Bab 5 format .docx/.pdf atau kirim email ke sac.feb@ub.ac.id dengan subjek "Cek Turnitin - NIM - Nama". Laporan similarity index diproses dalam 1x24 jam kerja.',
  'Peminjaman Ruang Diskusi Privat':
    'Bilik Diskusi Privat (Discussion Pods) dapat dipinjam oleh kelompok mahasiswa aktif FEB UB (minimal 3 orang). Fasilitas dilengkapi Smart TV UHD 50" untuk presentasi, whiteboard kaca, AC mandiri, dan stopkontak portabel dengan durasi maksimal 2 jam per sesi.',
  'Jam Operasional & Layanan':
    'SAC Gedung F Lantai 2 melayani pengunjung setiap Senin s.d. Kamis pukul 08.00–16.00 WIB dan Jumat pukul 08.00–15.30 WIB (istirahat 11.00–13.00 WIB). Layanan ditutup pada hari Sabtu, Minggu, dan hari libur nasional.',
};

export default function HomePage() {
  const [searchCategory, setSearchCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [presensiUrl, setPresensiUrl] = useState('/presensi');
  const [linkCopied, setLinkCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        text: 'Terima kasih! Pesan Anda telah diteruskan ke staf pustakawan bertugas di Gedung F Lt. 2.',
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

      {/* TOP ACADEMIC MASTHEAD HEADER */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
        <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          {/* Official Branding Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink min-w-0 group">
            <img
              alt="FEB UB Logo"
              className="h-8 sm:h-10 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
              src="/logo-feb-black.png"
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-black text-[#0B2546] leading-tight tracking-tight font-sans group-hover:text-amber-600 transition-colors truncate">
                  Self Access Centre
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300/60 shrink-0">
                  FEB UB
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold tracking-wider uppercase font-sans truncate">
                Gedung F Lantai 2 • FEB UB
              </span>
            </div>
          </Link>

          {/* Desktop Navigation links (xl:flex) */}
          <nav className="hidden xl:flex items-center gap-1 xl:gap-1.5">
            <a
              href="#hero"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#0B2546] bg-slate-100 border border-slate-200/80 shadow-2xs transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Beranda</span>
            </a>
            <a
              href="#profil"
              className="px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#0B2546] hover:bg-slate-100/80 transition-colors whitespace-nowrap"
            >
              Profil SAC
            </a>
            <a
              href="#layanan"
              className="px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#0B2546] hover:bg-slate-100/80 transition-colors whitespace-nowrap"
            >
              Layanan
            </a>
            <a
              href="#eresource"
              className="px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#0B2546] hover:bg-slate-100/80 transition-colors whitespace-nowrap"
            >
              E-Resource
            </a>
            <Link
              href="/repository"
              className="px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#0B2546] hover:bg-slate-100/80 transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px] text-amber-600">local_library</span>
              <span>Repositori</span>
            </Link>
            <Link
              href="/serah-simpan"
              className="px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#0B2546] hover:bg-slate-100/80 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px] text-[#0B2546]">school</span>
              <span>Serah Simpan</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                SAC-ONE
              </span>
            </Link>
          </nav>

          {/* Right Action Buttons (xl:flex) */}
          <div className="hidden xl:flex items-center gap-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B2546] hover:bg-slate-900 text-amber-300 hover:text-white text-xs font-bold shadow-sm hover:shadow-md transition-all whitespace-nowrap border border-[#0B2546]/30 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-amber-400">how_to_reg</span>
              <span>Daftar Anggota</span>
            </Link>

            <button
              type="button"
              onClick={() => setChatMinimized(false)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300/80 text-xs font-bold transition-all shadow-2xs whitespace-nowrap cursor-pointer active:scale-95 group"
              title="Buka ChatSAC Asisten Virtual"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="material-symbols-outlined text-[16px] text-amber-700 group-hover:rotate-6 transition-transform">
                smart_toy
              </span>
              <span>ChatSAC</span>
              <span className="px-1 py-0.2 rounded text-[9px] font-black bg-amber-300/60 text-amber-950 uppercase">
                AI
              </span>
            </button>
          </div>

          {/* Mobile / Tablet Hamburger Button (xl:hidden) */}
          <div className="flex xl:hidden items-center shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-[#0B2546] hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer shrink-0 shadow-2xs"
              aria-label="Toggle Menu Navigasi"
              id="mobileMenuToggle"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Animated Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="xl:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 py-4 space-y-2.5 shadow-xl max-h-[80vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href="#hero"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#0B2546] bg-slate-100 border border-slate-200 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Beranda Portal</span>
                </a>
                <a
                  href="#profil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-500">info</span>
                  <span>Profil &amp; Tata Tertib SAC</span>
                </a>
                <a
                  href="#layanan"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-500">meeting_room</span>
                  <span>Katalog Layanan &amp; Ruangan</span>
                </a>
                <a
                  href="#eresource"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-500">dataset</span>
                  <span>Database E-Resource</span>
                </a>
                <Link
                  href="/repository"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px] text-amber-600">local_library</span>
                  <span>Katalog Repositori Ilmiah</span>
                </Link>
                <Link
                  href="/serah-simpan"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#0B2546]">school</span>
                    <span>Serah Simpan Karya</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-100 text-blue-800">
                    SAC-ONE
                  </span>
                </Link>
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-2">
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#0B2546] text-amber-300 font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px] text-amber-400">how_to_reg</span>
                  <span>Daftar Anggota SAC</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setChatMinimized(false);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-amber-50 text-amber-950 border border-amber-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-amber-700">smart_toy</span>
                  <span>Buka ChatSAC AI</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MAIN BODY CONTENT */}
      <main className="w-full pt-20 bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          {/* HERO SECTION */}
          <section id="hero" className="relative w-full overflow-hidden bg-surface-container-lowest py-16 lg:py-20 border-b border-outline-variant/60">
            {/* Subtle Institutional Architectural Watermark Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center -rotate-6">
              <svg className="text-primary" fill="none" height="820" stroke="currentColor" viewBox="0 0 100 100" width="820">
                <circle cx="50" cy="50" r="46" strokeDasharray="2 1.5" strokeWidth="0.75" />
                <circle cx="50" cy="50" r="38" strokeWidth="0.5" />
                <path d="M22 65 C32 50, 68 50, 78 65 M22 65 L50 61 L78 65" strokeWidth="0.5" />
                <ellipse cx="50" cy="42" rx="20" ry="18" strokeWidth="0.5" />
              </svg>
            </div>

            <div className="relative max-w-[1280px] mx-auto px-6 lg:px-8">
              <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                {/* Live Academic Operational Status Badge */}
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface-container text-primary shadow-sm mb-6 border border-outline-variant/50">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11.5px] uppercase tracking-wider text-primary font-bold">
                    Buka: 08.00 – 16.00 WIB &bull; Lokasi: Gedung F Lantai 2 FEB UB
                  </span>
                </div>

                {/* Scholarly Main Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-primary tracking-tight leading-tight max-w-3xl">
                  Akses Referensi Ilmiah Global &amp; Ruang Belajar Mandiri
                </h1>

                {/* Institutional Subtitle */}
                <p className="mt-4 text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                  Gerbang kurasi jurnal internasional berlangganan, repositori tugas akhir, dan pusat studi
                  mandiri mahasiswa Fakultas Ekonomi dan Bisnis Universitas Brawijaya.
                </p>

                {/* Main Omnisearch Academic Box */}
                <div className="w-full mt-8 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant p-2 max-w-3xl">
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
                        className="w-full h-full appearance-none bg-surface-container-low text-primary font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:bg-surface-container cursor-pointer transition-colors"
                      >
                        <option value="all">Semua Kategori</option>
                        <option value="jurnal">Jurnal Internasional</option>
                        <option value="skripsi">Skripsi / Tesis / Disertasi</option>
                        <option value="finansial">Database Finansial &amp; BEI</option>
                        <option value="statistik">Data BPS &amp; Makroekonomi</option>
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                        unfold_more
                      </span>
                    </div>

                    {/* Search Input Field */}
                    <div className="relative flex-1 flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-outline text-[22px]">
                        search
                      </span>
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full py-2.5 pl-10 pr-4 text-on-surface placeholder:text-outline text-sm bg-transparent focus:outline-none"
                        placeholder="Cari judul jurnal, skripsi/tesis, atau database ekonomi..."
                        type="text"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="mr-2 text-outline hover:text-on-surface"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      )}
                    </div>

                    {/* Prominent Gold-Navy Action Button */}
                    <button
                      type="submit"
                      className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-[0.99]"
                    >
                      <span className="material-symbols-outlined text-[20px] text-secondary-fixed">
                        manage_search
                      </span>
                      <span>Cari Literatur</span>
                    </button>
                  </form>
                </div>

                {/* Quick Curated Discovery Chips */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-on-surface-variant">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-outline mr-1">
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
                              'Untuk konsultasi format naskah saat ini, silakan hubungi dosen pembimbing Anda atau kunjungi Meja Resepsionis SAC Gedung F Lt. 2.',
                          });
                        } else {
                          handleQuickSearch(chip);
                        }
                      }}
                      className="px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold transition-colors border border-outline-variant/40 cursor-pointer"
                    >
                      {chip}
                    </button>
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
                        Senin – Jumat: 08.00 – 16.00 WIB
                      </h3>
                      <p className="text-xs sm:text-sm text-primary-fixed-dim mt-0.5">
                        Lokasi: Gedung F Lantai 2 FEB UB | Kapasitas Nyaman: 80 Kursi Belajar
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
                            category: 'Ruang Baca Hening • Gedung F Lt. 2',
                            description:
                              'Sistem sensor okupansi real-time dan denah interaktif kubikel meja belajar sedang dipersiapkan untuk memantau 48 kubikel secara live.',
                            estimatedRelease: 'Fase Rilis v1.2 (Semester Ganjil 2026/2027)',
                            alternative:
                              'Silakan langsung datang dan menempati meja belajar yang kosong di Ruang Baca Hening SAC Gedung F Lt. 2.',
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
                              'Reservasi manual dapat dilakukan langsung di Meja Resepsionis SAC Gedung F Lt. 2 dengan menunjukkan KTM atau PIN anggota.',
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
                              'Silakan datang langsung ke Ruang Terminal PC SAC Gedung F Lantai 2. Petugas resepsionis siap membantu aktivasi workstation.',
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
                    Unit penunjang akademik strategis Fakultas Ekonomi dan Bisnis Universitas Brawijaya yang berlokasi di Gedung F Lantai 2. SAC mengintegrasikan akses basis data bereputasi internasional, asistensi statistik, dan ekosistem studi mandiri yang kondusif.
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
                  href="https://wa.me/6281234567890?text=Halo%20Staf%20SAC%20FEB%20UB,%20saya%20ingin%20konsultasi%20layanan%20ruangan%20dan%20e-resource..."
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

      {/* FOOTER */}
      <footer className="w-full bg-primary text-on-primary mt-16">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-surface-container-lowest rounded-lg inline-block">
                <img alt="FEB UB Logo" className="h-7 w-auto object-contain" src="/logo-feb-black.png" />
              </div>
              <span className="text-lg font-bold text-on-primary font-sans">
                Self Access Centre (SAC)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-primary-fixed-dim max-w-md leading-relaxed">
              Pusat rujukan akademik, literatur mandiri, dan fasilitas riset komprehensif bagi civitas akademika
              Fakultas Ekonomi dan Bisnis Universitas Brawijaya.
            </p>
            <div className="flex items-center gap-2 text-secondary-fixed text-xs font-semibold">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span className="uppercase tracking-wider">Layanan Akademik Terakreditasi Unggul</span>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col gap-3">
            <span className="text-base font-semibold text-on-primary">Lokasi &amp; Kontak Resmi</span>
            <div className="flex items-start gap-2 text-primary-fixed-dim text-xs leading-relaxed">
              <span className="material-symbols-outlined text-secondary-fixed text-[18px] shrink-0 mt-0.5">
                location_on
              </span>
              <p>
                Gedung F Lantai 2, Fakultas Ekonomi dan Bisnis Universitas Brawijaya
                <br />
                Jl. MT. Haryono No. 165, Malang 65145, Jawa Timur
              </p>
            </div>
            <div className="flex items-center gap-2 text-primary-fixed-dim text-xs">
              <span className="material-symbols-outlined text-secondary-fixed text-[18px] shrink-0">
                mail
              </span>
              <span>sac.feb@ub.ac.id</span>
            </div>
            <div className="flex items-center gap-2 text-primary-fixed-dim text-xs">
              <span className="material-symbols-outlined text-secondary-fixed text-[18px] shrink-0">
                call
              </span>
              <span>(0341) 555-000 ext. 204</span>
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col gap-3">
            <span className="text-base font-semibold text-on-primary">Jam Operasional</span>
            <div className="bg-primary-container p-4 rounded-xl flex flex-col gap-2 text-primary-fixed-dim text-xs border border-on-primary-container/20">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-on-primary">Senin - Kamis:</span>
                <span>08.00 - 16.00 WIB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-on-primary">Jumat:</span>
                <span>08.00 - 15.30 WIB</span>
              </div>
              <div className="flex justify-between items-center text-outline-variant">
                <span>Sabtu &amp; Minggu:</span>
                <span>Tutup (Libur)</span>
              </div>
              <div className="pt-2 mt-2 border-t border-on-primary-container/30 text-secondary-fixed text-[11px]">
                *Istirahat Jumat: 11.00 - 13.00 WIB
              </div>
            </div>
          </div>
        </div>

        <div className="w-full bg-[#180e00] py-4 border-t border-white/5">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-primary-fixed-dim text-xs">
            <div>© {new Date().getFullYear()} Self Access Centre FEB Universitas Brawijaya. Seluruh hak cipta dilindungi.</div>
            <div className="flex gap-4">
              <Link href="/serah-simpan" className="hover:text-on-primary transition-colors">
                Serah Simpan (SAC-ONE)
              </Link>
              <Link href="/register" className="hover:text-on-primary transition-colors">
                Pendaftaran Anggota
              </Link>
              <Link href="/presensi" className="hover:text-on-primary transition-colors">
                Presensi Ruangan
              </Link>
              <Link href="/admin" className="hover:text-on-primary transition-colors">
                Admin Console
              </Link>
            </div>
          </div>
        </div>
      </footer>

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
                  Scan QR code menggunakan kamera smartphone Anda di pintu masuk Gedung F Lantai 2
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
