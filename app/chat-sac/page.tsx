'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { exportDepositReceiptPDF } from '@/lib/utils';

interface DepositItem {
  id: string;
  depositNumber: string;
  identityNumber: string;
  fullName: string;
  degreeLevel: string;
  studyProgram: string | null;
  whatsappCountryCode: string;
  whatsappNumber: string;
  email: string;
  mailingAddress: string;
  titleId: string;
  titleEn: string | null;
  workType: string;
  advisor: string | null;
  examiner1: string | null;
  examiner2: string | null;
  initialSectionUrl: string;
  mainSectionUrl: string;
  finalSectionUrl: string;
  hardcopySubmitted: boolean;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REVISION_NEEDED' | string;
  revisionNotes: string | null;
  createdAt: string;
  verifiedAt: string | null;
}

export default function ChatSACPage() {
  const [nimInput, setNimInput] = useState('');
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [deposits, setDeposits] = useState<DepositItem[] | null>(null);
  const [searchedNIM, setSearchedNIM] = useState('');

  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  const FAQ_LIST = [
    {
      q: 'Bagaimana cara cek similarity Turnitin skripsi/tesis di SAC?',
      a: 'Pengujian orisinalitas Turnitin dilayani langsung di meja asistensi SAC Gedung F Pascasarjana Lantai 1. Mahasiswa dapat membawa draf berkas Bab 1 s.d. Bab 5 (.docx/.pdf) atau mengirimkan email ke sac.feb@ub.ac.id dengan subjek "Cek Turnitin - NIM - Nama". Similarity index diproses dalam 1×24 jam kerja.',
    },
    {
      q: 'Bagaimana cara mengakses jurnal ScienceDirect / Scopus dari rumah?',
      a: 'Akses pangkalan data internasional dari luar kampus wajib menggunakan EduVPN UB. Unduh panduan resmi BITS UB, instal aplikasi EduVPN, dan hubungkan profil institusi Universitas Brawijaya menggunakan akun email student UB.',
    },
    {
      q: 'Berapa lama proses verifikasi naskah Serah Simpan SAC-ONE?',
      a: 'Verifikasi naskah softcopy tugas akhir diproses oleh staf pustakawan dalam waktu maksimal 1×24 jam kerja (Senin–Jumat, 08.00–15.00 WIB). Status verifikasi dan bukti tanda terima sah ber-QR code dapat dicek mandiri melalui halaman ini.',
    },
    {
      q: 'Apakah mahasiswa S2 dan S3 wajib menyerahkan naskah cetak (hardcopy)?',
      a: 'Ya. Khusus program Magister (S2) dan Doktor (S3), selain mengunggah 3 bagian file PDF di SAC-ONE, mahasiswa wajib menyerahkan 1 eksemplar hardcopy naskah tugas akhir ke DROPBOX Pascasarjana SAC Gedung F Pascasarjana Lantai 1 FEB UB.',
    },
    {
      q: 'Bagaimana aturan penggunaan loker mandiri dan sandal ruangan?',
      a: 'Demi menjaga kebersihan dan kenyamanan ruang baca karpet, setiap pengunjung wajib menyimpan tas ransel dan jaket tebal di Loker Tas, serta melepas sepatu luar dan mengenakan Sandal Khusus SAC yang disediakan di Loker Sepatu.',
    },
  ];

  const handleCheckDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNim = nimInput.trim();
    if (!cleanNim) {
      setCheckError('Silakan ketik NIM mahasiswa yang ingin dicek.');
      return;
    }

    setLoadingCheck(true);
    setCheckError(null);
    setDeposits(null);

    try {
      const res = await fetch(`/api/chat-sac/check-deposit?nim=${encodeURIComponent(cleanNim)}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal mengecek data serah simpan.');
      }

      setDeposits(json.data);
      setSearchedNIM(cleanNim);
    } catch (err: any) {
      setCheckError(err.message || 'Koneksi ke basis data terputus.');
    } finally {
      setLoadingCheck(false);
    }
  };

  const handleDownloadReceipt = (item: DepositItem) => {
    exportDepositReceiptPDF({
      depositNumber: item.depositNumber,
      fullName: item.fullName,
      identityNumber: item.identityNumber,
      studyProgram: item.studyProgram || 'FEB UB',
      degreeLevel: item.degreeLevel,
      whatsappCountryCode: item.whatsappCountryCode || '+62',
      whatsappNumber: item.whatsappNumber,
      email: item.email,
      mailingAddress: item.mailingAddress,
      titleId: item.titleId,
      titleEn: item.titleEn,
      workType: item.workType,
      advisor: item.advisor || '-',
      examiner1: item.examiner1 || '-',
      examiner2: item.examiner2 || '-',
      verificationStatus: item.verificationStatus,
      createdAt: item.createdAt,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col justify-between">
      <Navbar />

      <main className="w-full pt-20">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0B2546] to-[#081B33] text-white py-12 lg:py-16">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center -rotate-6">
            <span className="material-symbols-outlined text-[600px] text-white">smart_toy</span>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-400/40">
              <span className="material-symbols-outlined text-[16px]">smart_toy</span>
              <span>Asisten Virtual &amp; Layanan Mandiri Civitas</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
              Pusat Layanan Asisten ChatSAC <br className="hidden sm:inline" />
              <span className="text-amber-400">FEB Universitas Brawijaya</span>
            </h1>

            <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">
              Cek mandiri status verifikasi berkas serah simpan tugas akhir melalui NIM, unduh ulang bukti
              tanda terima, telusuri FAQ operasional, atau hubungi staf helpdesk via WhatsApp.
            </p>
          </div>
        </section>

        {/* FEATURE 1: CEK MANDIRI STATUS SERAH SIMPAN */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#0B2546]">
                  Cek Mandiri Status Tanda Terima Serah Simpan (SAC-ONE)
                </h2>
                <p className="text-xs text-slate-500">
                  Ketik NIM Anda untuk melihat status verifikasi tugas akhir dan mengunduh surat tanda terima resmi.
                </p>
              </div>
            </div>

            <form onSubmit={handleCheckDeposit} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  badge
                </span>
                <input
                  type="text"
                  value={nimInput}
                  onChange={(e) => setNimInput(e.target.value)}
                  placeholder="Ketik Nomor Induk Mahasiswa (NIM), contoh: 215020200111001..."
                  className="w-full py-3 pl-11 pr-4 rounded-xl border border-slate-300 focus:border-[#0B2546] focus:ring-2 focus:ring-[#0B2546]/10 text-xs sm:text-sm font-mono text-slate-900"
                />
              </div>
              <button
                type="submit"
                disabled={loadingCheck}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0B2546] hover:bg-slate-900 text-amber-300 hover:text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {loadingCheck ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    <span>Memeriksa...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">search</span>
                    <span>Cek Bukti Serah Simpan</span>
                  </>
                )}
              </button>
            </form>

            {checkError && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">error</span>
                <span>{checkError}</span>
              </div>
            )}

            {/* DEPOSIT RESULTS DISPLAY */}
            {deposits !== null && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                {deposits.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <span className="material-symbols-outlined text-[36px] text-slate-400 mb-1">
                      folder_off
                    </span>
                    <h4 className="text-sm font-bold text-slate-800">
                      Belum Ada Rekord Serah Simpan untuk NIM {searchedNIM}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Pastikan Anda sudah mengisi formulir di portal serah simpan atau hubungi meja resepsionis jika berkas baru saja diajukan.
                    </p>
                    <Link
                      href="/serah-simpan"
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B2546] text-amber-300 text-xs font-bold shadow-xs hover:bg-slate-900"
                    >
                      <span>Buka Form Serah Simpan</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0B2546]">
                        Ditemukan {deposits.length} Pengajuan Serah Simpan:
                      </span>
                    </div>

                    {deposits.map((item) => (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs text-[#0B2546] bg-slate-100 px-2.5 py-0.5 rounded">
                              {item.depositNumber}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500">
                              {item.workType} • {item.degreeLevel}
                            </span>

                            {/* Verification Badge */}
                            {item.verificationStatus === 'APPROVED' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">verified</span>
                                Disetujui (APPROVED)
                              </span>
                            )}
                            {item.verificationStatus === 'PENDING' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">schedule</span>
                                Sedang Diverifikasi (Maks. 1×24 Jam)
                              </span>
                            )}
                            {item.verificationStatus === 'REVISION_NEEDED' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">assignment_late</span>
                                Perlu Perbaikan Dokumen
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {item.titleId}
                          </h3>
                          <p className="text-xs text-slate-500">
                            Pengaju: <strong>{item.fullName}</strong> ({item.identityNumber}) • Diajukan:{' '}
                            {new Date(item.createdAt).toLocaleString('id-ID')}
                          </p>

                          {item.revisionNotes && (
                            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-900 mt-2">
                              <strong>Catatan Petugas:</strong> {item.revisionNotes}
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="shrink-0">
                          {item.verificationStatus === 'APPROVED' ? (
                            <button
                              type="button"
                              onClick={() => handleDownloadReceipt(item)}
                              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">download</span>
                              <span>Unduh Tanda Terima (PDF)</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDownloadReceipt(item)}
                              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                              <span>Pratinjau Bukti Pengajuan</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* FEATURE 2: FAQ ACCORDION */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-[#0B2546]">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Panduan seputar layanan operasional, Turnitin, e-resources, dan tata tertib ruangan SAC FEB UB.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_LIST.map((faq, index) => {
              const isOpen = activeFaq === faq.q;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : faq.q)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-[#0B2546] hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="material-symbols-outlined text-[20px] text-amber-600 shrink-0">
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/60">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* FEATURE 3: DIRECT WHATSAPP ROUTING BANNER */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <div className="bg-gradient-to-r from-[#0B2546] to-[#103766] text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-amber-400/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-[28px]">chat</span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">
                  Butuh Bantuan Langsung dari Pustakawan?
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 max-w-md">
                  Hubungi staf helpdesk SAC FEB UB melalui WhatsApp resmi. Kami siap membantu pertanyaan Anda setiap jam kerja.
                </p>
              </div>
            </div>

            <a
              href="https://wa.me/6282315377515?text=Halo%20Admin%20SAC%20FEB%20UB,%20saya%20ingin%20konsultasi%20layanan%20referensi%20dan%20e-resources..."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>Chat WhatsApp: +62 823-1537-7515</span>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
