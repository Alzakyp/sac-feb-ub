'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const STUDY_PROGRAMS = [
  'S1 Ekonomi Pembangunan',
  'S1 Ekonomi Keuangan dan Perbankan',
  'S1 Ekonomi Islam',
  'S1 Manajemen',
  'S1 Kewirausahaan',
  'S1 Akuntansi',
  'S2 Ilmu Ekonomi',
  'S2 Manajemen',
  'S2 Ilmu Akuntansi',
  'S2 Manajemen Kampus Jakarta',
  'S2 Akuntansi Kampus Jakarta',
  'S3 Ilmu Ekonomi',
  'S3 Ilmu Manajemen',
  'S3 Manajemen Kampus Jakarta',
  'S3 Ilmu Akuntansi',
  'S3 Ilmu Akuntansi Kampus Jakarta',
  'Pendidikan Profesi Akuntansi',
  'Other',
];

const MEMBERSHIP_TYPES = [
  'Mahasiswa FEB-UB',
  'Dosen FEB-UB',
  'Tendik FEB-UB',
  'Non FEB-UB',
  'Other',
];

const IDENTITY_TYPES = [
  'KTM [Student Card]',
  'KTP',
  'Kartu Pegawai [Dosen/Tendik UB]',
  'Pasport',
];

interface RegistrationSuccessData {
  pin: string;
  fullName: string;
  identityNumber: string;
  studyProgram: string;
  membershipType: string;
  identityType: string;
  createdAt?: string;
}

