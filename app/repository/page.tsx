'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ComingSoonNotice, { ComingSoonDetails } from '@/components/ComingSoonNotice';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface RepositoryDocument {
  id: string;
  nomor: string | null;
  nama: string;
  nim: string;
  prodi: string;
  judul: string;
  judulEn: string | null;
  jenis: string;
  pembimbing: string | null;
  penguji1: string | null;
  penguji2: string | null;
  bagianAwalUrl: string | null;
  bagianIsiUrl: string | null;
  bagianAkhirUrl: string | null;
  viewCount: number;
  downloadCount: number;
}

interface SearchResponse {
  data: RepositoryDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta: {
    cached: boolean;
    executionTimeMs: number;
    cacheKey: string;
  };
}

const PRODI_LIST = [
  'Semua Program Studi',
  'S1 Manajemen',
  'S1 Akuntansi',
  'S1 Ekonomi Pembangunan',
  'S1 Ekonomi Islam',
  'S1 Kewirausahaan',
  'S1 Ekonomi Keuangan dan Perbankan',
  'S2 Magister Manajemen',
  'S2 Magister Akuntansi',
  'S2 Magister Ilmu Ekonomi',
  'S3 Doktor Ilmu Manajemen',
  'S3 Doktor Ilmu Akuntansi',
  'S3 Doktor Ilmu Ekonomi',
];

const JENIS_TABS = ['Semua', 'Skripsi', 'Tesis', 'Disertasi'];

const POPULAR_KEYWORDS = [
  'Kewirausahaan',
  'Good Corporate Governance',
  'Emisi Karbon',
  'Transfer Pricing',
  'Financial Distress',
  'Islamic Banking',
  'Audit Delay',
  'Keputusan Investasi',
];

const HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1920&q=80',
    caption: 'Ruang Baca & Koleksi Tugas Akhir Gedung F',
  },
  {
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80',
    caption: 'Pusat Riset Sivitas Akademika FEB UB',
  },
  {
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1920&q=80',
    caption: 'Arsip Digital Skripsi, Tesis, & Disertasi',
  },
  {
    url: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1920&q=80',
    caption: 'Layanan Repositori Ilmiah Terpadu',
  },
];

