'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { KATALOG_BUKU_DATA, DDC_CATEGORIES, BookRecord } from '@/lib/katalog-buku-data';

const KATALOG_HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1920&q=80',
    title: 'Lorong Rak Koleksi Buku Fisik',
  },
  {
    url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1920&q=80',
    title: 'Ruang Baca Buku Teks Akademik',
  },
  {
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1920&q=80',
    title: 'Koleksi Buku Referensi & Monograf',
  },
  {
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1920&q=80',
    title: 'Buku Teks Ekonomi, Akuntansi, & Manajemen',
  },
];

export default function KatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedDdc, setSelectedDdc] = useState('ALL');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookRecord | null>(null);
  const [copiedCallNumber, setCopiedCallNumber] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance hero background slider every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % KATALOG_HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Debounce search query 250ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Filter books locally from dataset
  const filteredBooks = useMemo(() => {
    return KATALOG_BUKU_DATA.filter((book) => {
      // DDC category filter
      if (selectedDdc !== 'ALL' && book.ddcCode !== selectedDdc) {
        return false;
      }
      // Availability filter
      if (availableOnly && !book.isAvailable) {
        return false;
      }
      // Keyword search
      if (debouncedQuery.trim()) {
        const q = debouncedQuery.toLowerCase();
        const matches =
          book.title.toLowerCase().includes(q) ||
          book.author.toLowerCase().includes(q) ||
          book.isbn.toLowerCase().includes(q) ||
          book.callNumber.toLowerCase().includes(q) ||
          book.publisher.toLowerCase().includes(q) ||
          book.shelfLocation.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [debouncedQuery, selectedDdc, availableOnly]);

  const copyCallNumber = (text: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedCallNumber(true);
      setTimeout(() => setCopiedCallNumber(false), 2000);
    }
  };

  const getBadgeColorClasses = (badge: BookRecord['shelfColorBadge']) => {
    switch (badge) {
      case 'emerald':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-emerald-500',
          label: 'Stiker Hijau',
        };
      case 'blue':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-blue-500',
          label: 'Stiker Biru',
        };
      case 'amber':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-amber-500',
          label: 'Stiker Kuning',
        };
      case 'purple':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-purple-500',
          label: 'Stiker Ungu',
        };
      case 'rose':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-rose-500',
          label: 'Stiker Merah',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: 'Stiker Standar',
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col justify-between">
      {/* GLOBAL NAVBAR */}
      <Navbar />

      <main className="w-full pt-28">
        {/* HERO BANNER - WARM PHYSICAL LIBRARY AESTHETIC WITH SMOOTH SLIDER */}
        <section className="relative overflow-hidden pt-16 pb-16 lg:pt-20 lg:pb-20">
          {/* Continuous Smooth Crossfade Carousel */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {KATALOG_HERO_SLIDES.map((slide, idx) => (
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
              Katalog Koleksi Buku Fisik <br className="hidden sm:inline" />
              <span className="text-amber-300">Ruang Baca SAC FEB UB</span>
            </h1>

            <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-200 max-w-2xl leading-relaxed">
              Temukan literatur buku teks ekonomi, akuntansi, dan manajemen di ruang baca fisik Gedung F Pascasarjana Lantai 1.
              Dilengkapi panduan nomor panggil (Call Number) dan penanda lokasi rak koleksi.
            </p>

            {/* SEARCH BAR */}
            <div className="w-full max-w-3xl mt-8">
              <div className="relative flex items-center shadow-xl rounded-2xl overflow-hidden bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-[#0B2546]/30 transition-all">
                <span className="material-symbols-outlined absolute left-4 text-[#0B2546] text-[24px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik judul buku fisik, pengarang, nomor panggil, atau ISBN..."
                  className="w-full py-4 pl-12 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium bg-transparent"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Bersihkan pencarian"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                )}
              </div>
            </div>

            {/* Carousel Slide Indicators (Placed at Bottom of Hero) */}
            <div className="flex items-center gap-2 mt-8">
              {KATALOG_HERO_SLIDES.map((slide, idx) => (
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

        {/* MAIN CATALOG & FILTER CONTENT */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            {/* DDC Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {DDC_CATEGORIES.map((cat) => (
                <button
                  key={cat.code}
                  type="button"
                  onClick={() => setSelectedDdc(cat.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDdc === cat.code
                      ? 'bg-[#0B2546] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0B2546] focus:ring-amber-400 cursor-pointer"
                />
                <span>Hanya Buku Tersedia</span>
              </label>

              <span className="text-xs text-slate-400">|</span>

              <span className="text-xs font-bold text-[#0B2546] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                {filteredBooks.length} Buku
              </span>
            </div>
          </div>

          {/* Book Cards Grid */}
          {filteredBooks.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 p-8 mt-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                <span className="material-symbols-outlined text-[36px]">search_off</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Data Tidak Ditemukan</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                {debouncedQuery
                  ? `Tidak ada buku fisik yang cocok dengan kata kunci "${debouncedQuery}".`
                  : availableOnly
                    ? 'Saat ini tidak ada eksemplar buku fisik yang berstatus tersedia untuk dipinjam pada kriteria ini.'
                    : 'Tidak ada koleksi buku fisik yang ditemukan untuk kriteria filter ini.'}
                {' '}Silakan ubah kata kunci atau reset filter pencarian.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDdc('ALL');
                  setAvailableOnly(false);
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-[#0B2546] text-white text-xs font-bold shadow-sm hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {filteredBooks.map((book) => {
                const badgeInfo = getBadgeColorClasses(book.shelfColorBadge);
                return (
                  <div
                    key={book.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-[#0B2546]/40"
                  >
                    <div>
                      {/* Top Meta Bar */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        {/* Shelf Tag with Color Stiker */}
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${badgeInfo.bg}`}
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 ${badgeInfo.dot}`} />
                          <span>{book.shelfLocation}</span>
                        </div>

                        {/* Availability Tag */}
                        {book.isAvailable ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                            <span className="material-symbols-outlined text-[12px]">check</span>
                            Tersedia ({book.availableCopies})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            Dipinjam Penuh
                          </span>
                        )}
                      </div>

                      {/* Call Number Pill */}
                      <div className="mb-2">
                        <span className="inline-block px-2.5 py-1 rounded bg-slate-100 font-mono text-xs font-extrabold text-[#0B2546] tracking-tight">
                          {book.callNumber}
                        </span>
                      </div>

                      {/* Title & Author */}
                      <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-[#0B2546] transition-colors line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1">
                        Oleh: <span className="text-slate-700 font-semibold">{book.author}</span>
                      </p>

                      {/* Publication Info */}
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{book.publisher}</span>
                        <span>•</span>
                        <span>{book.year}</span>
                        {book.edition && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-slate-600">{book.edition}</span>
                          </>
                        )}
                      </div>

                      {/* Synopsis Snippet */}
                      <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                        {book.synopsis}
                      </p>
                    </div>

                    {/* Bottom Action */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-slate-400">
                        ISBN: {book.isbn.slice(-9)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedBook(book)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0B2546] hover:bg-slate-900 text-amber-300 hover:text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                      >
                        <span>Detail Koleksi</span>
                        <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* MODAL DETAIL BUKU FISIK */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-6">
            {/* Modal Header */}
            <div className="bg-[#0B2546] text-white p-6 relative">
              <button
                type="button"
                onClick={() => setSelectedBook(null)}
                className="absolute top-5 right-5 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Tutup modal"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                  DDC {selectedBook.ddcCode} • {selectedBook.ddcCategory}
                </span>
                {selectedBook.isAvailable ? (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                    Tersedia ({selectedBook.availableCopies} dari {selectedBook.totalCopies} Copy)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-400/40">
                    Sedang Dipinjam Penuh
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {selectedBook.title}
              </h2>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                Penulis: {selectedBook.author}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Call Number & Locator Box */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-black text-amber-900 tracking-wider block mb-1">
                    Nomor Panggil (Call Number)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-black text-[#0B2546]">
                      {selectedBook.callNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyCallNumber(selectedBook.callNumber)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-950 text-xs font-bold hover:bg-amber-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      title="Salin nomor panggil"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedCallNumber ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedCallNumber ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] uppercase font-black text-amber-900 tracking-wider block mb-1">
                    Lokasi Rak Fisik Ruangan
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0B2546] text-amber-300 text-xs font-extrabold">
                    <span className="material-symbols-outlined text-[16px]">shelves</span>
                    <span>{selectedBook.shelfLocation}</span>
                  </span>
                </div>
              </div>

              {/* Metadata Table */}
              <div>
                <h4 className="text-xs font-bold text-[#0B2546] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">info</span>
                  <span>Informasi Bibliografi</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Penerbit</span>
                    <span className="font-semibold text-slate-800">{selectedBook.publisher}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Tahun Terbit</span>
                    <span className="font-semibold text-slate-800">{selectedBook.year}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Edisi</span>
                    <span className="font-semibold text-slate-800">{selectedBook.edition || 'Edisi Pertama'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">ISBN</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedBook.isbn}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Jumlah Halaman</span>
                    <span className="font-semibold text-slate-800">{selectedBook.pages} Halaman</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Bahasa</span>
                    <span className="font-semibold text-slate-800">{selectedBook.language}</span>
                  </div>
                </div>
              </div>

              {/* Synopsis */}
              <div>
                <h4 className="text-xs font-bold text-[#0B2546] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">subject</span>
                  <span>Sinopsis &amp; Cakupan Materi</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 text-justify">
                  {selectedBook.synopsis}
                </p>
              </div>

              {/* Physical Access Guide Notice */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold">
                  <span className="material-symbols-outlined text-[18px] text-blue-600">store</span>
                  <span>Panduan Mengambil Buku Fisik di Ruangan SAC:</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-blue-800 space-y-1 leading-relaxed pl-1">
                  <li>Catat nomor panggil (misal: <strong>{selectedBook.callNumber}</strong>).</li>
                  <li>Kunjungi ruangan SAC di <strong>Gedung F Pascasarjana Lantai 1</strong> FEB UB.</li>
                  <li>Cari label rak bertuliskan <strong>{selectedBook.shelfLocation}</strong> sesuai kode warna stiker DDC.</li>
                  <li>Setelah selesai membaca, letakkan buku di <strong>Meja Keranjang Penitipan Koleksi</strong> (jangan mengembalikan sendiri ke rak guna menjaga keteraturan tata letak).</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                Peminjaman buku teks dilayani melalui Meja Resepsionis SAC
              </span>
              <button
                type="button"
                onClick={() => setSelectedBook(null)}
                className="px-4 py-2 rounded-xl bg-[#0B2546] text-white text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL FOOTER */}
      <Footer />
    </div>
  );
}
