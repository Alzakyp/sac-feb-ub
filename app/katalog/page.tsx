'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

type Book = {
  id: string;
  title: string;
  author: string | null;
  publisher: string | null;
  publicationYear: number | null;
  isbn: string | null;
  ddc: string | null;
  subject: string | null;
  inventoryNumber: string | null;
  registerNumber: string | null;
  edition: string | null;
  publicationPlace: string | null;
  physicalDescription: string | null;
};

export default function KatalogPage() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Book | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      const params = new URLSearchParams({ q: query, page: String(page) });
      const response = await fetch(`/api/katalog?${params}`);
      const result = await response.json();
      setBooks(result.data || []);
      setTotal(result.total || 0);
      setLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, page]);

  const pages = Math.max(1, Math.ceil(total / 24));

  return <div className="min-h-screen overflow-x-hidden bg-stone-50 text-slate-800"><Navbar />
    <main className="pt-[88px]">
      <section className="bg-[#0B2546] px-4 py-16 text-center text-white">
        <p className="mb-3 text-sm font-bold tracking-[.2em] text-amber-300">SAC FEB UB</p>
        <h1 className="text-3xl font-extrabold sm:text-5xl">Koleksi Buku</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-200">Cari buku yang tersedia di ruang baca SAC. Tampilkan judul, pengarang, penerbit, tahun, ISBN, dan nomor klasifikasi asli.</p>
        <label className="mx-auto mt-8 flex max-w-3xl items-center rounded-2xl bg-white px-4 py-3 text-left shadow-xl">
          <span className="material-symbols-outlined mr-3 text-[#0B2546]">search</span>
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="w-full bg-transparent text-sm text-slate-900 outline-none" placeholder="Cari judul, pengarang, penerbit, ISBN, atau DDC..." />
        </label>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-lg font-bold">{loading ? 'Memuat koleksi…' : `${total.toLocaleString('id-ID')} buku`}</h2><p className="text-sm text-slate-500">Data koleksi SAC-ONE</p></div>
        {!loading && books.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">Buku tidak ditemukan.</div>}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {books.map((book) => (
            <button
              key={book.id}
              type="button"
              onClick={() => setSelected(book)}
              className="flex min-h-56 min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md"
            >
              <p className="mb-3 max-w-full truncate text-xs font-bold text-amber-700" title={book.ddc || undefined}>
                {book.ddc || 'Klasifikasi belum tersedia'}
              </p>
              <h3 className="line-clamp-3 break-words text-base font-extrabold leading-6 text-[#0B2546]">
                {book.title}
              </h3>
              <p className="mt-3 line-clamp-2 break-words text-sm leading-5 text-slate-600">
                {book.author || 'Pengarang belum tersedia'}
              </p>
              <p className="mt-auto line-clamp-2 break-words pt-4 text-xs leading-5 text-slate-500">
                {[book.publisher, book.publicationYear].filter(Boolean).join(' · ') || 'Detail penerbitan belum tersedia'}
              </p>
            </button>
          ))}
        </div>
        {pages > 1 && <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3"><button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg border bg-white px-3 py-2 text-xs sm:px-4 sm:text-sm disabled:opacity-40">Sebelumnya</button><span className="px-2 py-2 text-xs sm:px-3 sm:text-sm">Halaman {page} / {pages}</span><button disabled={page === pages} onClick={() => setPage(page + 1)} className="rounded-lg bg-[#0B2546] px-3 py-2 text-xs text-white sm:px-4 sm:text-sm disabled:opacity-40">Berikutnya</button></div>}
      </section>
    </main>
    {selected && <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4" onClick={() => setSelected(null)}><div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex justify-between gap-4"><h2 className="text-xl font-extrabold text-[#0B2546]">{selected.title}</h2><button onClick={() => setSelected(null)} aria-label="Tutup detail" className="text-xl">×</button></div><dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">{[['Pengarang',selected.author],['Penerbit',selected.publisher],['Tahun',selected.publicationYear],['ISBN',selected.isbn],['DDC',selected.ddc],['Subjek',selected.subject],['No. Inventaris',selected.inventoryNumber],['Register',selected.registerNumber],['Edisi',selected.edition],['Tempat terbit',selected.publicationPlace],['Deskripsi',selected.physicalDescription]].filter(([, value]) => value).map(([label, value]) => <div key={String(label)}><dt className="font-bold text-slate-500">{label}</dt><dd className="mt-1 text-slate-800">{String(value)}</dd></div>)}</dl></div></div>}
    <Footer />
  </div>;
}
