'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  onChatClick?: () => void;
}

export default function Navbar({ onChatClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/katalog', label: 'Katalog Buku' },
    { href: '/repository', label: 'Repositori' },
    { href: '/serah-simpan', label: 'Serah Simpan' },
    { href: '/gallery', label: 'E-Resource' },
    { href: '/lapor', label: 'Bantuan' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-all">
      {/* Micro Institutional Utility Bar */}
      <div className="bg-[#07172E] text-slate-300 text-[11px] py-1 px-4 sm:px-6 lg:px-8 border-b border-[#0B2546]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-slate-200 hidden sm:inline">
              Fakultas Ekonomi dan Bisnis Universitas Brawijaya
            </span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-300">Gedung F Pascasarjana Lantai 1</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-amber-400 font-semibold">Jam Layanan: 08.00 – 15.00 WIB</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Official Branding Logo & Clean Institutional Title */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
          <img
            alt="FEB UB Logo"
            className="h-8 sm:h-10 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
            src="/logo-feb-black.png"
          />
          <div className="border-l border-slate-300 pl-2.5 sm:pl-3 flex flex-col justify-center">
            <span className="text-xs sm:text-sm font-bold text-[#0B2546] tracking-tight leading-tight group-hover:text-amber-600 transition-colors whitespace-nowrap">
              <span className="inline sm:hidden">SAC FEB UB</span>
              <span className="hidden sm:inline">Self Access Centre (SAC)</span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 tracking-normal leading-tight whitespace-nowrap mt-0.5 hidden sm:inline">
              FEB Universitas Brawijaya
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links - visible on xl (>= 1280px) */}
        <nav className="hidden xl:flex items-center gap-1.5">
          {navLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  active
                    ? 'font-bold text-[#0B2546] bg-slate-100 shadow-2xs'
                    : 'text-slate-600 hover:text-[#0B2546] hover:bg-slate-100/70'
                }`}
              >
                {active && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons - visible on xl (>= 1280px) */}
        <div className="hidden xl:flex items-center gap-2.5 shrink-0">
          {onChatClick ? (
            <button
              type="button"
              onClick={onChatClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold transition-all shadow-2xs whitespace-nowrap cursor-pointer active:scale-95 group"
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
            </button>
          ) : (
            <Link
              href="/chat-sac"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold transition-all shadow-2xs whitespace-nowrap cursor-pointer active:scale-95 group"
              title="Buka Layanan Asisten ChatSAC"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="material-symbols-outlined text-[16px] text-amber-700 group-hover:rotate-6 transition-transform">
                smart_toy
              </span>
              <span>ChatSAC</span>
            </Link>
          )}

          {/* Prominent High-Contrast Daftar Anggota Button */}
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0B2546] hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-all whitespace-nowrap active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-amber-400">how_to_reg</span>
            <span>Daftar Anggota</span>
          </Link>
        </div>

        {/* Mobile / Tablet Controls (< 1280px) */}
        <div className="flex xl:hidden items-center gap-2 shrink-0">
          <Link
            href="/register"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B2546] text-white text-xs font-bold shadow-xs"
          >
            <span className="material-symbols-outlined text-[15px] text-amber-400">how_to_reg</span>
            <span>Daftar</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:text-[#0B2546] hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Toggle Menu Navigasi"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white/98 backdrop-blur-lg border-b border-slate-200 shadow-xl px-4 pt-3 pb-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors ${
                    active
                      ? 'bg-slate-100 text-[#0B2546] font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#0B2546]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            {onChatClick ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onChatClick();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-50 text-amber-950 border border-amber-300 font-bold text-sm"
              >
                <span className="material-symbols-outlined text-[18px] text-amber-700">smart_toy</span>
                <span>Buka ChatSAC AI</span>
              </button>
            ) : (
              <Link
                href="/chat-sac"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-50 text-amber-950 border border-amber-300 font-bold text-sm"
              >
                <span className="material-symbols-outlined text-[18px] text-amber-700">smart_toy</span>
                <span>Buka ChatSAC AI</span>
              </Link>
            )}

            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#0B2546] text-white font-bold text-sm shadow-md"
            >
              <span className="material-symbols-outlined text-[18px] text-amber-400">how_to_reg</span>
              <span>Daftar Anggota SAC</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