export default function RepositoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProdi, setSelectedProdi] = useState('Semua Program Studi');
  const [selectedJenis, setSelectedJenis] = useState('Semua');
  const [page, setPage] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance hero background slider every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [lastTrackedQuery, setLastTrackedQuery] = useState('');

  // Toast notification for file tracking feedback
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  // Coming Soon Notification State
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [comingSoonDetails, setComingSoonDetails] = useState<ComingSoonDetails | null>(null);

  const handleTriggerComingSoon = (details: ComingSoonDetails) => {
    setComingSoonDetails(details);
    setComingSoonOpen(true);
  };

  const searchInputRef = useRef<HTMLInputElement>(null);

  const triggerToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 2800);
  };

  // Activity Tracking Helper
  const trackActivity = async (payload: {
    aktifitas: string;
    documentId?: string;
    kataKunci?: string;
  }) => {
    try {
      let storedNim = '';
      let storedNama = '';
      let storedProdi = '';
      if (typeof window !== 'undefined') {
        storedNim = localStorage.getItem('sac_user_nim') || '';
        storedNama = localStorage.getItem('sac_user_nama') || '';
        storedProdi = localStorage.getItem('sac_user_prodi') || '';
      }

      await fetch('/api/repository/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          nim: storedNim || undefined,
          nama: storedNama || undefined,
          prodi: storedProdi || undefined,
        }),
      });
    } catch (e) {
      console.warn('[Track Activity Failed]:', e);
    }
  };

  // Fetch Documents
  const fetchDocuments = useCallback(
    async (currentPage = page, query = searchQuery, prodi = selectedProdi, jenis = selectedJenis) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set('q', query.trim());
        if (prodi !== 'Semua Program Studi') params.set('prodi', prodi);
        if (jenis !== 'Semua') params.set('jenis', jenis);
        params.set('page', String(currentPage));
        params.set('limit', '12');

        const res = await fetch(`/api/repository/search?${params.toString()}`);
        if (!res.ok) throw new Error('Gagal memuat repositori');
        const data: SearchResponse = await res.json();
        setResults(data);

        // Track SEARCH activity if new non-empty query
        const trimmed = query.trim();
        if (trimmed && trimmed !== lastTrackedQuery) {
          setLastTrackedQuery(trimmed);
          trackActivity({ aktifitas: 'SEARCH', kataKunci: trimmed });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, selectedProdi, selectedJenis, page, lastTrackedQuery]
  );

  useEffect(() => {
    fetchDocuments(page, searchQuery, selectedProdi, selectedJenis);
  }, [page, selectedProdi, selectedJenis]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDocuments(1, searchQuery, selectedProdi, selectedJenis);
  };

  const handleKeywordClick = (kw: string) => {
    setSearchQuery(kw);
    setPage(1);
    fetchDocuments(1, kw, selectedProdi, selectedJenis);
  };

  const handleFileClick = (
    docId: string,
    url: string | null,
    type: 'CLICK_AWAL' | 'CLICK_ISI' | 'CLICK_AKHIR',
    label: string
  ) => {
    if (!url) {
      handleTriggerComingSoon({
        title: `Berkas ${label} Belum Tersedia Online`,
        category: 'Kurasi Arsip Repositori FEB UB',
        description:
          'Naskah karya ilmiah ini sedang dalam proses alih media digital berkas repositori atau berstatus pembatasan embargo publikasi fakultas. Naskah cetak fisik dapat dibaca langsung di SAC Gedung F Pascasarjana Lantai 1.',
        estimatedRelease: 'Digitalisasi Bertahap Tahun Akademik 2026',
        alternative:
          'Silakan kunjungi Meja Resepsionis SAC Gedung F Pascasarjana Lantai 1 dengan membawa KTM Anda untuk membaca naskah fisik di Ruang Baca Hening.',
      });
      return;
    }

    // Open file in new tab immediately
    window.open(url, '_blank', 'noopener,noreferrer');

    // Fire tracking asynchronously
    trackActivity({
      documentId: docId,
      aktifitas: type,
    });

    triggerToast(`Membuka ${label} (Aktivitas dicatat ke sistem)`);
  };

  const getJenisBadgeColor = (jenis: string) => {
    const j = jenis.toLowerCase();
    if (j.includes('disertasi')) {
      return 'bg-purple-100 text-purple-900 border-purple-200';
    }
    if (j.includes('tesis')) {
      return 'bg-emerald-100 text-emerald-900 border-emerald-200';
    }
    return 'bg-blue-100 text-blue-900 border-blue-200';
  };

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-2xl border border-secondary-fixed text-sm font-medium"
          >
            <span className="material-symbols-outlined text-secondary-fixed text-[20px]">
              check_circle
            </span>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UNIFIED TOP ACADEMIC NAVBAR */}
      <Navbar />

      {/* HERO SECTION WITH ANIMATED IMAGE SLIDER & SEAMLESS TRANSITION */}
      <section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24">
        {/* Continuous Smooth Crossfade Carousel without flash or re-render stutter */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.url}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${slide.url})`,
                opacity: currentSlide === idx ? 1 : 0,
                transform: currentSlide === idx ? 'scale(1.04)' : 'scale(1)',
                transitionProperty: 'opacity, transform',
                transitionDuration: '1200ms, 8000ms',
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          ))}

          {/* Clean solid dark overlay */}
          <div className="absolute inset-0 bg-slate-950/70" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
            Repositori Riset Ilmiah Digital <br className="hidden sm:inline" />
            <span className="text-amber-300">
              FEB Universitas Brawijaya
            </span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-200 max-w-2xl font-normal leading-relaxed drop-shadow-xs">
            Akses instan unduh dokumen PDF tugas akhir mahasiswa (Bagian Awal, Bagian Isi, dan Bagian Akhir)
            dengan integrasi penyimpanan cloud Google Drive terindeks.
          </p>

          {/* MAIN SEARCH BOX */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-3xl mt-8 flex flex-col sm:flex-row items-stretch gap-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-white/40 focus-within:ring-2 focus-within:ring-amber-400/60 transition-all"
          >
            <div className="relative flex-1 flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-[#0B2546] text-[22px]">
                search
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul naskah, nama mahasiswa, NIM, atau dosen pembimbing..."
                className="w-full pl-12 pr-4 py-3.5 bg-transparent text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    fetchDocuments(1, '', selectedProdi, selectedJenis);
                  }}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#0B2546] hover:bg-slate-900 text-amber-300 hover:text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[19px]">manage_search</span>
              <span>Cari Naskah</span>
            </button>
          </form>

          {/* POPULAR KEYWORDS CHIPS */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-200 max-w-3xl">
            <span className="font-semibold text-amber-300 mr-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">trending_up</span>
              Populer:
            </span>
            {POPULAR_KEYWORDS.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => handleKeywordClick(kw)}
                className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium border border-white/20 transition-colors cursor-pointer backdrop-blur-xs"
              >
                {kw}
              </button>
            ))}
          </div>

          {/* Carousel Slide Indicators (Placed at Bottom of Hero) */}
          <div className="flex items-center gap-2 mt-8">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.url}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentSlide === idx
                    ? 'w-8 h-1.5 bg-amber-400'
                    : 'w-2 h-1.5 bg-white/40 hover:bg-white/75'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CONTENT AREA: FILTERS & DOCUMENT GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TOOLBAR: PRODI DROPDOWN, JENIS TABS, AND METRICS */}
        <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-outline-variant shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Prodi Dropdown */}
            <div className="relative min-w-[240px]">
              <select
                value={selectedProdi}
                onChange={(e) => {
                  setSelectedProdi(e.target.value);
                  setPage(1);
                }}
                className="w-full appearance-none pl-3.5 pr-9 py-2.5 rounded-xl bg-surface-container-low text-xs font-semibold text-primary border border-outline-variant/80 hover:border-primary focus:outline-hidden focus:ring-2 focus:ring-secondary/50 cursor-pointer"
              >
                {PRODI_LIST.map((prodi) => (
                  <option key={prodi} value={prodi}>
                    {prodi}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-[18px]">
                arrow_drop_down
              </span>
            </div>

            {/* Jenis Tabs */}
            <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-xl border border-outline-variant/60">
              {JENIS_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setSelectedJenis(tab);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedJenis === tab
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* DOCUMENTS LIST / GRID */}
        <div className="mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant">
              <span className="material-symbols-outlined text-primary text-[42px] animate-spin">
                sync
              </span>
              <p className="mt-3 text-sm font-semibold text-primary">Memuat naskah repositori FEB UB...</p>
              <p className="text-xs text-on-surface-variant">Memuat data repositori ilmiah...</p>
            </div>
          ) : !results || results.data.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant p-8">
              <span className="material-symbols-outlined text-outline text-[48px]">
                content_paste_off
              </span>
              <h3 className="mt-2 text-base font-bold text-on-surface">Tidak Ditemukan Karya Ilmiah</h3>
              <p className="mt-1 text-xs text-on-surface-variant max-w-md mx-auto">
                Tidak ada dokumen yang cocok dengan kata kunci &quot;{searchQuery}&quot; pada program studi {selectedProdi}. Coba gunakan kata kunci yang lebih umum.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedProdi('Semua Program Studi');
                  setSelectedJenis('Semua');
                  setPage(1);
                  fetchDocuments(1, '', 'Semua Program Studi', 'Semua');
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-primary-container text-on-primary text-xs font-bold shadow-xs hover:bg-primary transition-colors cursor-pointer"
              >
                Reset Filter Pencarian
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.data.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between p-5 group"
                >
                  {/* Top Metadata */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getJenisBadgeColor(
                            doc.jenis
                          )}`}
                        >
                          {doc.jenis}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/60">
                          {doc.prodi}
                        </span>
                      </div>
                      {doc.nomor && (
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {doc.nomor.replace('No.:', '').trim()}
                        </span>
                      )}
                    </div>

                    {/* Indonesian Title */}
                    <h2 className="text-sm font-bold text-on-surface leading-snug line-clamp-3 group-hover:text-primary transition-colors">
                      {doc.judul}
                    </h2>

                    {/* English Title */}
                    {doc.judulEn && (
                      <p className="mt-1 text-[11px] text-on-surface-variant/90 italic line-clamp-2">
                        &quot;{doc.judulEn}&quot;
                      </p>
                    )}

                    {/* Author & Academic Info */}
                    <div className="mt-4 pt-3 border-t border-outline-variant/60 flex flex-col gap-1.5 text-xs text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-secondary shrink-0">
                          person
                        </span>
                        <span className="font-semibold text-on-surface truncate">
                          {doc.nama}
                        </span>
                        {doc.nim && doc.nim !== '-' && (
                          <span className="text-[11px] font-mono text-outline shrink-0">
                            ({doc.nim})
                          </span>
                        )}
                      </div>

                      {doc.pembimbing && (
                        <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                          <span className="material-symbols-outlined text-[15px] text-slate-400 shrink-0">
                            school
                          </span>
                          <span className="truncate">
                            <strong className="text-on-surface-variant">Dosen:</strong> {doc.pembimbing}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BOTTOM ACTION BUTTONS: 3 GOOGLE DRIVE LINKS WITH TRACKING */}
                  <div className="mt-5 pt-3 border-t border-outline-variant/60">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-outline mb-2">
                      Berkas Naskah Lengkap (Google Drive):
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleFileClick(
                            doc.id,
                            doc.bagianAwalUrl,
                            'CLICK_AWAL',
                            'Bagian Awal (Abstrak)'
                          )
                        }
                        className={`px-2 py-2 rounded-lg text-[10px] font-bold text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          doc.bagianAwalUrl
                            ? 'bg-surface-container hover:bg-primary-container hover:text-on-primary text-primary border border-outline-variant'
                            : 'bg-surface-container-low text-slate-400 cursor-not-allowed opacity-60'
                        }`}
                        title="Unduh / Pratinjau Bagian Awal (Cover, Lembar Pengesahan, Abstrak)"
                      >
                        <span className="material-symbols-outlined text-[15px]">description</span>
                        <span className="truncate w-full">Bagian Awal</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleFileClick(
                            doc.id,
                            doc.bagianIsiUrl,
                            'CLICK_ISI',
                            'Bagian Isi (Bab 1–5)'
                          )
                        }
                        className={`px-2 py-2 rounded-lg text-[10px] font-bold text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          doc.bagianIsiUrl
                            ? 'bg-secondary/15 hover:bg-secondary text-[#0B2546] border border-secondary/40 font-extrabold'
                            : 'bg-surface-container-low text-slate-400 cursor-not-allowed opacity-60'
                        }`}
                        title="Unduh / Pratinjau Bagian Isi Lengkap (Bab 1 sampai Bab 5)"
                      >
                        <span className="material-symbols-outlined text-[15px]">menu_book</span>
                        <span className="truncate w-full">Bagian Isi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleFileClick(
                            doc.id,
                            doc.bagianAkhirUrl,
                            'CLICK_AKHIR',
                            'Bagian Akhir (Daftar Pustaka)'
                          )
                        }
                        className={`px-2 py-2 rounded-lg text-[10px] font-bold text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          doc.bagianAkhirUrl
                            ? 'bg-surface-container hover:bg-primary-container hover:text-on-primary text-primary border border-outline-variant'
                            : 'bg-surface-container-low text-slate-400 cursor-not-allowed opacity-60'
                        }`}
                        title="Unduh / Pratinjau Bagian Akhir (Daftar Pustaka & Lampiran)"
                      >
                        <span className="material-symbols-outlined text-[15px]">auto_stories</span>
                        <span className="truncate w-full">Bagian Akhir</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PAGINATION CONTROLS */}
        {results && results.pagination.totalPages > 1 && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant">
            <div className="text-xs text-on-surface-variant">
              Menampilkan halaman <strong className="text-primary">{results.pagination.page}</strong> dari{' '}
              <strong className="text-primary">{results.pagination.totalPages}</strong> ({results.pagination.total.toLocaleString('id-ID')} total karya ilmiah)
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={results.pagination.page <= 1}
                onClick={() => {
                  setPage(1);
                  window.scrollTo({ top: 320, behavior: 'smooth' });
                }}
                className="px-2.5 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container cursor-pointer"
                title="Halaman Pertama"
              >
                « Awal
              </button>

              <button
                type="button"
                disabled={results.pagination.page <= 1}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 320, behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                Prev
              </button>

              <span className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-bold">
                {results.pagination.page}
              </span>

              <button
                type="button"
                disabled={results.pagination.page >= results.pagination.totalPages}
                onClick={() => {
                  setPage((p) => Math.min(results.pagination.totalPages, p + 1));
                  window.scrollTo({ top: 320, behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container flex items-center gap-1 cursor-pointer"
              >
                Next
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>

              <button
                type="button"
                disabled={results.pagination.page >= results.pagination.totalPages}
                onClick={() => {
                  setPage(results.pagination.totalPages);
                  window.scrollTo({ top: 320, behavior: 'smooth' });
                }}
                className="px-2.5 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container cursor-pointer"
                title="Halaman Terakhir"
              >
                Akhir »
              </button>
            </div>
          </div>
        )}
      </main>

      {/* UNIFIED GLOBAL FOOTER */}
      <Footer />

      {/* MODAL: FITUR SEGERA HADIR (COMING SOON NOTICE) */}
      <ComingSoonNotice
        isOpen={comingSoonOpen}
        onClose={() => setComingSoonOpen(false)}
        details={comingSoonDetails}
      />
    </div>
  );
}
