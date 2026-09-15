'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface PresensiResponseData {
  fullName: string;
  identityNumber: string;
  studyProgram: string;
  checkInTime: string;
  checkOutTime?: string;
  duration?: string;
  remainingMinutes?: number;
}

interface StatusNotification {
  type: 'CHECK_IN' | 'CHECK_OUT' | 'STILL_IN' | 'ERROR';
  message: string;
  data?: PresensiResponseData;
}

export default function PresensiPage() {
  const [identityNumber, setIdentityNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<StatusNotification | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Live Digital Clock (WIB)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' WIB'
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Submit Handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedNIM = identityNumber.trim();
    if (!trimmedNIM) {
      setNotification({
        type: 'ERROR',
        message: 'Silakan masukkan atau scan Nomor Induk Mahasiswa (NIM).',
      });
      inputRef.current?.focus();
      return;
    }

    if (trimmedNIM.length < 5) {
      setNotification({
        type: 'ERROR',
        message: 'Nomor NIM minimal terdiri dari 5 karakter.',
      });
      inputRef.current?.focus();
      return;
    }

    setLoading(true);

    // Auto-reset input value immediately to allow queue readiness
    setIdentityNumber('');

    try {
      const res = await fetch('/api/presensi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sac-network': 'local-sac', // Internal kiosk identifier
        },
        body: JSON.stringify({ identityNumber: trimmedNIM }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setNotification({
          type: 'ERROR',
          message: result.error || 'Terjadi kesalahan saat memproses presensi.',
        });
      } else {
        setNotification({
          type: result.action as 'CHECK_IN' | 'CHECK_OUT' | 'STILL_IN',
          message: result.message,
          data: result.data,
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'ERROR',
        message:
          err.message ||
          'Koneksi server gagal. Pastikan terhubung ke jaringan lokal SAC FEB UB.',
      });
    } finally {
      setLoading(false);
      // Re-focus input immediately so next visitor or barcode scan is ready
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) + ' WIB';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between items-center p-4 sm:p-6 font-sans text-slate-800 selection:bg-amber-400 selection:text-slate-900">
      {/* TOP NAVIGATION BAR */}
      <div className="w-full max-w-xl flex items-center justify-between mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0B2546] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Portal Utama SAC</span>
        </Link>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs text-[11px] font-bold text-[#0B2546]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Terminal Kiosk Fisik</span>
        </div>
      </div>

      {/* MAIN KIOSK CONTAINER */}
      <main className="w-full max-w-xl flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col">
          {/* HEADER (Navy Brawijaya #0B2546 with Warm Gold Accent) */}
          <header className="bg-[#0B2546] text-white px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-b-2 border-amber-500">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <img
                src="/logo-feb.webp"
                alt="FEB UB"
                className="h-10 w-auto object-contain shrink-0"
              />
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                  Presensi Pengunjung SAC FEB UB
                </h1>
                <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                  Gedung F Lantai 2 • Check-In &amp; Check-Out Mandiri
                </p>
              </div>
            </div>

            {/* Live Clock Badge */}
            <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 text-center shrink-0">
              <div className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold">
                {currentDate || 'WIB'}
              </div>
              <div className="text-sm font-mono font-black text-white">
                {currentTime || '00:00:00 WIB'}
              </div>
            </div>
          </header>

          {/* BODY CONTENT */}
          <div className="p-6 flex flex-col gap-5">
            {/* SINGLE INPUT FORM (NIM) */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="nimInput"
                  className="text-xs font-bold text-slate-700 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#0B2546]">
                      badge
                    </span>
                    <span>Nomor Induk Mahasiswa (NIM)</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Scanner Aktif • Tap atau Ketik
                  </span>
                </label>

                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400 select-none">
                    <span className="material-symbols-outlined text-[24px]">
                      qr_code_scanner
                    </span>
                  </span>
                  <input
                    id="nimInput"
                    ref={inputRef}
                    type="text"
                    value={identityNumber}
                    onChange={(e) => setIdentityNumber(e.target.value)}
                    placeholder="Ketik NIM atau Scan KTM..."
                    disabled={loading}
                    autoComplete="off"
                    autoFocus
                    className="w-full py-4 pl-12 pr-4 rounded-xl border-2 border-slate-300 focus:border-[#0B2546] focus:ring-4 focus:ring-[#0B2546]/10 text-slate-900 font-mono font-bold text-lg sm:text-xl tracking-widest text-center transition-all disabled:bg-slate-100 disabled:opacity-60 placeholder:text-slate-400 placeholder:text-base placeholder:font-normal placeholder:tracking-normal"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-[#0B2546] hover:bg-[#001027] active:scale-[0.99] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">
                      sync
                    </span>
                    <span>Memproses Presensi...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px] text-amber-400">
                      login
                    </span>
                    <span>Konfirmasi Presensi</span>
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* ADAPTIVE STATUS NOTIFICATION BOX */}
            <AnimatePresence mode="wait">
              {notification && (
                <motion.div
                  key={notification.type + notification.message}
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className={`p-4 sm:p-5 rounded-xl border relative shadow-xs ${
                    notification.type === 'CHECK_IN'
                      ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                      : notification.type === 'CHECK_OUT'
                      ? 'bg-sky-50/90 border-sky-300 text-sky-950'
                      : notification.type === 'STILL_IN'
                      ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                      : 'bg-rose-50/90 border-rose-300 text-rose-950'
                  }`}
                >
                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => {
                      setNotification(null);
                      inputRef.current?.focus();
                    }}
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>

                  <div className="flex items-start gap-3.5">
                    {/* Status Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                        notification.type === 'CHECK_IN'
                          ? 'bg-emerald-600 text-white'
                          : notification.type === 'CHECK_OUT'
                          ? 'bg-sky-600 text-white'
                          : notification.type === 'STILL_IN'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px]">
                        {notification.type === 'CHECK_IN'
                          ? 'how_to_reg'
                          : notification.type === 'CHECK_OUT'
                          ? 'logout'
                          : notification.type === 'STILL_IN'
                          ? 'hourglass_top'
                          : 'error'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      {/* Badge and Title */}
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            notification.type === 'CHECK_IN'
                              ? 'bg-emerald-200 text-emerald-900'
                              : notification.type === 'CHECK_OUT'
                              ? 'bg-sky-200 text-sky-900'
                              : notification.type === 'STILL_IN'
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-rose-200 text-rose-900'
                          }`}
                        >
                          {notification.type === 'CHECK_IN'
                            ? 'Check-In Berhasil'
                            : notification.type === 'CHECK_OUT'
                            ? 'Check-Out Berhasil'
                            : notification.type === 'STILL_IN'
                            ? 'Sesi Sedang Aktif'
                            : 'Peringatan Presensi'}
                        </span>
                      </div>

                      {/* Main Message */}
                      <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                        {notification.message}
                      </p>

                      {/* Details Box */}
                      {notification.data && (
                        <div className="mt-3 pt-3 border-t border-current/15 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10.5px] uppercase font-bold opacity-70 block">
                              Nama Lengkap
                            </span>
                            <span className="font-bold text-slate-900">
                              {notification.data.fullName}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10.5px] uppercase font-bold opacity-70 block">
                              NIM / Program Studi
                            </span>
                            <span className="font-mono font-semibold text-slate-900">
                              {notification.data.identityNumber} • {notification.data.studyProgram}
                            </span>
                          </div>

                          {notification.data.checkInTime && (
                            <div>
                              <span className="text-[10.5px] uppercase font-bold opacity-70 block">
                                Jam Masuk (Check-In)
                              </span>
                              <span className="font-semibold text-slate-900">
                                {formatTime(notification.data.checkInTime)}
                              </span>
                            </div>
                          )}

                          {notification.type === 'CHECK_OUT' && (
                            <>
                              <div>
                                <span className="text-[10.5px] uppercase font-bold opacity-70 block">
                                  Jam Keluar (Check-Out)
                                </span>
                                <span className="font-semibold text-slate-900">
                                  {formatTime(notification.data.checkOutTime)}
                                </span>
                              </div>
                              <div className="sm:col-span-2 bg-white/60 p-2 rounded-lg border border-current/10 mt-1 flex items-center justify-between">
                                <span className="font-bold text-slate-800">
                                  Total Durasi Kunjungan:
                                </span>
                                <span className="font-mono font-black text-sky-800 text-sm">
                                  {notification.data.duration}
                                </span>
                              </div>
                            </>
                          )}

                          {notification.type === 'STILL_IN' && notification.data.remainingMinutes && (
                            <div className="sm:col-span-2 bg-amber-100/60 p-2 rounded-lg border border-amber-300 text-amber-900 mt-1 flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px]">
                                timer
                              </span>
                              <span className="text-[11px] font-medium">
                                Sisa waktu sebelum check-out diizinkan:{' '}
                                <strong>{notification.data.remainingMinutes} menit</strong>
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* GUIDANCE BANNER */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-amber-500 text-[20px] shrink-0 mt-0.5">
                info
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Ketentuan Check-In &amp; Check-Out:</strong> Tap pertama dicatat
                sebagai <strong>Masuk (Check-In)</strong>. Tap berikutnya setelah minimal{' '}
                <strong>5 menit</strong> berada di ruangan otomatis dicatat sebagai{' '}
                <strong>Keluar (Check-Out)</strong>.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER NOTE */}
      <footer className="w-full max-w-xl text-center py-4 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© {new Date().getFullYear()} Self Access Centre • Gedung F Lantai 2 FEB UB</span>
        <span className="font-mono text-[10px] text-slate-400">Node F2-KIOSK-V2</span>
      </footer>
    </div>
  );
}
