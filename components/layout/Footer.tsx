'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0B2546] text-white mt-16 border-t border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Column 1: SAC Profile */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-xs inline-block">
              <img
                alt="FEB UB Logo"
                className="h-8 w-auto object-contain"
                src="/logo-feb-black.png"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black text-white leading-tight font-sans tracking-tight">
                Self Access Centre (SAC)
              </span>
              <span className="text-[11px] font-bold text-amber-400 tracking-wider uppercase">
                FEB Universitas Brawijaya
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
            Pusat rujukan akademik, literatur mandiri, repositori riset, dan fasilitas penunjang studi
            komprehensif bagi civitas akademika Fakultas Ekonomi dan Bisnis Universitas Brawijaya.
          </p>
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span className="uppercase tracking-wider">Layanan Akademik Terakreditasi Unggul</span>
          </div>
        </div>

        {/* Column 2: Layanan Utama */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <span className="text-sm font-bold text-white tracking-wide uppercase font-sans border-b border-white/10 pb-2">
            Layanan Utama
          </span>
          <ul className="flex flex-col gap-2 text-xs text-slate-300">
            <li>
              <Link href="/katalog" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-amber-400">menu_book</span>
                <span>Katalog Buku Fisik</span>
              </Link>
            </li>
            <li>
              <Link href="/repository" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-amber-400">local_library</span>
                <span>Repositori Karya Ilmiah</span>
              </Link>
            </li>
            <li>
              <Link href="/serah-simpan" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-amber-400">school</span>
                <span>Serah Simpan (SAC-ONE)</span>
              </Link>
            </li>
            <li>
              <Link href="/presensi" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-amber-400">qr_code_scanner</span>
                <span>Kios Presensi Ruangan</span>
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-amber-400">play_circle</span>
                <span>Edukasi &amp; Video Riset</span>
              </Link>
            </li>
            <li>
              <Link href="/pca" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-amber-400">local_printshop</span>
                <span>Printer Corner (PCA)</span>
              </Link>
            </li>
            <li>
              <Link href="/statistik" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-amber-400">insights</span>
                <span>Statistik Layanan</span>
              </Link>
            </li>
            <li>
              <Link href="/lapor" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-amber-400">report_problem</span>
                <span>LaporSAC (Aduan)</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Jam Operasional & EduVPN Guide */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <span className="text-sm font-bold text-white tracking-wide uppercase font-sans border-b border-white/10 pb-2">
            Jam Operasional
          </span>
          <div className="bg-[#081B33] p-4 rounded-xl flex flex-col gap-2 text-xs border border-white/10 text-slate-300">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white">Senin - Jumat:</span>
              <span className="text-amber-300 font-bold">08.00 - 15.00 WIB</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Sabtu &amp; Minggu:</span>
              <span>Tutup (Libur)</span>
            </div>
            <div className="pt-2 mt-1 border-t border-white/10 text-amber-200/90 text-[11px]">
              *Istirahat Jumat: 11.00 - 13.00 WIB
            </div>
          </div>

          <div className="mt-1 flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Akses E-Resource Luar Kampus:
            </span>
            <a
              href="https://bits.ub.ac.id/wp-content/uploads/2023/02/Panduan-Setting-EduVPN_2-17-23.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 p-2 rounded-lg bg-blue-950/60 hover:bg-blue-900 text-blue-200 hover:text-white border border-blue-800 text-xs font-semibold transition-all group"
            >
              <span className="material-symbols-outlined text-[16px] text-amber-400 group-hover:scale-110 transition-transform">
                vpn_lock
              </span>
              <span className="truncate">Panduan EduVPN UB (PDF)</span>
              <span className="material-symbols-outlined text-[14px] text-slate-400 ml-auto">
                open_in_new
              </span>
            </a>
          </div>
        </div>

        {/* Column 4: Kontak Resmi & Lokasi */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <span className="text-sm font-bold text-white tracking-wide uppercase font-sans border-b border-white/10 pb-2">
            Lokasi &amp; Kontak Resmi
          </span>
          <div className="flex items-start gap-2 text-slate-300 text-xs leading-relaxed">
            <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0 mt-0.5">
              location_on
            </span>
            <p>
              Gedung F Pascasarjana Lantai 1, Fakultas Ekonomi dan Bisnis Universitas Brawijaya
              <br />
              Jl. MT. Haryono No. 165, Malang 65145, Jawa Timur
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-1 text-xs">
            <a
              href="https://wa.me/6282315377515?text=Halo%20Admin%2C%20saya%20mau%20tanya%20tentang%20layanan%20SAC."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-300 hover:text-amber-300 transition-colors"
            >
              <span className="material-symbols-outlined text-emerald-400 text-[18px] shrink-0">
                chat
              </span>
              <span>WhatsApp: +62 823-1537-7515</span>
            </a>

            <div className="flex items-center gap-2 text-slate-300">
              <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0">
                mail
              </span>
              <span>sac.feb@ub.ac.id</span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0">
                call
              </span>
              <span>(0341) 555-000 ext. 204</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Footer Bar */}
      <div className="w-full bg-[#051122] py-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-slate-400 text-xs">
          <div>
            © {currentYear} Self Access Centre FEB Universitas Brawijaya. Seluruh hak cipta dilindungi.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <Link href="/serah-simpan" className="hover:text-white transition-colors">
              Serah Simpan
            </Link>
            <Link href="/register" className="hover:text-white transition-colors">
              Pendaftaran Anggota
            </Link>
            <Link href="/presensi" className="hover:text-white transition-colors">
              Presensi Ruangan
            </Link>
            <Link href="/admin/login" className="hover:text-white transition-colors">
              Portal Staf / Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
