'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ComingSoonDetails {
  title: string;
  category?: string;
  description?: string;
  estimatedRelease?: string;
  alternative?: string;
}

interface ComingSoonNoticeProps {
  isOpen: boolean;
  onClose: () => void;
  details?: ComingSoonDetails | null;
  onOpenChat?: () => void;
  mode?: 'modal' | 'toast';
}

export default function ComingSoonNotice({
  isOpen,
  onClose,
  details,
  onOpenChat,
  mode = 'modal',
}: ComingSoonNoticeProps) {
  const title = details?.title || 'Fitur Segera Hadir';
  const category = details?.category || 'Sistem Terpadu SAC FEB UB';
  const description =
    details?.description ||
    'Fitur dan basis data ini saat ini sedang dalam tahap finalisasi dan sinkronisasi oleh Tim Pengelola SAC & ICT Fakultas Ekonomi dan Bisnis Universitas Brawijaya.';
  const estimatedRelease =
    details?.estimatedRelease || 'Tahap Uji Coba Operasional (Fase Rilis v1.2)';
  const alternative =
    details?.alternative ||
    'Untuk saat ini, layanan dapat diakses langsung melalui Meja Resepsionis Gedung F Pascasarjana Lantai 1 atau hubungi Asisten Virtual ChatSAC.';

  if (mode === 'toast') {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#0B2546] text-white p-4 rounded-2xl shadow-2xl border-2 border-[#D4AF37]/50 flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                  Coming Soon • Segera Hadir
                </span>
                <button
                  onClick={onClose}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              <h4 className="text-xs font-bold text-white mt-0.5 truncate">{title}</h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug line-clamp-2">
                {description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative"
          >
            {/* Top Navy Banner with Gold Trim */}
            <div className="bg-[#0B2546] text-white p-6 relative border-b-4 border-[#D4AF37] overflow-hidden">
              {/* Subtle background decorative watermark */}
              <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]">construction</span>
              </div>

              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shadow-lg ring-4 ring-amber-400/20 shrink-0">
                    <span className="material-symbols-outlined text-[28px]">rocket_launch</span>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span>{category}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
                      Fitur Segera Hadir
                    </h3>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                  title="Tutup Modal"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Feature Title Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nama Layanan / Fitur:
                </span>
                <h4 className="text-sm sm:text-base font-black text-[#0B2546] mt-0.5">
                  {title}
                </h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{description}</p>
              </div>

              {/* Status Roadmap & Timeline Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                    <span className="material-symbols-outlined text-[16px] text-amber-600">
                      hourglass_top
                    </span>
                    <span>Status Integrasi</span>
                  </div>
                  <p className="text-[11px] text-amber-950 font-semibold">{estimatedRelease}</p>
                </div>

                <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold text-[11px]">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">
                      verified
                    </span>
                    <span>Node Sistem</span>
                  </div>
                  <p className="text-[11px] text-blue-950 font-semibold">
                    SAC FEB UB • Gedung F Pascasarjana Lantai 1
                  </p>
                </div>
              </div>

              {/* Alternative Action Notice */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-slate-500 text-[18px] shrink-0 mt-0.5">
                  help
                </span>
                <div className="text-[11px] leading-relaxed">
                  <strong className="text-slate-800 block font-bold">
                    Membutuhkan Layanan Ini Sekarang?
                  </strong>
                  <span>{alternative}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              {onOpenChat && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenChat();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#0B2546]">
                    smart_toy
                  </span>
                  <span>Tanya Asisten ChatSAC</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0B2546] hover:bg-slate-900 text-amber-300 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Mengerti, Tutup</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
