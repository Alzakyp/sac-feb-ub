'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ComingSoonNotice, { ComingSoonDetails } from '@/components/ComingSoonNotice';

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

export default function RepositoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProdi, setSelectedProdi] = useState('Semua Program Studi');
  const [selectedJenis, setSelectedJenis] = useState('Semua');
  const [page, setPage] = useState(1);

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
          'Naskah karya ilmiah ini sedang dalam proses alih media digital berkas repositori atau berstatus pembatasan embargo publikasi fakultas. Naskah cetak fisik dapat dibaca langsung di SAC Gedung F Lt. 2.',
        estimatedRelease: 'Digitalisasi Bertahap Tahun Akademik 2026',
        alternative:
          'Silakan kunjungi Meja Resepsionis SAC Gedung F Lantai 2 dengan membawa KTM Anda untuk membaca naskah fisik di Ruang Baca Hening.',
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

      {/* TOP HEADER & MASTHEAD */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/logo-feb-black.png"
                alt="FEB UB Logo"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="text-[16px] font-bold text-on-surface leading-tight tracking-tight">
                  Self Access Centre
                </span>
                <span className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">
                  FEB Universitas Brawijaya
                </span>
              </div>
            </Link>

            <div className="hidden md:block h-6 w-px bg-outline-variant mx-2"></div>

            <nav className="hidden md:flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
              <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">home</span>
                Beranda
              </Link>
              <span>/</span>
              <span className="text-primary font-bold">Katalog Repositori Ilmiah</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-primary hover:bg-surface-container border border-outline-variant/80 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span className="hidden sm:inline">Kembali ke Portal SAC</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH REAL-TIME ARCHIVE STATS */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B2546] to-[#081B33] text-white py-14 lg:py-16">
        {/* Subtle Institutional Watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] flex items-center justify-center -rotate-6">
          <svg className="text-white" fill="none" height="800" stroke="currentColor" viewBox="0 0 100 100" width="800">
            <circle cx="50" cy="50" r="46" strokeDasharray="2 1.5" strokeWidth="0.75" />
            <circle cx="50" cy="50" r="38" strokeWidth="0.5" />
            <ellipse cx="50" cy="42" rx="20" ry="18" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/15 text-secondary-fixed text-xs font-semibold uppercase tracking-wider mb-4 border border-secondary/30">
            <span className="material-symbols-outlined text-[16px]">local_library</span>
            <span>Koleksi Terindeks Resmi • 7.600+ Karya Ilmiah Mahasiswa</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
            Katalog Repositori Karya Ilmiah <br className="hidden sm:inline" />
            <span className="text-[#FED65B]">FEB Universitas Brawijaya</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl font-normal leading-relaxed">
            Pencarian cepat skripsi, tesis, dan disertasi mahasiswa Fakultas Ekonomi dan Bisnis Universitas Brawijaya dengan tautan berkas resmi Google Drive.
          </p>

          {/* MAIN SEARCH BOX */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-3xl mt-8 flex flex-col sm:flex-row items-stretch gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl"
          >
            <div className="relative flex-1 flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[22px]">
                search
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul naskah, nama mahasiswa, NIM, atau dosen pembimbing..."
                className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-900 rounded-xl placeholder-slate-400 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-secondary shadow-inner"
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
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5A823] text-[#0B2546] font-bold text-sm shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">manage_search</span>
              <span>Cari Naskah</span>
            </button>
          </form>

          {/* POPULAR KEYWORDS CHIPS */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-300 max-w-3xl">
            <span className="font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-secondary">trending_up</span>
              Populer:
            </span>
            {POPULAR_KEYWORDS.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => handleKeywordClick(kw)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs font-medium border border-white/10 transition-colors cursor-pointer"
              >
                {kw}
              </button>
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

          {/* Right: Results Count, Export Citation & Redis Cache Status Indicator */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-on-surface-variant">
            <button
              type="button"
              onClick={() =>
                handleTriggerComingSoon({
                  title: 'Ekspor Metadata Sitasi (Mendeley, Zotero, BibTeX)',
                  category: 'Integrasi Manajemen Referensi Ilmiah',
                  description:
                    'Fitur ekspor otomatis berkas sitasi dalam format RIS dan BibTeX (standar APA 7th Edition) sedang dalam tahap standarisasi metadata database.',
                  estimatedRelease: 'Fase Pembaruan v1.2',
                  alternative:
                    'Informasi penulis, judul skripsi, dan dosen pembimbing dapat disalin langsung dari kartu karya ilmiah untuk sitasi manual.',
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-xs font-semibold text-primary transition-colors cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">
                format_quote
              </span>
              <span>Ekspor Sitasi</span>
            </button>

            {results && (
              <>
                <span className="font-semibold text-primary">
                  {results.pagination.total.toLocaleString('id-ID')} naskah ditemukan
                </span>
                <span className="hidden sm:inline-block h-4 w-px bg-outline-variant"></span>
                {results.meta.cached ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    <span className="material-symbols-outlined text-[15px] text-emerald-600">
                      bolt
                    </span>
                    Redis ({results.meta.executionTimeMs}ms)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-medium border border-amber-200">
                    <span className="material-symbols-outlined text-[15px] text-amber-600">
                      storage
                    </span>
                    DB ({results.meta.executionTimeMs}ms)
                  </span>
                )}
              </>
            )}
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
              <p className="text-xs text-on-surface-variant">Menghubungkan ke cache Redis dan database...</p>
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

      {/* FOOTER */}
      <footer className="mt-16 bg-[#001027] text-white border-t border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <img src="/logo-feb.webp" alt="FEB UB" className="h-8 w-auto object-contain" />
            <span>© {new Date().getFullYear()} Self Access Centre - FEB Universitas Brawijaya</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white transition-colors">
              Portal E-Resource
            </Link>
            <Link href="/presensi" className="hover:text-white transition-colors">
              Presensi Digital
            </Link>
            <Link href="/admin" className="hover:text-white transition-colors">
              Admin Console
            </Link>
          </div>
        </div>
      </footer>

      {/* MODAL: FITUR SEGERA HADIR (COMING SOON NOTICE) */}
      <ComingSoonNotice
        isOpen={comingSoonOpen}
        onClose={() => setComingSoonOpen(false)}
        details={comingSoonDetails}
      />
    </div>
  );
}
