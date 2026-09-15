'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Lock, User, ArrowLeft, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('sacfebub2026');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      // Mock validation
      if ((username.toLowerCase() === 'admin' || username.toLowerCase() === 'petugas') && password.length >= 4) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('sac_admin_logged_in', 'true');
          localStorage.setItem('sac_admin_user', username);
          document.cookie = 'sac_admin_logged_in=true; path=/; max-age=86400';
        }
        router.push('/admin');
      } else {
        setError('Username atau password tidak sesuai. Gunakan akun demo di bawah.');
        setLoading(false);
      }
    }, 600);
  };

  const handleDemoFill = () => {
    setUsername('admin');
    setPassword('sacfebub2026');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased selection:bg-[#FED65B] selection:text-[#001027]">
      {/* Top back navigation */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#0B2546] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke Portal Publik</span>
        </Link>
        <span className="text-[11px] font-semibold text-slate-400">Node FEB-F2</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 sm:p-9 relative overflow-hidden">
          {/* Top Gold Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0B2546] via-[#D4AF37] to-[#0B2546]"></div>

          {/* Institutional Crest & Identity */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-14 w-auto flex items-center justify-center mb-3">
              <img
                alt="FEB UB Crest"
                className="h-12 w-auto object-contain"
                src="/logo-feb-black.png"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Sistem Akses Terbatas</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0B2546] tracking-tight">
              Konsol Petugas SAC
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Portal Pengawasan Log Kunjungan Harian &amp; Layanan Gedung F Lantai 2 FEB UB
            </p>
          </div>

          {/* Error message alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0B2546] mb-1.5">
                Username Petugas
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username petugas"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B2546]/20 focus:border-[#0B2546] transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#0B2546]">
                  Kata Sandi
                </label>
                <span className="text-[11px] text-slate-400">Min. 4 karakter</span>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B2546]/20 focus:border-[#0B2546] transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#0B2546] focus:ring-[#0B2546] h-3.5 w-3.5 cursor-pointer"
                />
                <span>Ingat kredensial ini</span>
              </label>
              <button
                type="button"
                onClick={handleDemoFill}
                className="text-[#D4AF37] hover:text-[#735C00] font-semibold text-xs hover:underline cursor-pointer"
              >
                Isi Akun Demo
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0B2546] hover:bg-[#001027] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </>
              )}
            </motion.button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block mb-0.5">Kredensial Demo Staf SAC:</span>
                <div className="font-mono text-[11px] text-amber-800 flex items-center gap-2 flex-wrap mt-1">
                  <span className="bg-white/80 px-2 py-0.5 rounded border border-amber-200">
                    user: <strong>admin</strong>
                  </span>
                  <span className="bg-white/80 px-2 py-0.5 rounded border border-amber-200">
                    pass: <strong>sacfebub2026</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          &copy; 2026 Self Access Centre • Fakultas Ekonomi dan Bisnis Universitas Brawijaya
        </p>
      </motion.div>
    </div>
  );
}
