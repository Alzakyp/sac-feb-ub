'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { exportDepositReceiptPDF, DepositReceiptData } from '@/lib/utils';

// Program studi list
const STUDY_PROGRAMS = [
  'S1 Ekonomi Pembangunan',
  'S1 Ekonomi Keuangan dan Perbankan',
  'S1 Ekonomi Islam',
  'S1 Manajemen',
  'S1 Kewirausahaan',
  'S1 Akuntansi',
  'S2 Magister Ilmu Ekonomi',
  'S2 Magister Manajemen',
  'S2 Magister Akuntansi',
  'S2 Magister Manajemen (Kampus Jakarta)',
  'S2 Magister Akuntansi (Kampus Jakarta)',
  'S3 Doktor Ilmu Ekonomi',
  'S3 Doktor Ilmu Manajemen',
  'S3 Doktor Ilmu Akuntansi',
  'Pendidikan Profesi Akuntansi (PPAk)',
  'Other',
];

const COUNTRY_CODES = [
  { code: '+62', label: 'Indonesia (+62)' },
  { code: '+60', label: 'Malaysia (+60)' },
  { code: '+65', label: 'Singapore (+65)' },
  { code: '+1', label: 'USA / Canada (+1)' },
];

export default function SerahSimpanPage() {
  const [lang, setLang] = useState<'ID' | 'EN'>('ID');
  const [step, setStep] = useState<number>(1);

  // Step 2 State - Verification
  const [searchNim, setSearchNim] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifiedMember, setVerifiedMember] = useState<{
    identityNumber: string;
    fullName: string;
    degreeLevel: string;
    studyProgram: string;
    whatsapp: string;
    whatsappCountryCode: string;
    email: string;
    originAddress: string;
  } | null>(null);
  const [isNewStudentForm, setIsNewStudentForm] = useState(false);

  // Student Form Data
  const [studentData, setStudentData] = useState({
    identityNumber: '',
    fullName: '',
    degreeLevel: 'S1', // 'S1' | 'S2' | 'S3' | 'Profesi' | 'Other'
    studyProgram: 'S1 Manajemen',
    whatsappCountryCode: '+62',
    whatsappNumber: '',
    email: '',
    mailingAddress: '',
  });

  // Step 3 State - Work Metadata & Files
  const [workData, setWorkData] = useState({
    titleId: '',
    titleEn: '',
    workType: 'Skripsi', // Skripsi, Tesis, Disertasi
    advisor: '',
    examiner1: '',
    examiner2: '',
    agreedToTerms: false,
  });

  // Uploaded files metadata
  const [fileAwal, setFileAwal] = useState<{ name: string; size: number; url: string } | null>(null);
  const [fileIsi, setFileIsi] = useState<{ name: string; size: number; url: string } | null>(null);
  const [fileAkhir, setFileAkhir] = useState<{ name: string; size: number; url: string } | null>(null);

  // Unique input IDs for accessibility
  const fileAwalInputId = useId();
  const fileIsiInputId = useId();
  const fileAkhirInputId = useId();

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<DepositReceiptData | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // UI Translations
  const t = {
    ID: {
      headerTitle: '🎓 SELF ACCESS CENTRE • FEB-UB — Serah Simpan Karya Ilmiah Mahasiswa (Skripsi, Tesis, dan Disertasi)',
      headerSub: 'Student Scientific Work Deposit — Undergraduate Thesis, Master\'s Thesis, and Dissertation.',
      step1: 'Panduan & Ketentuan',
      step2: 'Data Mahasiswa',
      step3: 'Unggah Berkas',
      step4: 'Bukti Penyerahan',
      backToHome: 'Kembali ke Beranda',
      next: 'Lanjutkan',
      back: 'Kembali',
      yes: 'Ya, Dokumen Siap',
      no: 'Tidak, Kembali',
    },
    EN: {
      headerTitle: '🎓 SELF ACCESS CENTRE • FEB-UB — Student Scientific Work Deposit (Thesis & Dissertation)',
      headerSub: 'Student Scientific Work Deposit — Undergraduate Thesis, Master\'s Thesis, and Dissertation.',
      step1: 'Guidelines & Terms',
      step2: 'Student Information',
      step3: 'Upload Documents',
      step4: 'Deposit Receipt',
      backToHome: 'Back to Home',
      next: 'Continue',
      back: 'Back',
      yes: 'Yes, Documents Ready',
      no: 'No, Return Home',
    },
  }[lang];

  // Handler for NIM Verification
  const handleVerifyNim = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNim = searchNim.replace(/\s+/g, '').trim();
    if (!cleanNim) {
      setVerifyError(
        lang === 'ID' ? 'Masukkan NIM Anda terlebih dahulu.' : 'Please enter your Student ID first.'
      );
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);

    try {
      const res = await fetch('/api/serah-simpan/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityNumber: cleanNim }),
      });
      const data = await res.json();

      if (data.found && data.data) {
        setVerifiedMember(data.data);
        setIsNewStudentForm(false);
        setStudentData({
          identityNumber: data.data.identityNumber,
          fullName: data.data.fullName,
          degreeLevel: data.data.degreeLevel,
          studyProgram: data.data.studyProgram,
          whatsappCountryCode: data.data.whatsappCountryCode || '+62',
          whatsappNumber: data.data.whatsapp,
          email: data.data.email,
          mailingAddress: data.data.originAddress || '',
        });
        // Auto-match workType based on degreeLevel
        if (data.data.degreeLevel === 'S2') {
          setWorkData((prev) => ({ ...prev, workType: 'Tesis' }));
        } else if (data.data.degreeLevel === 'S3') {
          setWorkData((prev) => ({ ...prev, workType: 'Disertasi' }));
        } else {
          setWorkData((prev) => ({ ...prev, workType: 'Skripsi' }));
        }
      } else {
        // Not found, open form
        setVerifiedMember(null);
        setIsNewStudentForm(true);
        setStudentData((prev) => ({
          ...prev,
          identityNumber: cleanNim,
        }));
      }
    } catch (err) {
      console.error(err);
      setVerifyError(
        lang === 'ID'
          ? 'Gagal menghubungi server verifikasi. Silakan coba lagi.'
          : 'Failed to reach verification server. Please try again.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Helper file uploader simulator / handler
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'awal' | 'isi' | 'akhir'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert(lang === 'ID' ? 'Berkas harus dalam format .PDF' : 'File must be in .PDF format');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert(
        lang === 'ID'
          ? 'Ukuran berkas maksimal adalah 25MB'
          : 'Maximum file size is 25MB'
      );
      return;
    }

    const nimPrefix = studentData.identityNumber || 'NIM';
    let standardName = `${nimPrefix}_Bagian Awal.pdf`;
    if (type === 'isi') standardName = `${nimPrefix}_Bagian Isi.pdf`;
    if (type === 'akhir') standardName = `${nimPrefix}_Bagian Akhir.pdf`;

    const fileInfo = {
      name: file.name,
      size: file.size,
      url: `/uploads/deposits/${Date.now()}_${standardName}`,
    };

    if (type === 'awal') setFileAwal(fileInfo);
    if (type === 'isi') setFileIsi(fileInfo);
    if (type === 'akhir') setFileAkhir(fileInfo);
  };

  // Format file size
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Handler for Final Submission
  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validation
    if (!workData.titleId.trim()) {
      setSubmitError(
        lang === 'ID'
          ? 'Judul Karya Ilmiah (Bahasa Indonesia) wajib diisi.'
          : 'Scientific Work Title (Indonesian) is required.'
      );
      return;
    }

    if (!fileAwal || !fileIsi || !fileAkhir) {
      setSubmitError(
        lang === 'ID'
          ? 'Seluruh 3 berkas PDF (Bagian Awal, Isi, dan Akhir) wajib diunggah.'
          : 'All 3 PDF files (Initial, Main, and Final section) must be uploaded.'
      );
      return;
    }

    if (!workData.agreedToTerms) {
      setSubmitError(
        lang === 'ID'
          ? 'Anda wajib menyetujui pernyataan integritas dan keaslian naskah.'
          : 'You must agree to the integrity and authenticity declaration.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        identityNumber: studentData.identityNumber,
        fullName: studentData.fullName,
        degreeLevel: studentData.degreeLevel,
        studyProgram: studentData.studyProgram,
        whatsappCountryCode: studentData.whatsappCountryCode,
        whatsappNumber: studentData.whatsappNumber,
        email: studentData.email,
        mailingAddress: studentData.mailingAddress,
        titleId: workData.titleId,
        titleEn: workData.titleEn || null,
        workType: workData.workType,
        advisor: workData.advisor || null,
        examiner1: workData.examiner1 || null,
        examiner2: workData.examiner2 || null,
        initialSectionUrl: fileAwal.name,
        mainSectionUrl: fileIsi.name,
        finalSectionUrl: fileAkhir.name,
        hardcopySubmitted: false,
      };

      const res = await fetch('/api/serah-simpan/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Gagal mengirim berkas serah simpan');
      }

      setReceiptData({
        depositNumber: result.depositNumber,
        identityNumber: studentData.identityNumber,
        fullName: studentData.fullName,
        degreeLevel: studentData.degreeLevel,
        studyProgram: studentData.studyProgram,
        whatsappCountryCode: studentData.whatsappCountryCode,
        whatsappNumber: studentData.whatsappNumber,
        email: studentData.email,
        mailingAddress: studentData.mailingAddress,
        titleId: workData.titleId,
        titleEn: workData.titleEn,
        workType: workData.workType,
        advisor: workData.advisor,
        examiner1: workData.examiner1,
        examiner2: workData.examiner2,
        verificationStatus: result.status || 'PENDING',
        createdAt: new Date(),
      });

      setStep(4);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Terjadi gangguan koneksi ke server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* INSTITUTIONAL TOP BAR */}
      <header className="bg-[#0B2546] text-white sticky top-0 z-40 shadow-md border-b border-amber-400/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3.5 group">
            <img
              src="/logo-feb.webp"
              alt="FEB UB"
              className="h-11 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-[15px] sm:text-base font-bold tracking-tight text-white leading-tight">
                Self Access Centre
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-amber-400 uppercase">
                FEB Universitas Brawijaya • SAC-ONE
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {/* Bilingual Switcher */}
            <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 flex items-center shadow-inner">
              <button
                onClick={() => setLang('ID')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  lang === 'ID'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                ID
              </button>
              <button
                onClick={() => setLang('EN')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  lang === 'EN'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              <span>{t.backToHome}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        {/* WIZARD CARD */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
          {/* HEADER BANNER */}
          <div className="bg-gradient-to-r from-[#0B2546] via-[#103766] to-[#0B2546] text-white p-6 sm:p-8 relative overflow-hidden">
            {/* Background subtle watermark */}
            <div className="absolute -right-6 -bottom-10 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-[180px]">school</span>
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2.5">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span>Modul SAC-ONE Mandiri</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
                {t.headerTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-normal">
                {t.headerSub}
              </p>
            </div>

            {/* STEPPER PROGRESS INDICATOR */}
            <div className="mt-8 pt-6 border-t border-white/15">
              <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
                {[
                  { num: 1, label: t.step1, icon: 'article' },
                  { num: 2, label: t.step2, icon: 'badge' },
                  { num: 3, label: t.step3, icon: 'cloud_upload' },
                  { num: 4, label: t.step4, icon: 'check_circle' },
                ].map((s) => {
                  const isDone = step > s.num;
                  const isCurrent = step === s.num;
                  return (
                    <div
                      key={s.num}
                      className={`flex flex-col items-center text-center transition-all ${
                        isCurrent
                          ? 'opacity-100 scale-102'
                          : isDone
                          ? 'opacity-90'
                          : 'opacity-40'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-sm mb-1.5 transition-all shadow-md ${
                          isDone
                            ? 'bg-emerald-500 text-white'
                            : isCurrent
                            ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/30 font-black'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isDone ? (
                          <span className="material-symbols-outlined text-[18px]">check</span>
                        ) : (
                          <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                        )}
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-white line-clamp-1">
                        Step {s.num}
                      </span>
                      <span className="text-[9px] sm:text-[11px] text-slate-300 hidden md:block">
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CARD BODY CONTENT */}
          <div className="p-6 sm:p-10">
            <AnimatePresence mode="wait">
              {/* ========================================================== */}
              {/* STEP 1: PANDUAN & SYARAT KETENTUAN RESMI                   */}
              {/* ========================================================== */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="border-b border-slate-200 pb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-[#0B2546] flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-[26px]">
                        menu_book
                      </span>
                      <span>
                        {lang === 'ID'
                          ? '1. Persyaratan & Petunjuk Teknis Serah Simpan'
                          : '1. Requirements & Technical Instructions for Deposit'}
                      </span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      {lang === 'ID'
                        ? 'Harap membaca seluruh panduan resmi di bawah ini sebelum melanjutkan proses serah simpan.'
                        : 'Please carefully read all the official guidelines below before proceeding with the deposit.'}
                    </p>
                  </div>

                  {/* GUIDELINES SECTIONS */}
                  <div className="space-y-4">
                    {/* 1. Persyaratan Dokumen */}
                    <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                      <h3 className="text-sm sm:text-base font-bold text-[#0B2546] flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-black flex items-center justify-center shrink-0">
                          1
                        </span>
                        <span>
                          {lang === 'ID' ? 'Persyaratan Dokumen' : 'Document Requirements'}
                        </span>
                      </h3>
                      <ul className="mt-2.5 text-xs sm:text-sm text-slate-600 space-y-1.5 list-disc list-inside">
                        <li>
                          {lang === 'ID'
                            ? 'File karya ilmiah wajib berformat .PDF, merupakan versi final bebas revisi dari ujian akhir.'
                            : 'Scientific work files must be in .PDF format, final revised version approved from the defense.'}
                        </li>
                        <li>
                          {lang === 'ID'
                            ? 'Halaman Pengesahan ditandatangani dan disahkan oleh Dosen Pembimbing, Penguji, serta Ketua Program Studi (Tanda tangan basah + stempel resmi atau TTE tersertifikasi).'
                            : 'Approval page signed and endorsed by Advisor, Examiners, and Head of Study Program (Wet signature + official stamp or certified digital signature).'}
                        </li>
                        <li>
                          {lang === 'ID'
                            ? 'Halaman Pernyataan Keaslian Naskah bermeterai sah (e-Meterai / Meterai Fisik Rp 10.000).'
                            : 'Originality declaration page stamped with valid legal duty stamp (Rp 10,000).'}
                        </li>
                      </ul>
                    </div>

                    {/* 2. Persyaratan Tambahan S2 & S3 (DropBox Gedung F Lantai 1) */}
                    <div className="bg-amber-50/80 p-4 sm:p-5 rounded-2xl border border-amber-200">
                      <h3 className="text-sm sm:text-base font-bold text-amber-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 text-xs font-black flex items-center justify-center shrink-0">
                          2
                        </span>
                        <span>
                          {lang === 'ID'
                            ? 'Persyaratan Tambahan Mahasiswa Pascasarjana (S2 & S3)'
                            : 'Additional Requirements for Postgraduate Students (S2 & S3)'}
                        </span>
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-amber-800 leading-relaxed">
                        {lang === 'ID' ? (
                          <>
                            Khusus mahasiswa jenjang <strong>Magister (S2)</strong> dan{' '}
                            <strong>Doktor (S3)</strong>, selain mengunggah berkas digital,{' '}
                            <strong>WAJIB menyerahkan 1 (satu) eksemplar naskah hard copy</strong>{' '}
                            karya ilmiah yang telah dijilid rapi.
                          </>
                        ) : (
                          <>
                            For <strong>Master (S2)</strong> and <strong>Doctoral (S3)</strong>{' '}
                            students, in addition to digital upload, you are{' '}
                            <strong>REQUIRED to submit 1 (one) bound hard copy</strong> of your
                            scientific work.
                          </>
                        )}
                      </p>
                      <div className="mt-3 bg-white p-3 rounded-xl border border-amber-300/80 text-xs text-slate-700 flex items-start gap-2.5 shadow-sm">
                        <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">
                          local_shipping
                        </span>
                        <div>
                          <strong className="text-amber-900 block font-bold">
                            {lang === 'ID'
                              ? '📍 Lokasi Penyerahan Langsung (DropBox Pascasarjana):'
                              : '📍 Direct DropBox Submission Location:'}
                          </strong>
                          <span>
                            Self Access Centre, Fakultas Ekonomi dan Bisnis Universitas Brawijaya,{' '}
                            <strong>Gedung F Pascasarjana Lantai 1</strong>, Jl. MT Haryono No. 165,
                            Malang 65145.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Berkas Wajib Diunggah */}
                    <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                      <h3 className="text-sm sm:text-base font-bold text-[#0B2546] flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-black flex items-center justify-center shrink-0">
                          3
                        </span>
                        <span>
                          {lang === 'ID'
                            ? 'Berkas Wajib di-Upload (3 Bagian Terpisah)'
                            : 'Mandatory Files to Upload (3 Separate Sections)'}
                        </span>
                      </h3>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                          <div className="text-xs font-bold text-[#0B2546] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-amber-500">
                              description
                            </span>
                            <span>Bagian Awal</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                            Sampul, Judul, Lembar Pengesahan*, Pernyataan Keaslian*, Abstrak Indo*,
                            Abstract English*, Kata Pengantar, Daftar Isi/Tabel/Gambar.
                          </p>
                          <div className="mt-2 font-mono text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 truncate">
                            NIM_Bagian Awal.pdf
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                          <div className="text-xs font-bold text-[#0B2546] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-blue-600">
                              menu_book
                            </span>
                            <span>Bagian Isi / Utama</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                            Naskah batang tubuh lengkap dari Bab I (Pendahuluan) sampai dengan Bab V
                            (Kesimpulan dan Saran).
                          </p>
                          <div className="mt-2 font-mono text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 truncate">
                            NIM_Bagian Isi.pdf
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                          <div className="text-xs font-bold text-[#0B2546] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-emerald-600">
                              library_books
                            </span>
                            <span>Bagian Akhir</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                            Daftar Pustaka, Lampiran Kuesioner/Output Olah Data, dan Riwayat Hidup
                            Penulis.
                          </p>
                          <div className="mt-2 font-mono text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 truncate">
                            NIM_Bagian Akhir.pdf
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 italic">
                        [*] Wajib ada dan bertanda tangan sah.
                      </p>
                    </div>

                    {/* 4. Cek Kelengkapan & Verifikasi */}
                    <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                      <h3 className="text-sm sm:text-base font-bold text-[#0B2546] flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-black flex items-center justify-center shrink-0">
                          4
                        </span>
                        <span>
                          {lang === 'ID'
                            ? 'Pemeriksaan Kelengkapan & Waktu Verifikasi'
                            : 'Completeness Check & Verification Timeframe'}
                        </span>
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {lang === 'ID' ? (
                          <>
                            Waktu verifikasi naskah berkas oleh staf pengelola SAC FEB UB adalah{' '}
                            <strong>maksimal 1×24 jam hari kerja</strong> (Senin–Jumat pukul
                            08.00–15.00 WIB). Apabila berkas lengkap, Anda akan diterbitkan{' '}
                            <strong>Surat Bukti Serah Simpan / Bebas Pustaka</strong> yang dapat
                            diunduh dan digunakan untuk syarat wisuda. Jika terdapat kekurangan,
                            catatan revisi akan dikirim ke email terdaftar.
                          </>
                        ) : (
                          <>
                            Verification by SAC FEB UB officers takes a maximum of{' '}
                            <strong>1×24 working hours</strong> (Monday–Friday 08.00–15.00 WIB). Once
                            approved, an official <strong>Certificate of Scientific Deposit</strong>{' '}
                            will be issued for graduation clearance.
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* 5. KONFIRMASI KESIAPAN DOKUMEN */}
                  <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-center space-y-4">
                    <p className="text-xs sm:text-sm font-semibold text-[#0B2546] max-w-xl mx-auto leading-relaxed">
                      {lang === 'ID'
                        ? 'Apakah Dokumen Serah Simpan Anda Sudah Siap dan Sesuai dengan Ketentuan? Jika Sudah Apakah Anda Akan Melakukan Proses Serah Simpan?'
                        : 'Are your deposit documents ready and compliant with the requirements? If yes, would you like to proceed with the deposit process?'}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0B2546] hover:bg-slate-900 text-amber-300 font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[20px] text-amber-400">
                          check_circle
                        </span>
                        <span>{t.yes}</span>
                      </button>

                      <Link
                        href="/"
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-300 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[20px] text-slate-500">
                          close
                        </span>
                        <span>{t.no}</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ========================================================== */}
              {/* STEP 2: VERIFIKASI NIM & DATA MAHASISWA                    */}
              {/* ========================================================== */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#0B2546] flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500 text-[26px]">
                          badge
                        </span>
                        <span>
                          {lang === 'ID'
                            ? '2. Verifikasi NIM & Data Mahasiswa'
                            : '2. Student ID Verification & Details'}
                        </span>
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        {lang === 'ID'
                          ? 'Masukkan Nomor Induk Mahasiswa (NIM) Anda untuk validasi data otomatis.'
                          : 'Enter your Student ID number for automated data retrieval.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-semibold text-slate-500 hover:text-[#0B2546] flex items-center gap-1 self-start sm:self-auto"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                      <span>{t.back}</span>
                    </button>
                  </div>

                  {/* SEARCH NIM CARD */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <form onSubmit={handleVerifyNim} className="space-y-3">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {lang === 'ID'
                          ? 'Verifikasi NIM / Enter your Student Identification Number without spaces'
                          : 'Student ID Verification (Without spaces)'}
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                            pin
                          </span>
                          <input
                            type="text"
                            value={searchNim}
                            onChange={(e) => setSearchNim(e.target.value.replace(/\s+/g, ''))}
                            placeholder="Contoh: 215020207111001"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#0B2546] focus:ring-2 focus:ring-blue-100 text-sm font-mono font-medium outline-none transition-all bg-white"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isVerifying}
                          className="px-6 py-3 rounded-xl bg-[#0B2546] hover:bg-slate-900 text-amber-300 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                        >
                          {isVerifying ? (
                            <>
                              <div className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                              <span>{lang === 'ID' ? 'Memeriksa...' : 'Verifying...'}</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[18px]">lock_open</span>
                              <span>{lang === 'ID' ? '🔐 Verifikasi' : '🔐 Verify'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {verifyError && (
                        <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5 mt-1">
                          <span className="material-symbols-outlined text-[16px]">error</span>
                          <span>{verifyError}</span>
                        </p>
                      )}
                    </form>
                  </div>

                  {/* CONDITION A: NIM FOUND (GREEN SUCCESS CARD) */}
                  {verifiedMember && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
                            <span className="material-symbols-outlined text-[24px]">verified</span>
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-bold text-emerald-950">
                              {lang === 'ID'
                                ? 'Data Mahasiswa Terverifikasi'
                                : 'Student Data Verified'}
                            </h3>
                            <span className="text-xs text-emerald-700">
                              {lang === 'ID'
                                ? 'Identitas terdaftar resmi pada Sistem Keanggotaan SAC FEB UB'
                                : 'Officially registered in SAC FEB UB Membership System'}
                            </span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 bg-emerald-200 text-emerald-900 rounded-full text-[11px] font-bold">
                          TERDAFTAR
                        </span>
                      </div>

                      <div className="bg-white/80 rounded-xl p-4 border border-emerald-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block font-medium">Nomor Induk Mahasiswa (NIM):</span>
                          <span className="font-mono font-bold text-slate-800 text-sm">
                            {verifiedMember.identityNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Nama Lengkap:</span>
                          <span className="font-bold text-slate-800 text-sm">
                            {verifiedMember.fullName}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Jenjang & Program Studi:</span>
                          <span className="font-bold text-slate-800">
                            {verifiedMember.degreeLevel} — {verifiedMember.studyProgram}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Email Terdaftar:</span>
                          <span className="font-medium text-slate-800">
                            {verifiedMember.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setVerifiedMember(null);
                            setSearchNim('');
                          }}
                          className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-white/60 rounded-xl transition-colors"
                        >
                          {lang === 'ID' ? 'Ganti NIM' : 'Change NIM'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0B2546] hover:bg-slate-900 text-amber-300 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <span>
                            {lang === 'ID'
                              ? 'Lanjut ke Unggah Berkas'
                              : 'Proceed to Upload Documents'}
                          </span>
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* CONDITION B: NIM NOT FOUND (YELLOW BANNER & FORM MAHASISWA BARU) */}
                  {isNewStudentForm && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-5"
                    >
                      {/* YELLOW BANNER */}
                      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-amber-900">
                        <span className="material-symbols-outlined text-amber-600 text-[22px] shrink-0 mt-0.5">
                          info
                        </span>
                        <p className="text-xs sm:text-sm leading-relaxed">
                          <strong>
                            {lang === 'ID'
                              ? 'Data NIM tidak ditemukan. Silakan lengkapi data mahasiswa berikut.'
                              : 'The NIM was not found. Please complete the following student data.'}
                          </strong>
                          <br />
                          <span className="text-[11px] text-amber-800">
                            {lang === 'ID'
                              ? 'Data ini akan disimpan untuk identitas serah simpan dan pembuatan bukti bebas pustaka.'
                              : 'This data will be recorded for your deposit certificate and library clearance.'}
                          </span>
                        </p>
                      </div>

                      {/* STUDENT FORM */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          // Basic validation
                          if (
                            !studentData.fullName.trim() ||
                            !studentData.email.trim() ||
                            !studentData.whatsappNumber.trim() ||
                            !studentData.mailingAddress.trim()
                          ) {
                            alert(
                              lang === 'ID'
                                ? 'Harap lengkapi seluruh kolom formulir data mahasiswa.'
                                : 'Please fill in all student data fields.'
                            );
                            return;
                          }
                          setStep(3);
                        }}
                        className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm"
                      >
                        <h3 className="text-sm font-bold text-[#0B2546] border-b border-slate-100 pb-2">
                          {lang === 'ID'
                            ? 'Formulir Data Mahasiswa Pengunggah'
                            : 'Student Information Form'}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          {/* 1. NIM (Read-only) */}
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              1. Nomor Induk Mahasiswa (NIM)
                            </label>
                            <input
                              type="text"
                              value={studentData.identityNumber}
                              disabled
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono font-bold text-slate-600 cursor-not-allowed outline-none"
                            />
                          </div>

                          {/* 2. Nama Lengkap */}
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              2. Nama Lengkap Mahasiswa *
                            </label>
                            <input
                              type="text"
                              required
                              value={studentData.fullName}
                              onChange={(e) =>
                                setStudentData({ ...studentData, fullName: e.target.value })
                              }
                              placeholder="Nama lengkap sesuai SIAM UB"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B2546] focus:ring-2 focus:ring-blue-100 outline-none font-medium"
                            />
                          </div>

                          {/* 3. Program Studi / Jenjang */}
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              3. Jenjang Pendidikan (Degree Level) *
                            </label>
                            <select
                              value={studentData.degreeLevel}
                              onChange={(e) => {
                                const level = e.target.value;
                                setStudentData({ ...studentData, degreeLevel: level });
                                if (level === 'S2') setWorkData((w) => ({ ...w, workType: 'Tesis' }));
                                else if (level === 'S3') setWorkData((w) => ({ ...w, workType: 'Disertasi' }));
                                else setWorkData((w) => ({ ...w, workType: 'Skripsi' }));
                              }}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B2546] focus:ring-2 focus:ring-blue-100 outline-none font-medium bg-white"
                            >
                              <option value="S1">S1 (Sarjana)</option>
                              <option value="S2">S2 (Magister)</option>
                              <option value="S3">S3 (Doktor)</option>
                              <option value="Profesi">Profesi (PPAk)</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              Program Studi (Department) *
                            </label>
                            <select
                              value={studentData.studyProgram}
                              onChange={(e) =>
                                setStudentData({ ...studentData, studyProgram: e.target.value })
                              }
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B2546] focus:ring-2 focus:ring-blue-100 outline-none font-medium bg-white truncate"
                            >
                              {STUDY_PROGRAMS.map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* 4. WhatsApp dengan Kode Negara */}
                          <div className="sm:col-span-2">
                            <label className="block font-bold text-slate-700 mb-1">
                              4. Nomor WhatsApp Aktif *
                            </label>
                            <div className="flex gap-2">
                              <select
                                value={studentData.whatsappCountryCode}
                                onChange={(e) =>
                                  setStudentData({
                                    ...studentData,
                                    whatsappCountryCode: e.target.value,
                                  })
                                }
                                className="w-36 sm:w-44 px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B2546] focus:ring-2 focus:ring-blue-100 outline-none font-medium bg-white shrink-0 text-xs"
                              >
                                {COUNTRY_CODES.map((c) => (
                                  <option key={c.code} value={c.code}>
                                    {c.label}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                required
                                value={studentData.whatsappNumber}
                                onChange={(e) =>
                                  setStudentData({
                                    ...studentData,
                                    whatsappNumber: e.target.value.replace(/\D/g, ''),
                                  })
                                }
                                placeholder="81234567890 (tanpa awalan 0)"
                                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B2546] focus:ring-2 focus:ring-blue-100 outline-none font-mono font-medium"
                              />
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">
                              {lang === 'ID'
                                ? 'Kode negara dapat dipilih. Masukkan nomor tanpa spasi atau tanda hubung.'
                                : 'Country code can be selected. Enter number without dashes.'}
                            </p>
                          </div>

                          {/* 5. Email */}
                          <div className="sm:col-span-2">
                            <label className="block font-bold text-slate-700 mb-1">
                              5. Alamat Email Aktif *
                            </label>
                            <input
                              type="email"
                              required
                              value={studentData.email}
                              onChange={(e) =>
                                setStudentData({ ...studentData, email: e.target.value })
                              }
                              placeholder="nama@student.ub.ac.id"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B2546] focus:ring-2 focus:ring-blue-100 outline-none font-medium"
                            />
                          </div>

                          {/* 6. Alamat Surat */}
                          <div className="sm:col-span-2">
                            <label className="block font-bold text-slate-700 mb-1">
                              6. Alamat Surat Lengkap (Mailing Address) *
                            </label>
                            <textarea
                              required
                              rows={2}
                              value={studentData.mailingAddress}
                              onChange={(e) =>
                                setStudentData({ ...studentData, mailingAddress: e.target.value })
                              }
                              placeholder="Alamat domisili atau asal lengkap beserta kota"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B2546] focus:ring-2 focus:ring-blue-100 outline-none font-medium resize-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                          <button
                            type="submit"
                            className="px-6 py-3 rounded-xl bg-[#0B2546] hover:bg-slate-900 text-amber-300 font-bold text-sm shadow-md transition-all flex items-center gap-2"
                          >
                            <span>
                              {lang === 'ID'
                                ? '💾 Simpan Data & Lanjut'
                                : '💾 Save Data & Continue'}
                            </span>
                            <span className="material-symbols-outlined text-[18px]">
                              arrow_forward
                            </span>
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* ========================================================== */}
              {/* STEP 3: FORM UNGGAH KARYA ILMIAH                          */}
              {/* ========================================================== */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#0B2546] flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500 text-[26px]">
                          cloud_upload
                        </span>
                        <span>
                          {lang === 'ID'
                            ? '3. Form Metadata & Unggah Berkas Karya Ilmiah'
                            : '3. Metadata & Document Upload Form'}
                        </span>
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        {lang === 'ID'
                          ? 'Pengunggah: '
                          : 'Depositor: '}
                        <strong>{studentData.fullName}</strong> ({studentData.identityNumber} —{' '}
                        {studentData.degreeLevel})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-xs font-semibold text-slate-500 hover:text-[#0B2546] flex items-center gap-1 self-start sm:self-auto"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                      <span>{t.back}</span>
                    </button>
                  </div>

                  <form onSubmit={handleSubmitDeposit} className="space-y-6">
                    {/* METADATA KARYA ILMIAH */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                      <h3 className="text-sm font-bold text-[#0B2546] flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500 text-[18px]">
                          edit_note
                        </span>
                        <span>
                          {lang === 'ID'
                            ? 'Metadata Naskah Karya Ilmiah'
                            : 'Scientific Work Metadata'}
                        </span>
                      </h3>

                      <div className="space-y-3 text-xs">
                        {/* Judul Indonesia */}
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Judul Karya Ilmiah (Bahasa Indonesia) *
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={workData.titleId}
                            onChange={(e) =>
                              setWorkData({ ...workData, titleId: e.target.value })
                            }
                            placeholder="Contoh: Analisis Pengaruh Tingkat Inflasi dan Suku Bunga BI Terhadap Kinerja Saham Sektor Perbankan di Bursa Efek Indonesia"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B2546] focus:ring-2 focus:ring-blue-100 outline-none font-medium resize-none bg-white"
                          />
                        </div>

                        {/* Judul Inggris */}
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Judul Bahasa Inggris (Title in English)
                          </label>
                          <textarea
                            rows={2}
                            value={workData.titleEn}
                            onChange={(e) =>
                              setWorkData({ ...workData, titleEn: e.target.value })
                            }
                            placeholder="Example: Analysis of Inflation Rate and BI Interest Rate Effects on Banking Stock Performance in Indonesia Stock Exchange"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B2546] focus:ring-2 focus:ring-blue-100 outline-none font-medium resize-none bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                          {/* Jenis Karya */}
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              Jenis Karya Ilmiah *
                            </label>
                            <select
                              value={workData.workType}
                              onChange={(e) =>
                                setWorkData({ ...workData, workType: e.target.value })
                              }
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B2546] focus:ring-2 focus:ring-blue-100 outline-none font-medium bg-white"
                            >
                              <option value="Skripsi">Skripsi (S1)</option>
                              <option value="Tesis">Tesis (S2)</option>
                              <option value="Disertasi">Disertasi (S3)</option>
                            </select>
                          </div>

                          {/* Dosen Pembimbing */}
                          <div className="sm:col-span-2">
                            <label className="block font-bold text-slate-700 mb-1">
                              Dosen Pembimbing / Promotor Utama
                            </label>
                            <input
                              type="text"
                              value={workData.advisor}
                              onChange={(e) =>
                                setWorkData({ ...workData, advisor: e.target.value })
                              }
                              placeholder="Nama Dosen Pembimbing beserta gelar lengkap"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B2546] focus:ring-2 focus:ring-blue-100 outline-none font-medium bg-white"
                            />
                          </div>

                          {/* Dosen Penguji 1 */}
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              Dosen Penguji 1
                            </label>
                            <input
                              type="text"
                              value={workData.examiner1}
                              onChange={(e) =>
                                setWorkData({ ...workData, examiner1: e.target.value })
                              }
                              placeholder="Nama Penguji 1"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B2546] focus:ring-2 focus:ring-blue-100 outline-none font-medium bg-white"
                            />
                          </div>

                          {/* Dosen Penguji 2 */}
                          <div className="sm:col-span-2">
                            <label className="block font-bold text-slate-700 mb-1">
                              Dosen Penguji 2
                            </label>
                            <input
                              type="text"
                              value={workData.examiner2}
                              onChange={(e) =>
                                setWorkData({ ...workData, examiner2: e.target.value })
                              }
                              placeholder="Nama Penguji 2 (jika ada)"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B2546] focus:ring-2 focus:ring-blue-100 outline-none font-medium bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AREA UNGGAH 3 BERKAS PDF */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-[#0B2546] flex items-center gap-2">
                          <span className="material-symbols-outlined text-amber-500 text-[20px]">
                            folder_zip
                          </span>
                          <span>
                            {lang === 'ID'
                              ? 'Unggah 3 Berkas Dokumen PDF (Maks. 25MB per file)'
                              : 'Upload 3 PDF Files (Max 25MB each)'}
                          </span>
                        </h3>
                        <span className="text-xs font-semibold text-slate-400">
                          Format: .PDF
                        </span>
                      </div>

                      {/* 1. BAGIAN AWAL */}
                      <div
                        className={`p-4 rounded-2xl border transition-all ${
                          fileAwal
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                fileAwal
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {fileAwal ? 'check' : 'description'}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                                  1. Bagian Awal (Cover, Pengesahan, Pernyataan, Abstrak) *
                                </h4>
                                <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                  {studentData.identityNumber}_Bagian Awal.pdf
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Lembar judul s/d daftar isi & gambar lengkap tanda tangan sah.
                              </p>
                              {fileAwal && (
                                <p className="text-xs font-medium text-emerald-800 mt-1 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[16px]">
                                    attach_file
                                  </span>
                                  <span>
                                    {fileAwal.name} ({formatBytes(fileAwal.size)})
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <input
                              id={fileAwalInputId}
                              type="file"
                              accept="application/pdf,.pdf"
                              onChange={(e) => handleFileUpload(e, 'awal')}
                              className="hidden"
                            />
                            <label
                              htmlFor={fileAwalInputId}
                              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                                fileAwal
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-[#0B2546] text-amber-300 hover:bg-slate-900 shadow-sm'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {fileAwal ? 'cached' : 'upload_file'}
                              </span>
                              <span>
                                {fileAwal
                                  ? lang === 'ID'
                                    ? 'Ganti File'
                                    : 'Replace'
                                  : lang === 'ID'
                                  ? 'Pilih File PDF'
                                  : 'Select PDF'}
                              </span>
                            </label>
                            {fileAwal && (
                              <button
                                type="button"
                                onClick={() => setFileAwal(null)}
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  delete
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 2. BAGIAN ISI */}
                      <div
                        className={`p-4 rounded-2xl border transition-all ${
                          fileIsi
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                fileIsi
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {fileIsi ? 'check' : 'menu_book'}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                                  2. Bagian Isi / Utama (Bab I s/d Bab Akhir) *
                                </h4>
                                <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                  {studentData.identityNumber}_Bagian Isi.pdf
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Seluruh naskah batang tubuh karya ilmiah dari Bab 1 hingga bab kesimpulan.
                              </p>
                              {fileIsi && (
                                <p className="text-xs font-medium text-emerald-800 mt-1 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[16px]">
                                    attach_file
                                  </span>
                                  <span>
                                    {fileIsi.name} ({formatBytes(fileIsi.size)})
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <input
                              id={fileIsiInputId}
                              type="file"
                              accept="application/pdf,.pdf"
                              onChange={(e) => handleFileUpload(e, 'isi')}
                              className="hidden"
                            />
                            <label
                              htmlFor={fileIsiInputId}
                              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                                fileIsi
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-[#0B2546] text-amber-300 hover:bg-slate-900 shadow-sm'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {fileIsi ? 'cached' : 'upload_file'}
                              </span>
                              <span>
                                {fileIsi
                                  ? lang === 'ID'
                                    ? 'Ganti File'
                                    : 'Replace'
                                  : lang === 'ID'
                                  ? 'Pilih File PDF'
                                  : 'Select PDF'}
                              </span>
                            </label>
                            {fileIsi && (
                              <button
                                type="button"
                                onClick={() => setFileIsi(null)}
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  delete
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 3. BAGIAN AKHIR */}
                      <div
                        className={`p-4 rounded-2xl border transition-all ${
                          fileAkhir
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                fileAkhir
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-teal-100 text-teal-800'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {fileAkhir ? 'check' : 'library_books'}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                                  3. Bagian Akhir (Daftar Pustaka & Lampiran) *
                                </h4>
                                <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                  {studentData.identityNumber}_Bagian Akhir.pdf
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Referensi kepustakaan, lampiran data/kuesioner, dan curriculum vitae penulis.
                              </p>
                              {fileAkhir && (
                                <p className="text-xs font-medium text-emerald-800 mt-1 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[16px]">
                                    attach_file
                                  </span>
                                  <span>
                                    {fileAkhir.name} ({formatBytes(fileAkhir.size)})
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <input
                              id={fileAkhirInputId}
                              type="file"
                              accept="application/pdf,.pdf"
                              onChange={(e) => handleFileUpload(e, 'akhir')}
                              className="hidden"
                            />
                            <label
                              htmlFor={fileAkhirInputId}
                              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                                fileAkhir
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-[#0B2546] text-amber-300 hover:bg-slate-900 shadow-sm'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {fileAkhir ? 'cached' : 'upload_file'}
                              </span>
                              <span>
                                {fileAkhir
                                  ? lang === 'ID'
                                    ? 'Ganti File'
                                    : 'Replace'
                                  : lang === 'ID'
                                  ? 'Pilih File PDF'
                                  : 'Select PDF'}
                              </span>
                            </label>
                            {fileAkhir && (
                              <button
                                type="button"
                                onClick={() => setFileAkhir(null)}
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  delete
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* PERNYATAAN INTEGRITAS & CHECKBOX */}
                    <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={workData.agreedToTerms}
                          onChange={(e) =>
                            setWorkData({ ...workData, agreedToTerms: e.target.checked })
                          }
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#0B2546] focus:ring-[#0B2546]"
                        />
                        <span className="text-xs text-slate-700 leading-relaxed">
                          <strong>
                            {lang === 'ID'
                              ? 'Pernyataan Keaslian & Kesesuaian Naskah:'
                              : 'Statement of Authenticity & Compliance:'}
                          </strong>{' '}
                          {lang === 'ID'
                            ? 'Saya menyatakan bahwa seluruh berkas yang diunggah adalah versi final bebas revisi dari dewan penguji dan telah disahkan sesuai ketentuan resmi Fakultas Ekonomi dan Bisnis Universitas Brawijaya. Data yang saya isi adalah benar dan dapat dipertanggungjawabkan.'
                            : 'I declare that all uploaded files represent the final revised version approved by the examination board and certified according to FEB UB regulations. All provided data is accurate.'}
                        </span>
                      </label>
                    </div>

                    {submitError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        <span>{submitError}</span>
                      </div>
                    )}

                    {/* ACTION BUTTONS */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        <span>{t.back}</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0B2546] hover:bg-slate-900 text-amber-300 font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                            <span>
                              {lang === 'ID' ? 'Memproses Pengiriman...' : 'Processing Submission...'}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[20px] text-amber-400">
                              send
                            </span>
                            <span>
                              {lang === 'ID'
                                ? 'Kirim Dokumen / Submit Deposit'
                                : 'Submit Deposit Documents'}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ========================================================== */}
              {/* STEP 4: KONFIRMASI & STATUS PENYERAHAN                     */}
              {/* ========================================================== */}
              {step === 4 && receiptData && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-6"
                >
                  {/* SUCCESS HEADER BADGE */}
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-lg ring-8 ring-emerald-100">
                      <span className="material-symbols-outlined text-[36px]">check</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0B2546]">
                      {lang === 'ID'
                        ? 'Serah Simpan Berhasil Disubmit'
                        : 'Submission Received Successfully'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                      {lang === 'ID'
                        ? 'Dokumen karya ilmiah Anda telah tercatat pada sistem SAC-ONE dan memasuki tahap verifikasi petugas.'
                        : 'Your scientific work has been recorded into SAC-ONE system and is now in the queue for staff verification.'}
                    </p>
                  </div>

                  {/* DIGITAL RECEIPT CARD */}
                  <div className="bg-slate-50 rounded-2xl sm:rounded-3xl border-2 border-[#0B2546]/20 p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Nomor Registrasi Serah Simpan:
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xl sm:text-2xl font-black font-mono text-[#0B2546]">
                            {receiptData.depositNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(receiptData.depositNumber)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors text-xs flex items-center gap-1 font-semibold"
                            title="Salin Nomor"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {copiedNumber ? 'done' : 'content_copy'}
                            </span>
                            <span className="text-[11px] hidden sm:inline">
                              {copiedNumber ? 'Tersalin' : 'Salin'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex flex-col items-start sm:items-end">
                        <span className="px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black tracking-wide flex items-center gap-1.5 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span>PENDING VERIFIKASI (Maks. 1×24 Jam Kerja)</span>
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">
                          Node F1-PASCA • SAC FEB UB
                        </span>
                      </div>
                    </div>

                    {/* DETAILS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Nama Mahasiswa:</span>
                        <span className="font-bold text-slate-800 text-sm">{receiptData.fullName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Nomor Induk Mahasiswa (NIM):</span>
                        <span className="font-mono font-bold text-slate-800 text-sm">
                          {receiptData.identityNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Jenjang & Program Studi:</span>
                        <span className="font-bold text-slate-800">
                          {receiptData.degreeLevel} — {receiptData.studyProgram || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Jenis Karya:</span>
                        <span className="font-bold text-[#0B2546]">{receiptData.workType}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block font-medium">Judul Karya Ilmiah (ID):</span>
                        <span className="font-semibold text-slate-800 leading-relaxed">
                          {receiptData.titleId}
                        </span>
                      </div>
                      {receiptData.titleEn && (
                        <div className="sm:col-span-2">
                          <span className="text-slate-400 block font-medium">
                            Title in English:
                          </span>
                          <span className="italic text-slate-600 leading-relaxed">
                            {receiptData.titleEn}
                          </span>
                        </div>
                      )}
                      {receiptData.advisor && (
                        <div>
                          <span className="text-slate-400 block font-medium">
                            Dosen Pembimbing:
                          </span>
                          <span className="font-medium text-slate-800">{receiptData.advisor}</span>
                        </div>
                      )}
                      {(receiptData.examiner1 || receiptData.examiner2) && (
                        <div>
                          <span className="text-slate-400 block font-medium">Dosen Penguji:</span>
                          <span className="font-medium text-slate-800">
                            {[receiptData.examiner1, receiptData.examiner2]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-400 block font-medium">Email Notifikasi:</span>
                        <span className="font-medium text-slate-800">{receiptData.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Waktu Pengajuan:</span>
                        <span className="font-medium text-slate-800">
                          {new Date().toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* S2 & S3 DROPBOX ALERT NOTE */}
                    {(receiptData.degreeLevel === 'S2' ||
                      receiptData.degreeLevel === 'S3' ||
                      receiptData.workType === 'Tesis' ||
                      receiptData.workType === 'Disertasi') && (
                      <div className="p-4 rounded-2xl bg-amber-100/70 border border-amber-300 text-amber-950 flex items-start gap-3">
                        <span className="material-symbols-outlined text-amber-700 text-[24px] shrink-0 mt-0.5">
                          local_shipping
                        </span>
                        <div className="text-xs space-y-1">
                          <strong className="font-bold text-amber-950 block">
                            PENGINGAT PENYERAHAN HARD COPY PROGRAM PASCASARJANA (S2 / S3):
                          </strong>
                          <p className="leading-relaxed text-amber-900">
                            Anda wajib menyerahkan <strong>1 (satu) eksemplar naskah hard copy</strong>{' '}
                            karya ilmiah yang telah dijilid rapi ke:
                            <br />
                            📍 <strong>DropBox Pascasarjana:</strong> Self Access Centre FEB UB,{' '}
                            <strong>Gedung F Pascasarjana Lantai 1</strong>, Jl. MT Haryono No. 165,
                            Malang 65145.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPrintPreview(true)}
                      className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px] text-amber-400">
                        visibility
                      </span>
                      <span>
                        {lang === 'ID'
                          ? 'Lihat Pratinjau Lembar Bukti'
                          : 'Preview Official Document'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => exportDepositReceiptPDF(receiptData)}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">print</span>
                      <span>
                        {lang === 'ID'
                          ? 'Cetak Bukti Tanda Terima (PDF)'
                          : 'Print Deposit Receipt (PDF)'}
                      </span>
                    </button>

                    <Link
                      href="/"
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0B2546] hover:bg-slate-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[20px]">home</span>
                      <span>{t.backToHome}</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setSearchNim('');
                        setVerifiedMember(null);
                        setIsNewStudentForm(false);
                        setFileAwal(null);
                        setFileIsi(null);
                        setFileAkhir(null);
                        setReceiptData(null);
                      }}
                      className="w-full sm:w-auto px-4 py-3.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors"
                    >
                      {lang === 'ID' ? 'Serahkan Dokumen Baru' : 'Submit Another Document'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* MODAL: PRATINJAU LEMBAR CETAK RESMI */}
        <AnimatePresence>
          {showPrintPreview && receiptData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-300 overflow-hidden my-6"
              >
                {/* Modal Action Bar */}
                <div className="bg-[#0B2546] px-5 py-3.5 flex items-center justify-between text-white border-b border-amber-400/40">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[20px]">
                      visibility
                    </span>
                    <span className="text-xs sm:text-sm font-bold tracking-tight">
                      {lang === 'ID'
                        ? 'Pratinjau Lembar Bukti Tanda Terima Serah Simpan Resmi'
                        : 'Official Deposit Receipt Print Preview'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => exportDepositReceiptPDF(receiptData)}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">print</span>
                      <span>{lang === 'ID' ? 'Cetak / Unduh PDF' : 'Print / Download PDF'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPrintPreview(false)}
                      className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                      title="Tutup"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                </div>

                {/* Printable Document Paper Simulation */}
                <div className="p-4 sm:p-6 bg-slate-100 max-h-[75vh] overflow-y-auto">
                  <div className="bg-white shadow-md border border-slate-300 rounded-lg overflow-hidden text-slate-800">
                    {/* Header Bar */}
                    <div className="bg-[#0B2546] text-white px-6 py-4 relative border-b-4 border-[#D4AF37]">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold tracking-wide text-white uppercase">
                            SELF ACCESS CENTRE (SAC) — FEB UNIVERSITAS BRAWIJAYA
                          </h3>
                          <p className="text-[10px] text-amber-300 font-medium mt-0.5">
                            Sistem Serah Simpan Karya Ilmiah Mahasiswa Mandiri (SAC-ONE)
                          </p>
                          <p className="text-[9px] text-slate-300 mt-0.5">
                            Gedung F Pascasarjana Lt. 1 &amp; Gedung F Lt. 2, Jl. MT Haryono No. 165, Malang 65145
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-amber-400 text-[36px] opacity-80 shrink-0">
                          school
                        </span>
                      </div>
                    </div>

                    {/* Paper Body */}
                    <div className="p-6 space-y-4 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <div>
                          <h4 className="text-sm font-bold text-[#0B2546]">
                            BUKTI PENERIMAAN SERAH SIMPAN KARYA ILMIAH
                          </h4>
                          <span className="text-[10px] text-slate-500">
                            Waktu Pengajuan: {new Date(receiptData.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })} | No. Registrasi: <strong>{receiptData.depositNumber}</strong>
                          </span>
                        </div>
                        <span className="px-2.5 py-1 bg-amber-100 border border-amber-300 text-amber-900 rounded text-[10px] font-bold self-start sm:self-auto">
                          STATUS: PENDING VERIFIKASI (Maks. 1×24 Jam Kerja)
                        </span>
                      </div>

                      {/* Official Table */}
                      <table className="w-full border-collapse border border-slate-200 text-xs">
                        <thead>
                          <tr className="bg-[#0B2546] text-white">
                            <th className="border border-slate-300 p-2 text-left w-1/3">Rincian Data Serah Simpan</th>
                            <th className="border border-slate-300 p-2 text-left">Informasi Dokumen</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr className="bg-slate-50">
                            <td className="p-2 font-bold text-slate-700">Nomor Registrasi</td>
                            <td className="p-2 font-mono font-bold text-[#0B2546]">{receiptData.depositNumber}</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-slate-700">Nomor Induk Mahasiswa (NIM)</td>
                            <td className="p-2 font-mono font-bold">{receiptData.identityNumber}</td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td className="p-2 font-bold text-slate-700">Nama Lengkap Mahasiswa</td>
                            <td className="p-2 font-bold">{receiptData.fullName}</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-slate-700">Jenjang / Program Studi</td>
                            <td className="p-2">{receiptData.degreeLevel} — {receiptData.studyProgram || '-'}</td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td className="p-2 font-bold text-slate-700">Jenis Karya Ilmiah</td>
                            <td className="p-2 font-semibold text-[#0B2546]">{receiptData.workType}</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-slate-700">Judul Karya Ilmiah (ID)</td>
                            <td className="p-2 font-semibold leading-relaxed">{receiptData.titleId}</td>
                          </tr>
                          {receiptData.titleEn && (
                            <tr className="bg-slate-50">
                              <td className="p-2 font-bold text-slate-700">Judul Karya Ilmiah (EN)</td>
                              <td className="p-2 italic text-slate-600 leading-relaxed">{receiptData.titleEn}</td>
                            </tr>
                          )}
                          <tr>
                            <td className="p-2 font-bold text-slate-700">Dosen Pembimbing / Promotor</td>
                            <td className="p-2">{receiptData.advisor || '-'}</td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td className="p-2 font-bold text-slate-700">Dosen Penguji</td>
                            <td className="p-2">{[receiptData.examiner1, receiptData.examiner2].filter(Boolean).join(', ') || '-'}</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-slate-700">Kontak / Email Mahasiswa</td>
                            <td className="p-2">{receiptData.whatsappCountryCode || '+62'} {receiptData.whatsappNumber} | {receiptData.email}</td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td className="p-2 font-bold text-slate-700">Alamat Surat</td>
                            <td className="p-2">{receiptData.mailingAddress || '-'}</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Hardcopy Alert for S2/S3 */}
                      {(receiptData.degreeLevel === 'S2' || receiptData.degreeLevel === 'S3' || receiptData.workType === 'Tesis' || receiptData.workType === 'Disertasi') && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-[11px] leading-relaxed">
                          <strong className="text-red-800 block font-bold">PERHATIAN KHUSUS MAHASISWA PROGRAM PASCASARJANA (S2 / S3):</strong>
                          Wajib menyerahkan 1 eksemplar hard copy karya ilmiah ke <strong>DROPBOX Pascasarjana:</strong> Self Access Centre FEB UB, Gedung F Pascasarjana Lantai 1, Jl. MT Haryono No. 165, Malang 65145.
                        </div>
                      )}

                      {/* Verification Notice */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[10px] space-y-1">
                        <strong className="text-slate-800 block">KETENTUAN PROSES VERIFIKASI &amp; BUKTI BEBAS PUSTAKA:</strong>
                        <p>1. Petugas SAC FEB UB akan melakukan verifikasi berkas naskah PDF maksimal 1×24 jam hari kerja (Senin–Jumat).</p>
                        <p>2. Surat Bukti Serah Simpan resmi akan diterbitkan otomatis via email setelah status diverifikasi (APPROVED).</p>
                      </div>

                      {/* Paper Footer */}
                      <div className="pt-2 border-t border-slate-200 text-[9px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-1">
                        <span>Dokumen ini dicetak otomatis oleh Sistem SAC-ONE FEB Universitas Brawijaya dan sah tanpa tanda tangan basah.</span>
                        <span className="font-mono">Kode Verifikasi: {receiptData.depositNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>


        {/* FOOTER METADATA */}
        <div className="mt-8 text-center text-xs text-slate-400 space-y-1">
          <p>© {new Date().getFullYear()} Self Access Centre • Fakultas Ekonomi dan Bisnis Universitas Brawijaya</p>
          <p className="text-[11px] text-slate-400">
            Sistem Serah Simpan Karya Ilmiah Terpadu (SAC-ONE) • Gedung F Pascasarjana Lt. 1 &amp; Gedung F Lt. 2
          </p>
        </div>
      </main>
    </div>
  );
}