export default function RegisterPage() {
  const [lang, setLang] = useState<'ID' | 'EN'>('ID');
  const [step, setStep] = useState<number>(1);

  // Form State
  const [formData, setFormData] = useState({
    membershipType: 'Mahasiswa FEB-UB',
    identityType: 'KTM [Student Card]',
    identityNumber: '',
    fullName: '',
    studyProgram: 'S1 Manajemen',
    whatsappNumber: '',
    email: '',
    originAddress: '',
    malangAddress: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });

  // Local file previews
  const [selfieFileName, setSelfieFileName] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [idCardFileName, setIdCardFileName] = useState<string | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<RegistrationSuccessData | null>(null);
  const [copiedPin, setCopiedPin] = useState(false);

  // Unique IDs for accessible file inputs
  const selfieInputId = useId();
  const idCardInputId = useId();

  // Translations
  const t = {
    ID: {
      headerTitle: 'SAC FEB UB — Pendaftaran',
      version: 'SAC FEB UB v1.0',
      step1: 'Syarat & Ketentuan',
      step2: 'Jenis & Berkas',
      step3: 'Data Pribadi',
      step4: 'Password',
      step5: 'Kartu Anggota',
      agreeTerms: 'Saya telah membaca dan menyetujui seluruh Syarat & Ketentuan di atas.',
      btnAgree: 'Setuju & Lanjutkan',
      alreadyMember: 'Sudah punya akun? Masuk / Check-In',
      btnBack: 'Kembali',
      btnToPersonal: 'Isi Data Pribadi',
      btnToPassword: 'Buat Password',
      btnSubmit: 'Selesaikan Pendaftaran',
      submitting: 'Memproses Pendaftaran...',
      photoSelfieLabel: 'Upload Foto Selfie',
      photoSelfieHint: 'Pas foto wajah resmi, latar polos, format JPG/PNG.',
      photoIdLabel: 'Upload Kartu Identitas',
      photoIdHint: 'Foto fisik KTM / KTP / Paspor terbaca jelas.',
      guideSelfieTitle: 'Contoh Foto Selfie',
      guideSelfieRule1: 'Wajah tegak lurus menghadap kamera',
      guideSelfieRule2: 'Pencahayaan terang & tanpa kacamata hitam',
      guideSelfieRule3: 'Pakaian rapi berkerah (rasio 3:4 atau 4:6)',
      guideIdTitle: 'Contoh Identitas',
      guideIdRule1: 'Teks NIM / NIK dan nama terbaca jelas',
      guideIdRule2: 'Empat sudut kartu utuh dan tidak terpotong',
      guideIdRule3: 'Tidak terkena pantulan cahaya flash berlebih',
      fullNameLabel: 'Nama Lengkap',
      fullNamePlaceholder: 'Nama lengkap sesuai KTP / KTM',
      prodiLabel: 'Program Studi / Departemen',
      waLabel: 'Nomor WhatsApp Aktif',
      waPlaceholder: '81234567890',
      emailLabel: 'Alamat Email',
      emailHint: 'Gunakan email resmi UB jika tersedia',
      originAddressLabel: 'Alamat Asal (Sesuai KTP)',
      originAddressPlaceholder: 'Contoh: Jl. Diponegoro No. 45, Surabaya, Jawa Timur',
      malangAddressLabel: 'Alamat di Malang (Opsional / Kos)',
      malangAddressPlaceholder: 'Contoh: Jl. MT. Haryono Gg. 10 No. 12, Lowokwaru, Malang',
      passLabel: 'Password Baru',
      passPlaceholder: 'Contoh: Brawijaya2026',
      confirmPassLabel: 'Konfirmasi Password',
      confirmPassPlaceholder: 'Ketik ulang password',
      passCriteriaTitle: 'Kriteria Keamanan Password:',
      critLen: 'Minimal 8 karakter',
      critCap: 'Huruf pertama wajib huruf kapital (A-Z)',
      critNum: 'Karakter terakhir wajib angka (0-9)',
      critMatch: 'Konfirmasi password harus cocok',
      passWarning:
        'Password tidak memenuhi kriteria: minimal 8 karakter, huruf besar diawal, angka di akhir.',
      successTitle: 'Pendaftaran Berhasil!',
      successDesc: 'Selamat! Akun keanggotaan mandiri Anda di SAC FEB UB telah aktif.',
      cardTitle: 'KARTU ANGGOTA SAC FEB UB',
      cardSubtitle: 'Self Access Centre • Fakultas Ekonomi dan Bisnis',
      pinLabel: 'Nomor PIN Keanggotaan:',
      copyPin: 'Salin PIN',
      copied: 'Tersalin!',
      btnCheckin: 'Lanjut ke Check-In Ruangan',
    },
    EN: {
      headerTitle: 'SAC FEB UB — Registration',
      version: 'SAC FEB UB v1.0',
      step1: 'Terms & Conditions',
      step2: 'Type & Files',
      step3: 'Personal Details',
      step4: 'Password',
      step5: 'Member Card',
      agreeTerms: 'I have read and agree to all the Terms & Conditions above.',
      btnAgree: 'Agree & Continue',
      alreadyMember: 'Already have an account? Sign In / Check-In',
      btnBack: 'Back',
      btnToPersonal: 'Fill Personal Details',
      btnToPassword: 'Create Password',
      btnSubmit: 'Complete Registration',
      submitting: 'Processing Registration...',
      photoSelfieLabel: 'Upload Selfie Photo',
      photoSelfieHint: 'Official formal photo, plain background, JPG/PNG.',
      photoIdLabel: 'Upload Identity Card',
      photoIdHint: 'Clear photo of Student Card / National ID / Passport.',
      guideSelfieTitle: 'Selfie Photo Guide',
      guideSelfieRule1: 'Face straight looking into camera',
      guideSelfieRule2: 'Well lit, no sunglasses or masks',
      guideSelfieRule3: 'Formal collared attire (3:4 or 4:6 ratio)',
      guideIdTitle: 'Identity Card Guide',
      guideIdRule1: 'ID / Student Number and name clearly readable',
      guideIdRule2: 'All four card corners fully visible',
      guideIdRule3: 'No glare or flash reflection over text',
      fullNameLabel: 'Full Name',
      fullNamePlaceholder: 'Full name according to identity card',
      prodiLabel: 'Study Program / Department',
      waLabel: 'Active WhatsApp Number',
      waPlaceholder: '81234567890',
      emailLabel: 'Email Address',
      emailHint: 'Use official UB student email if available',
      originAddressLabel: 'Origin Address (Permanent)',
      originAddressPlaceholder: 'e.g. Jl. Diponegoro No. 45, Surabaya, East Java',
      malangAddressLabel: 'Malang Residence (Optional / Boarding)',
      malangAddressPlaceholder: 'e.g. Jl. MT. Haryono Gg. 10 No. 12, Lowokwaru, Malang',
      passLabel: 'New Password',
      passPlaceholder: 'e.g. Brawijaya2026',
      confirmPassLabel: 'Confirm Password',
      confirmPassPlaceholder: 'Retype your password',
      passCriteriaTitle: 'Password Security Criteria:',
      critLen: 'At least 8 characters long',
      critCap: 'First character must be uppercase (A-Z)',
      critNum: 'Last character must be a digit (0-9)',
      critMatch: 'Password confirmation must match',
      passWarning:
        'Password does not meet criteria: at least 8 characters, capital letter at start, number at end.',
      successTitle: 'Registration Successful!',
      successDesc: 'Congratulations! Your independent SAC FEB UB membership is now active.',
      cardTitle: 'SAC FEB UB MEMBER CARD',
      cardSubtitle: 'Self Access Centre • Faculty of Economics and Business',
      pinLabel: 'Membership PIN Code:',
      copyPin: 'Copy PIN',
      copied: 'Copied!',
      btnCheckin: 'Proceed to Room Check-In',
    },
  }[lang];

  // Password validation checks
  const isLenValid = formData.password.length >= 8;
  const isCapValid = /^[A-Z]/.test(formData.password);
  const isNumValid = /[0-9]$/.test(formData.password);
  const isMatchValid =
    formData.password.length > 0 && formData.password === formData.confirmPassword;
  const isPasswordValid = isLenValid && isCapValid && isNumValid && isMatchValid;

  // File upload handlers
  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelfieFileName(file.name);
      const url = URL.createObjectURL(file);
      setSelfiePreview(url);
    }
  };

  const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdCardFileName(file.name);
      const url = URL.createObjectURL(file);
      setIdCardPreview(url);
    }
  };

  // Step navigation validations
  const handleProceedStep1 = () => {
    if (!formData.agreedToTerms) {
      setErrorMessage(
        lang === 'ID'
          ? 'Silakan centang persetujuan Syarat & Ketentuan untuk melanjutkan.'
          : 'Please check the agreement to Terms & Conditions to proceed.'
      );
      return;
    }
    setErrorMessage(null);
    setStep(2);
  };

  const handleProceedStep2 = () => {
    if (!formData.identityNumber.trim()) {
      setErrorMessage(
        lang === 'ID'
          ? 'Nomor identitas (NIM / NIK / Paspor) wajib diisi.'
          : 'Identity number is required.'
      );
      return;
    }
    setErrorMessage(null);
    setStep(3);
  };

  const handleProceedStep3 = () => {
    if (!formData.fullName.trim()) {
      setErrorMessage(lang === 'ID' ? 'Nama lengkap wajib diisi.' : 'Full name is required.');
      return;
    }
    if (!formData.whatsappNumber.trim()) {
      setErrorMessage(
        lang === 'ID' ? 'Nomor WhatsApp wajib diisi.' : 'WhatsApp number is required.'
      );
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage(lang === 'ID' ? 'Alamat email wajib diisi.' : 'Email is required.');
      return;
    }
    if (!formData.originAddress.trim()) {
      setErrorMessage(lang === 'ID' ? 'Alamat asal wajib diisi.' : 'Origin address is required.');
      return;
    }
    setErrorMessage(null);
    setStep(4);
  };

  // Final submit to API
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setErrorMessage(t.passWarning);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    // Sanitize WhatsApp number (remove leading 0 or 62 if user typed it)
    let cleanWa = formData.whatsappNumber.replace(/[^0-9]/g, '');
    if (cleanWa.startsWith('62')) {
      // already has 62
    } else if (cleanWa.startsWith('0')) {
      cleanWa = '62' + cleanWa.substring(1);
    } else {
      cleanWa = '62' + cleanWa;
    }

    const payload = {
      membershipType: formData.membershipType,
      identityType: formData.identityType,
      identityNumber: formData.identityNumber.trim(),
      fullName: formData.fullName.trim(),
      studyProgram: formData.studyProgram,
      whatsapp: cleanWa,
      email: formData.email.trim().toLowerCase(),
      originAddress: formData.originAddress.trim(),
      malangAddress: formData.malangAddress.trim() || undefined,
      selfiePhotoUrl: selfieFileName ? `/uploads/${selfieFileName}` : undefined,
      identityCardUrl: idCardFileName ? `/uploads/${idCardFileName}` : undefined,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Gagal memproses pendaftaran.');
      }

      setSuccessData(result.member);
      setStep(5);

      // Save to localStorage for seamless check-in
      if (typeof window !== 'undefined') {
        localStorage.setItem('sac_user_nim', result.member.identityNumber);
        localStorage.setItem('sac_user_nama', result.member.fullName);
        localStorage.setItem('sac_user_prodi', result.member.studyProgram);
        localStorage.setItem('sac_user_pin', result.member.pin);
      }
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyPinToClipboard = () => {
    if (successData?.pin) {
      navigator.clipboard.writeText(successData.pin);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans text-slate-800">
      <div className="w-full flex justify-center items-center flex-1">
        {/* MAIN MODAL CARD CONTAINER (max-w-xl) */}
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col">
          {/* HEADER (Navy Brawijaya #0B2546 with Gold accent & Language Switch) */}
          <header className="bg-[#0B2546] text-white px-6 py-4 flex items-center justify-between border-b border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                <span className="material-symbols-outlined text-amber-400 text-[20px]">
                  badge
                </span>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                  {t.headerTitle}
                </h1>
                <p className="text-[11px] text-slate-300 font-medium">
                  Self Access Centre • Gedung F Lantai 2 FEB UB
                </p>
              </div>
            </div>

            {/* Language Switcher [ID | EN] */}
            <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/20 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLang('ID')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  lang === 'ID'
                    ? 'bg-amber-500 text-[#0B2546] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setLang('EN')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  lang === 'EN'
                    ? 'bg-amber-500 text-[#0B2546] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>
          </header>

          {/* PROGRESS STEP INDICATOR */}
          {step < 5 && (
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200/70 flex items-center justify-between">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1 first:pl-0 last:pr-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === s
                        ? 'bg-[#0B2546] text-white ring-2 ring-amber-400'
                        : step > s
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {step > s ? '✓' : s}
                  </div>
                  <span
                    className={`text-[11px] hidden sm:inline font-semibold ${
                      step === s ? 'text-[#0B2546]' : 'text-slate-400'
                    }`}
                  >
                    {s === 1 ? t.step1 : s === 2 ? t.step2 : s === 3 ? t.step3 : t.step4}
                  </span>
                  {s < 4 && <div className="flex-1 h-0.5 bg-slate-200 mx-1 hidden sm:block"></div>}
                </div>
              ))}
            </div>
          )}

          {/* ERROR ALERT BANNER */}
          {errorMessage && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0">
                error
              </span>
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* STEP CONTENT WITH FRAMER MOTION TRANSITIONS */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* ================= STEP 1: TERMS & CONDITIONS ================= */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-2">
                    <span className="material-symbols-outlined text-amber-500 text-[20px]">
                      gavel
                    </span>
                    <span>{t.step1}</span>
                  </div>

                  {/* Terms & Conditions Scrollbox */}
                  <div className="h-64 overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-3 shadow-inner">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Syarat &amp; Ketentuan Pendaftaran Keanggotaan Self Access Centre (SAC) FEB UB
                    </h4>

                    <div>
                      <strong className="text-slate-800">1. Definisi</strong>
                      <p>
                        SAC FEB UB adalah fasilitas layanan mandiri untuk mahasiswa, dosen, dan tenaga kependidikan Fakultas Ekonomi dan Bisnis Universitas Brawijaya. Anggota adalah individu yang telah melakukan pendaftaran dan diterima sebagai peserta resmi SAC FEB UB.
                      </p>
                    </div>

                    <div>
                      <strong className="text-slate-800">2. Persyaratan Keanggotaan</strong>
                      <p>
                        Calon anggota wajib mengisi formulir pendaftaran dengan data yang valid, benar, dan dapat dipertanggungjawabkan. Anggota harus memiliki salah satu identitas resmi: KTM, KTP, atau Passport. Setiap anggota akan diberikan Kode Pendaftaran / PIN unik sebagai identitas keanggotaan. Anggota wajib menyertakan pas foto 4x6 dan file identitas yang valid.
                      </p>
                    </div>

                    <div>
                      <strong className="text-slate-800">3. Ketentuan Penggunaan Fasilitas</strong>
                      <p>
                        Anggota wajib mematuhi seluruh peraturan SAC FEB UB. Dilarang membawa makanan, minuman, tas, jaket, sepatu, atau buku teks dari luar ke area SAC. Anggota harus menjaga kebersihan dan ketertiban.
                      </p>
                    </div>

                    <div>
                      <strong className="text-slate-800">4. Data Pribadi</strong>
                      <p>
                        Data digunakan untuk administrasi dan pengembangan layanan. SAC FEB UB berhak menyimpan dan mengelola data sesuai ketentuan.
                      </p>
                    </div>

                    <div>
                      <strong className="text-slate-800">5. Hak &amp; Kewajiban Anggota</strong>
                      <p>
                        Anggota berhak mengakses fasilitas SAC. Anggota wajib melaporkan pelanggaran atau kerusakan. Pelanggaran dapat berakibat sanksi atau pencabutan keanggotaan.
                      </p>
                    </div>

                    <div>
                      <strong className="text-slate-800">6. Penggunaan Media Digital</strong>
                      <p>
                        Foto dan identitas disimpan di Google Drive resmi SAC FEB UB. Anggota bertanggung jawab atas keaslian dokumen.
                      </p>
                    </div>

                    <div>
                      <strong className="text-slate-800">7. Pengakhiran Keanggotaan</strong>
                      <p>
                        Keanggotaan berakhir jika melanggar aturan, tidak aktif, atau mengundurkan diri resmi.
                      </p>
                    </div>

                    <div>
                      <strong className="text-slate-800">8. Persetujuan</strong>
                      <p>
                        Dengan menekan tombol &apos;Setuju &amp; Lanjutkan&apos;, Anda menyatakan telah memahami seluruh ketentuan.
                      </p>
                    </div>
                  </div>

                  {/* Agreement Checkbox */}
                  <label className="flex items-start gap-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.agreedToTerms}
                      onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0B2546] focus:ring-amber-400 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-800 leading-snug">
                      {t.agreeTerms}
                    </span>
                  </label>

                  {/* Actions */}
                  <div className="pt-2 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleProceedStep1}
                      className="w-full py-3 px-4 rounded-xl bg-[#0B2546] hover:bg-[#001027] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{t.btnAgree}</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>

                    <Link
                      href="/presensi"
                      className="text-center text-xs text-slate-500 hover:text-[#0B2546] font-semibold transition-colors py-1"
                    >
                      {t.alreadyMember}
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* ================= STEP 2: MEMBERSHIP TYPE & FILE UPLOAD ================= */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-[20px]">
                        badge
                      </span>
                      {t.step2}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">Langkah 2 dari 4</span>
                  </div>

                  {/* Membership Type Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Jenis Keanggotaan (Membership Type)
                    </label>
                    <select
                      value={formData.membershipType}
                      onChange={(e) =>
                        setFormData({ ...formData, membershipType: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B2546]/20 cursor-pointer"
                    >
                      {MEMBERSHIP_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Identity Type & Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Jenis Identitas
                      </label>
                      <select
                        value={formData.identityType}
                        onChange={(e) =>
                          setFormData({ ...formData, identityType: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B2546]/20 cursor-pointer"
                      >
                        {IDENTITY_TYPES.map((it) => (
                          <option key={it} value={it}>
                            {it}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Nomor Identitas (NIM / NIK)
                      </label>
                      <input
                        type="text"
                        value={formData.identityNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, identityNumber: e.target.value })
                        }
                        placeholder="Masukkan NIM / NIK / No. Paspor"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B2546]/20"
                      />
                    </div>
                  </div>

                  {/* 2 SIDE-BY-SIDE VISUAL GUIDE CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Visual Card 1: Contoh Foto Selfie */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0B2546] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-amber-500">
                            face
                          </span>
                          {t.guideSelfieTitle}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                          Contoh
                        </span>
                      </div>

                      {/* Mockup Box */}
                      <div className="h-20 bg-gradient-to-b from-slate-200 to-slate-100 rounded-lg flex items-center justify-center border border-dashed border-slate-300 relative overflow-hidden">
                        {selfiePreview ? (
                          <img
                            src={selfiePreview}
                            alt="Selfie Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-slate-400">
                            <span className="material-symbols-outlined text-[28px]">
                              account_box
                            </span>
                            <span className="text-[9px] font-semibold">Rasio 3:4 / 4:6</span>
                          </div>
                        )}
                      </div>

                      <ul className="text-[10.5px] text-slate-600 space-y-1">
                        <li className="flex items-center gap-1">
                          <span className="text-emerald-600 font-bold">✓</span> {t.guideSelfieRule1}
                        </li>
                        <li className="flex items-center gap-1">
                          <span className="text-emerald-600 font-bold">✓</span> {t.guideSelfieRule2}
                        </li>
                      </ul>
                    </div>

                    {/* Visual Card 2: Contoh Identitas */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0B2546] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-amber-500">
                            credit_card
                          </span>
                          {t.guideIdTitle}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                          KTM/KTP
                        </span>
                      </div>

                      {/* Mockup Box */}
                      <div className="h-20 bg-gradient-to-b from-blue-50 to-slate-100 rounded-lg flex items-center justify-center border border-dashed border-slate-300 relative overflow-hidden">
                        {idCardPreview ? (
                          <img
                            src={idCardPreview}
                            alt="ID Card Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-slate-400">
                            <span className="material-symbols-outlined text-[28px]">
                              contact_mail
                            </span>
                            <span className="text-[9px] font-semibold">KTM / KTP Asli</span>
                          </div>
                        )}
                      </div>

                      <ul className="text-[10.5px] text-slate-600 space-y-1">
                        <li className="flex items-center gap-1">
                          <span className="text-emerald-600 font-bold">✓</span> {t.guideIdRule1}
                        </li>
                        <li className="flex items-center gap-1">
                          <span className="text-emerald-600 font-bold">✓</span> {t.guideIdRule2}
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* File Upload Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label htmlFor={selfieInputId} className="block text-xs font-bold text-slate-700 mb-1">
                        {t.photoSelfieLabel}
                      </label>
                      <input
                        id={selfieInputId}
                        type="file"
                        accept="image/*"
                        onChange={handleSelfieChange}
                        className="w-full text-xs text-slate-500 file:mr-2.5 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-[#0B2546] hover:file:bg-slate-200 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">{t.photoSelfieHint}</p>
                    </div>

                    <div>
                      <label htmlFor={idCardInputId} className="block text-xs font-bold text-slate-700 mb-1">
                        {t.photoIdLabel}
                      </label>
                      <input
                        id={idCardInputId}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleIdCardChange}
                        className="w-full text-xs text-slate-500 file:mr-2.5 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-[#0B2546] hover:file:bg-slate-200 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">{t.photoIdHint}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      {t.btnBack}
                    </button>
                    <button
                      type="button"
                      onClick={handleProceedStep2}
                      className="py-2.5 px-5 rounded-xl bg-[#0B2546] hover:bg-[#001027] text-white text-xs font-bold shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{t.btnToPersonal}</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ================= STEP 3: PERSONAL DETAILS & CONTACT ================= */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-3.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-[20px]">
                        person
                      </span>
                      {t.step3}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">Langkah 3 dari 4</span>
                  </div>

                  {/* Full Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">
                      {t.fullNameLabel} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder={t.fullNamePlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0B2546]/20"
                    />
                  </div>

                  {/* Study Program (18 options) */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">
                      {t.prodiLabel} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.studyProgram}
                      onChange={(e) => setFormData({ ...formData, studyProgram: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B2546]/20 cursor-pointer"
                    >
                      {STUDY_PROGRAMS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* WhatsApp (Static +62 selector group) */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">
                      {t.waLabel} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex rounded-xl overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-[#0B2546]/20">
                      <span className="bg-slate-100 text-slate-700 px-3.5 py-2.5 text-xs font-bold flex items-center border-r border-slate-300 select-none">
                        +62
                      </span>
                      <input
                        type="tel"
                        value={formData.whatsappNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, whatsappNumber: e.target.value })
                        }
                        placeholder={t.waPlaceholder}
                        className="w-full px-3.5 py-2.5 text-xs font-medium text-slate-800 bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">
                      {t.emailLabel} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nama.mahasiswa@student.ub.ac.id"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0B2546]/20"
                    />
                    <span className="text-[10px] text-slate-400">{t.emailHint}</span>
                  </div>

                  {/* Origin Address */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">
                      {t.originAddressLabel} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.originAddress}
                      onChange={(e) => setFormData({ ...formData, originAddress: e.target.value })}
                      placeholder={t.originAddressPlaceholder}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0B2546]/20 resize-none"
                    />
                  </div>

                  {/* Malang Address */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">
                      {t.malangAddressLabel}
                    </label>
                    <textarea
                      rows={2}
                      value={formData.malangAddress}
                      onChange={(e) => setFormData({ ...formData, malangAddress: e.target.value })}
                      placeholder={t.malangAddressPlaceholder}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0B2546]/20 resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      {t.btnBack}
                    </button>
                    <button
                      type="button"
                      onClick={handleProceedStep3}
                      className="py-2.5 px-5 rounded-xl bg-[#0B2546] hover:bg-[#001027] text-white text-xs font-bold shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{t.btnToPassword}</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ================= STEP 4: PASSWORD CREATION ================= */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-[20px]">
                        lock
                      </span>
                      {t.step4}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">Langkah 4 dari 4</span>
                  </div>

                  {/* Password Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">{t.passLabel}</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={t.passPlaceholder}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0B2546]/20 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {t.confirmPassLabel}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        placeholder={t.confirmPassPlaceholder}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0B2546]/20 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showConfirmPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Real-time Security Criteria Checklist */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col gap-2">
                    <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      {t.passCriteriaTitle}
                    </span>
                    <ul className="space-y-1 text-xs">
                      <li className="flex items-center gap-2">
                        <span
                          className={`material-symbols-outlined text-[16px] ${
                            isLenValid ? 'text-emerald-600' : 'text-slate-300'
                          }`}
                        >
                          {isLenValid ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className={isLenValid ? 'text-emerald-800 font-semibold' : 'text-slate-500'}>
                          {t.critLen}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span
                          className={`material-symbols-outlined text-[16px] ${
                            isCapValid ? 'text-emerald-600' : 'text-slate-300'
                          }`}
                        >
                          {isCapValid ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className={isCapValid ? 'text-emerald-800 font-semibold' : 'text-slate-500'}>
                          {t.critCap}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span
                          className={`material-symbols-outlined text-[16px] ${
                            isNumValid ? 'text-emerald-600' : 'text-slate-300'
                          }`}
                        >
                          {isNumValid ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className={isNumValid ? 'text-emerald-800 font-semibold' : 'text-slate-500'}>
                          {t.critNum}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span
                          className={`material-symbols-outlined text-[16px] ${
                            isMatchValid ? 'text-emerald-600' : 'text-slate-300'
                          }`}
                        >
                          {isMatchValid ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className={isMatchValid ? 'text-emerald-800 font-semibold' : 'text-slate-500'}>
                          {t.critMatch}
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setStep(3)}
                      className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {t.btnBack}
                    </button>
                    <button
                      type="button"
                      disabled={loading || !isPasswordValid}
                      onClick={handleSubmitRegistration}
                      className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#0B2546] text-xs font-extrabold shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <span className="material-symbols-outlined text-[18px] animate-spin">
                            sync
                          </span>
                          <span>{t.submitting}</span>
                        </>
                      ) : (
                        <>
                          <span>{t.btnSubmit}</span>
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ================= STEP 5: SUCCESS & DIGITAL MEMBER CARD ================= */}
              {step === 5 && successData && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center text-center gap-4"
                >
                  {/* Success Icon */}
                  <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 shadow-sm">
                    <span className="material-symbols-outlined text-[32px]">check</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">
                      {t.successTitle}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">{t.successDesc}</p>
                  </div>

                  {/* DIGITAL MEMBER CARD (KARTU TANDA ANGGOTA DIGITAL) */}
                  <div className="w-full bg-gradient-to-br from-[#0B2546] via-[#081b33] to-[#040e1c] text-white p-5 rounded-2xl shadow-xl border border-amber-500/40 relative overflow-hidden text-left flex flex-col justify-between">
                    {/* Background Institutional Pattern */}
                    <div className="absolute right-0 bottom-0 pointer-events-none opacity-5 translate-x-6 translate-y-6">
                      <svg width="220" height="220" viewBox="0 0 100 100" fill="currentColor">
                        <circle cx="50" cy="50" r="45" />
                      </svg>
                    </div>

                    {/* Card Top Branding */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src="/logo-feb.webp"
                          alt="FEB UB"
                          className="h-8 w-auto object-contain"
                        />
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black tracking-wider text-amber-400 uppercase">
                            {t.cardTitle}
                          </span>
                          <span className="text-[9px] text-slate-300 font-medium">
                            {t.cardSubtitle}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9.5px] font-extrabold uppercase tracking-wider">
                        ACTIVE
                      </span>
                    </div>

                    {/* Card Body: Member Info & PIN */}
                    <div className="py-4 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">
                            Nama Anggota
                          </div>
                          <div className="text-sm sm:text-base font-bold text-white leading-tight mt-0.5">
                            {successData.fullName}
                          </div>
                          <div className="text-[11px] text-amber-300 font-mono mt-0.5">
                            {successData.identityNumber} • {successData.studyProgram}
                          </div>
                        </div>

                        {/* PIN Code Box */}
                        <div className="bg-white/10 p-2.5 rounded-xl border border-white/15 flex flex-col items-end shrink-0">
                          <span className="text-[9px] text-slate-300 font-semibold uppercase">
                            {t.pinLabel}
                          </span>
                          <span className="text-base sm:text-lg font-black font-mono text-amber-400 tracking-wider">
                            {successData.pin}
                          </span>
                        </div>
                      </div>

                      {/* Barcode Simulator */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <div className="font-mono text-[9px] tracking-widest text-slate-400">
                          ||| | ||||| || |||| ||| ||||| ||| ||
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono">
                          VALID THRU: {new Date().getFullYear() + 1}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Copy PIN Button */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        Simpan PIN untuk presensi &amp; akses mandiri
                      </span>
                      <button
                        type="button"
                        onClick={copyPinToClipboard}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold border border-white/10 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {copiedPin ? 'check' : 'content_copy'}
                        </span>
                        <span>{copiedPin ? t.copied : t.copyPin}</span>
                      </button>
                    </div>
                  </div>

                  {/* Primary Action Button: Proceed to Check-In */}
                  <Link
                    href="/presensi"
                    className="w-full py-3.5 px-6 rounded-xl bg-[#0B2546] hover:bg-[#001027] text-white font-extrabold text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>{t.btnCheckin}</span>
                    <span className="material-symbols-outlined text-[20px] text-amber-400">
                      arrow_forward
                    </span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* FOOTER TEXT */}
      <footer className="w-full text-center py-2 text-slate-400 text-xs font-medium">
        {t.version} • Self Access Centre FEB Universitas Brawijaya
      </footer>
    </div>
  );
}
