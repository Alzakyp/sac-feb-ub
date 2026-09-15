'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  exportVisitorsToExcel,
  exportVisitorsToPDF,
  formatDateTimeIndo,
  formatTimeOnly,
} from '@/lib/utils';

export default function AdminDashboardPage() {
  // Navigation tabs: 'overview' | 'visitors' | 'deposits' | 'members' | 'repository'
  const [activeTab, setActiveTab] = useState<
    'overview' | 'visitors' | 'deposits' | 'members' | 'repository'
  >('overview');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Clock effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }) +
          ' • ' +
          now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
          ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // =========================================================================
  // TAB 1: OVERVIEW STATE
  // =========================================================================
  const [overviewData, setOverviewData] = useState<{
    kpis: {
      activeVisitorsCount: number;
      pendingDepositsCount: number;
      totalMembersCount: number;
      totalActivityCount: number;
      todayTotalVisitors: number;
      todayApprovedDeposits: number;
    };
    recentVisitors: any[];
    priorityDeposits: any[];
  } | null>(null);

  // =========================================================================
  // TAB 2: VISITORS STATE
  // =========================================================================
  const [visitors, setVisitors] = useState<any[]>([]);
  const [visitorFilter, setVisitorFilter] = useState<'all' | 'ACTIVE' | 'COMPLETED'>('all');
  const [visitorSearch, setVisitorSearch] = useState('');
  const [visitorCounts, setVisitorCounts] = useState({ total: 0, active: 0, completed: 0 });
  const [showForceCheckoutModal, setShowForceCheckoutModal] = useState(false);
  const [forceCheckoutLoading, setForceCheckoutLoading] = useState(false);

  // =========================================================================
  // TAB 3: DEPOSITS STATE
  // =========================================================================
  const [deposits, setDeposits] = useState<any[]>([]);
  const [depositStatusFilter, setDepositStatusFilter] = useState('all');
  const [depositDegreeFilter, setDepositDegreeFilter] = useState('all');
  const [depositSearch, setDepositSearch] = useState('');
  const [depositCounts, setDepositCounts] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    revision: 0,
    rejected: 0,
  });

  // Modal Verifikasi Deposit
  const [selectedDeposit, setSelectedDeposit] = useState<any | null>(null);
  const [hardcopyReceived, setHardcopyReceived] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);

  // =========================================================================
  // TAB 4: MEMBERS STATE
  // =========================================================================
  const [members, setMembers] = useState<any[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberTypeFilter, setMemberTypeFilter] = useState('all');
  const [selectedMemberModal, setSelectedMemberModal] = useState<any | null>(null);

  // =========================================================================
  // TAB 5: REPOSITORY & JOURNAL STATS STATE
  // =========================================================================
  const [repoStats, setRepoStats] = useState<{
    summary?: { totalLogs: number; totalDocs: number; devices: Record<string, number> };
    journalClicks?: Array<{ name: string; count: number }>;
    topKeywords?: Array<{ keyword: string; count: number }>;
    topDownloadedDocs?: any[];
    logs?: any[];
  } | null>(null);

  // Standee Modal
  const [showStandeeModal, setShowStandeeModal] = useState(false);

  // =========================================================================
  // DATA FETCHING FUNCTIONS
  // =========================================================================
  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/overview');
      const json = await res.json();
      if (json.success) setOverviewData(json.data);
    } catch (e) {
      console.error('Fetch Overview error:', e);
    }
  }, []);

  const fetchVisitors = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (visitorFilter !== 'all') params.set('status', visitorFilter);
      if (visitorSearch) params.set('search', visitorSearch);

      const res = await fetch(`/api/admin/visitors?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setVisitors(json.data);
        if (json.counts) setVisitorCounts(json.counts);
      }
    } catch (e) {
      console.error('Fetch Visitors error:', e);
    }
  }, [visitorFilter, visitorSearch]);

  const fetchDeposits = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (depositStatusFilter !== 'all') params.set('status', depositStatusFilter);
      if (depositDegreeFilter !== 'all') params.set('degreeLevel', depositDegreeFilter);
      if (depositSearch) params.set('search', depositSearch);

      const res = await fetch(`/api/admin/deposits?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setDeposits(json.data);
        if (json.counts) setDepositCounts(json.counts);
      }
    } catch (e) {
      console.error('Fetch Deposits error:', e);
    }
  }, [depositStatusFilter, depositDegreeFilter, depositSearch]);

  const fetchMembers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (memberTypeFilter !== 'all') params.set('membershipType', memberTypeFilter);
      if (memberSearch) params.set('search', memberSearch);

      const res = await fetch(`/api/admin/members?${params.toString()}`);
      const json = await res.json();
      if (json.success) setMembers(json.data);
    } catch (e) {
      console.error('Fetch Members error:', e);
    }
  }, [memberTypeFilter, memberSearch]);

  const fetchRepoStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/repository-stats');
      const json = await res.json();
      setRepoStats(json);
    } catch (e) {
      console.error('Fetch Repo Stats error:', e);
    }
  }, []);

  // Master refresh function
  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchOverview(),
      fetchVisitors(),
      fetchDeposits(),
      fetchMembers(),
      fetchRepoStats(),
    ]);
    setRefreshing(false);
    setLoading(false);
  }, [fetchOverview, fetchVisitors, fetchDeposits, fetchMembers, fetchRepoStats]);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Force Checkout Handler
  const handleForceCheckout = async () => {
    setForceCheckoutLoading(true);
    try {
      const res = await fetch('/api/admin/visitors/force-checkout', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setShowForceCheckoutModal(false);
        await Promise.all([fetchVisitors(), fetchOverview()]);
      }
    } catch (err) {
      console.error('Force checkout error:', err);
    } finally {
      setForceCheckoutLoading(false);
    }
  };

  // Deposit Status Update Handler
  const handleUpdateDepositStatus = async (
    status: 'APPROVED' | 'REVISION_NEEDED' | 'REJECTED'
  ) => {
    if (!selectedDeposit) return;
    setActionLoading(true);

    try {
      const payload: any = {
        verificationStatus: status,
        hardcopySubmitted: hardcopyReceived,
      };
      if (status === 'REVISION_NEEDED') {
        payload.revisionNotes = revisionNotes;
      }

      const res = await fetch(`/api/admin/deposits/${selectedDeposit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSelectedDeposit(null);
        setShowRevisionForm(false);
        setRevisionNotes('');
        await Promise.all([fetchDeposits(), fetchOverview()]);
      } else {
        alert(json.error || 'Gagal memperbarui status verifikasi');
      }
    } catch (err) {
      console.error('Update deposit error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Open Verify Modal
  const openVerifyModal = (deposit: any) => {
    setSelectedDeposit(deposit);
    setHardcopyReceived(Boolean(deposit.hardcopySubmitted));
    setRevisionNotes(deposit.revisionNotes || '');
    setShowRevisionForm(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800 font-sans antialiased w-full">
      {/* ===================================================================== */}
      {/* 1. SIDEBAR NAVIGASI STATIS                                            */}
      {/* ===================================================================== */}
      <aside className="w-64 bg-[#0B2546] text-white flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800 shadow-xl z-20">
        <div>
          {/* Logo & Header */}
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <img
              src="/logo-feb.webp"
              alt="FEB UB"
              className="h-10 w-auto object-contain shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white leading-tight">
                Self Access Centre
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-amber-400 uppercase">
                Admin Console FEB UB
              </span>
            </div>
          </div>

          {/* Navigasi 5 Tab Utama */}
          <nav className="p-3 space-y-1.5">
            {[
              { id: 'overview', label: 'Overview', icon: 'dashboard', badge: null },
              {
                id: 'visitors',
                label: 'Presensi Ruangan',
                icon: 'co_present',
                badge:
                  overviewData?.kpis?.activeVisitorsCount &&
                  overviewData.kpis.activeVisitorsCount > 0
                    ? `${overviewData.kpis.activeVisitorsCount}`
                    : null,
                badgeColor: 'bg-emerald-500',
              },
              {
                id: 'deposits',
                label: 'Serah Simpan',
                icon: 'assignment_turned_in',
                badge:
                  overviewData?.kpis?.pendingDepositsCount &&
                  overviewData.kpis.pendingDepositsCount > 0
                    ? `${overviewData.kpis.pendingDepositsCount}`
                    : null,
                badgeColor: 'bg-amber-500 text-slate-950',
              },
              { id: 'members', label: 'Data Anggota', icon: 'group', badge: null },
              { id: 'repository', label: 'Repositori & Jurnal', icon: 'analytics', badge: null },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive ? 'bg-slate-900 text-white' : tab.badgeColor || 'bg-slate-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <button
            onClick={() => setShowStandeeModal(true)}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-amber-400">qr_code</span>
            <span>Cetak Standee QR</span>
          </button>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white">Admin Petugas</span>
                <span className="text-[9px] text-slate-400 font-mono">Node F2-SRV • Live</span>
              </div>
            </div>
            <Link
              href="/"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Kembali ke Beranda Publik"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* ===================================================================== */}
      {/* 2. AREA KONTEN DINAMIS UTAMA                                          */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP OPERATIONAL BAR */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-lg font-black text-[#0B2546] capitalize flex items-center gap-2">
              {activeTab === 'overview' && 'Ringkasan Eksekutif Operasional'}
              {activeTab === 'visitors' && 'Monitoring Kiosk Presensi Ruangan'}
              {activeTab === 'deposits' && 'Verifikasi Serah Simpan Karya Ilmiah'}
              {activeTab === 'members' && 'Manajemen Akun Mahasiswa Terdaftar'}
              {activeTab === 'repository' && 'Analisis Repositori & Akses E-Resource'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Gedung F Lantai 2 &amp; Pascasarjana Lantai 1 FEB Universitas Brawijaya
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Clock */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-700">
              <span className="material-symbols-outlined text-amber-500 text-[18px]">
                schedule
              </span>
              <span>{currentTime}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={refreshAll}
              disabled={refreshing}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors flex items-center justify-center cursor-pointer"
              title="Segarkan Data"
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  refreshing ? 'animate-spin text-[#0B2546]' : ''
                }`}
              >
                refresh
              </span>
            </button>
          </div>
        </header>

        {/* TAB CONTENTS */}
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* ================================================================= */}
          {/* TAB 1: OVERVIEW (RINGKASAN EKSEKUTIF)                             */}
          {/* ================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 4 KARTU KPI UTAMA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Pengunjung di Ruangan
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-[#0B2546] mt-1">
                      {overviewData?.kpis?.activeVisitorsCount ?? 0}
                      <span className="text-xs font-normal text-slate-400 ml-1.5">Mahasiswa</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Sesi Aktif Kiosk Gedung F</span>
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[26px]">co_present</span>
                  </div>
                </div>

                {/* KPI 2 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Menunggu Verifikasi
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
                      {overviewData?.kpis?.pendingDepositsCount ?? 0}
                      <span className="text-xs font-normal text-slate-400 ml-1.5">Naskah</span>
                    </div>
                    <span className="text-[11px] text-amber-700 font-medium mt-1 block">
                      Antrean Serah Simpan SAC-ONE
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[26px]">pending_actions</span>
                  </div>
                </div>

                {/* KPI 3 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Total Anggota
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-[#0B2546] mt-1">
                      {overviewData?.kpis?.totalMembersCount ?? 0}
                      <span className="text-xs font-normal text-slate-400 ml-1.5">Akun</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                      Pendaftaran Mandiri Mahasiswa
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[26px]">how_to_reg</span>
                  </div>
                </div>

                {/* KPI 4 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Aktivitas E-Resource
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-[#0B2546] mt-1">
                      {overviewData?.kpis?.totalActivityCount ?? 0}
                      <span className="text-xs font-normal text-slate-400 ml-1.5">Hit Log</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                      Pencarian &amp; Unduh Naskah
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[26px]">query_stats</span>
                  </div>
                </div>
              </div>

              {/* 2 PANEL WIDGET OVERVIEW */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* WIDGET 1: PENGUNJUNG TERBARU HARI INI */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-[20px]">
                        history
                      </span>
                      <h3 className="text-sm font-bold text-[#0B2546]">
                        Pengunjung Terbaru Hari Ini
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('visitors')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Lihat Semua →
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {overviewData?.recentVisitors && overviewData.recentVisitors.length > 0 ? (
                      overviewData.recentVisitors.map((v: any) => (
                        <div key={v.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-[#0B2546] font-bold flex items-center justify-center text-[11px]">
                              {v.fullName ? v.fullName[0] : 'M'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">{v.fullName}</div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {v.identityNumber} • {v.studyProgram}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                v.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {v.status === 'ACTIVE' ? 'DI RUANGAN' : 'SELESAI'}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {formatTimeOnly(v.checkInTime)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 py-4 text-center">
                        Belum ada data presensi hari ini.
                      </p>
                    )}
                  </div>
                </div>

                {/* WIDGET 2: ANTREAN SERAH SIMPAN PRIORITAS */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-[20px]">
                        notification_important
                      </span>
                      <h3 className="text-sm font-bold text-[#0B2546]">
                        Antrean Serah Simpan Prioritas
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('deposits')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Buka Verifikasi →
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {overviewData?.priorityDeposits && overviewData.priorityDeposits.length > 0 ? (
                      overviewData.priorityDeposits.map((d: any) => (
                        <div key={d.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex-1 pr-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[#0B2546]">
                                {d.depositNumber}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                                {d.degreeLevel}
                              </span>
                            </div>
                            <div className="font-medium text-slate-800 line-clamp-1 mt-0.5">
                              {d.titleId}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Oleh: {d.fullName} ({d.identityNumber})
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              openVerifyModal(d);
                              setActiveTab('deposits');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#0B2546] hover:bg-slate-900 text-amber-300 font-bold text-[11px] transition-colors shrink-0 cursor-pointer"
                          >
                            Verifikasi
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 py-4 text-center">
                        Tidak ada antrean serah simpan yang menunggu verifikasi.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: PRESENSI RUANGAN KIOSK (VISITOR LOG)                       */}
          {/* ================================================================= */}
          {activeTab === 'visitors' && (
            <div className="space-y-4">
              {/* TOOLBAR & OPERATIONAL CONTROLS */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {/* Status Operasional */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Ruangan Buka (08.00 – 16.00 WIB)</span>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex bg-slate-100 p-1 rounded-xl text-xs">
                    <button
                      onClick={() => setVisitorFilter('all')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        visitorFilter === 'all'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Semua ({visitorCounts.total})
                    </button>
                    <button
                      onClick={() => setVisitorFilter('ACTIVE')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        visitorFilter === 'ACTIVE'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Di Ruangan ({visitorCounts.active})
                    </button>
                    <button
                      onClick={() => setVisitorFilter('COMPLETED')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        visitorFilter === 'COMPLETED'
                          ? 'bg-slate-700 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Selesai ({visitorCounts.completed})
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {/* Search Input */}
                  <div className="relative flex-1 sm:w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                      search
                    </span>
                    <input
                      type="text"
                      value={visitorSearch}
                      onChange={(e) => setVisitorSearch(e.target.value)}
                      placeholder="Cari NIM / Nama..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-[#0B2546]"
                    />
                  </div>

                  {/* Tombol Checkout Paksa Semua */}
                  <button
                    onClick={() => setShowForceCheckoutModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                    title="Paksa checkout seluruh mahasiswa yang masih aktif"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    <span>Checkout Paksa Semua</span>
                  </button>
                </div>
              </div>

              {/* TABEL PRESENSI RUANGAN */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-3.5">NIM Mahasiswa</th>
                        <th className="p-3.5">Nama Lengkap</th>
                        <th className="p-3.5">Program Studi</th>
                        <th className="p-3.5">Jam Masuk</th>
                        <th className="p-3.5">Jam Keluar</th>
                        <th className="p-3.5">Durasi Kunjungan</th>
                        <th className="p-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visitors.length > 0 ? (
                        visitors.map((v: any) => (
                          <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3.5 font-mono font-bold text-[#0B2546]">
                              {v.identityNumber}
                            </td>
                            <td className="p-3.5 font-bold text-slate-800">{v.fullName}</td>
                            <td className="p-3.5 text-slate-600">{v.studyProgram}</td>
                            <td className="p-3.5 font-mono text-slate-600">
                              {formatTimeOnly(v.checkInTime)}
                            </td>
                            <td className="p-3.5 font-mono text-slate-600">
                              {v.checkOutTime ? formatTimeOnly(v.checkOutTime) : '-'}
                            </td>
                            <td className="p-3.5 font-medium text-slate-700">{v.duration}</td>
                            <td className="p-3.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  v.status === 'ACTIVE'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {v.status === 'ACTIVE' ? 'SEDANG DI RUANGAN' : 'SELESAI'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">
                            Tidak ada data presensi yang sesuai dengan kriteria filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: SERAH SIMPAN KARYA ILMIAH (DEPOSITS)                       */}
          {/* ================================================================= */}
          {activeTab === 'deposits' && (
            <div className="space-y-4">
              {/* TOOLBAR FILTER */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {/* Status Filter Dropdown */}
                  <select
                    value={depositStatusFilter}
                    onChange={(e) => setDepositStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-700 outline-none"
                  >
                    <option value="all">Semua Status ({depositCounts.total})</option>
                    <option value="PENDING">Menunggu Verifikasi ({depositCounts.pending})</option>
                    <option value="APPROVED">Disetujui / Approved ({depositCounts.approved})</option>
                    <option value="REVISION_NEEDED">
                      Perlu Revisi ({depositCounts.revision})
                    </option>
                    <option value="REJECTED">Ditolak ({depositCounts.rejected})</option>
                  </select>

                  {/* Degree Level Filter */}
                  <select
                    value={depositDegreeFilter}
                    onChange={(e) => setDepositDegreeFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-700 outline-none"
                  >
                    <option value="all">Semua Jenjang</option>
                    <option value="S1">S1 (Skripsi)</option>
                    <option value="S2">S2 (Tesis)</option>
                    <option value="S3">S3 (Disertasi)</option>
                    <option value="Profesi">Profesi</option>
                  </select>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={depositSearch}
                    onChange={(e) => setDepositSearch(e.target.value)}
                    placeholder="Cari No. Reg / NIM / Judul..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-[#0B2546]"
                  />
                </div>
              </div>

              {/* TABEL PENGURUSAN SERAH SIMPAN */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-3.5">No. Registrasi</th>
                        <th className="p-3.5">Tanggal</th>
                        <th className="p-3.5">Mahasiswa &amp; NIM</th>
                        <th className="p-3.5">Jenjang / Karya</th>
                        <th className="p-3.5">Judul Karya Ilmiah</th>
                        <th className="p-3.5">Hardcopy DropBox</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {deposits.length > 0 ? (
                        deposits.map((d: any) => (
                          <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3.5 font-mono font-bold text-[#0B2546]">
                              {d.depositNumber}
                            </td>
                            <td className="p-3.5 text-slate-500 whitespace-nowrap">
                              {new Date(d.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-slate-800 block">{d.fullName}</span>
                              <span className="font-mono text-[11px] text-slate-400">
                                {d.identityNumber}
                              </span>
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold text-[10px]">
                                {d.degreeLevel} • {d.workType}
                              </span>
                            </td>
                            <td className="p-3.5 max-w-xs">
                              <span className="font-medium text-slate-800 line-clamp-2 leading-snug">
                                {d.titleId}
                              </span>
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              {d.hardcopySubmitted ? (
                                <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1 w-fit">
                                  <span className="material-symbols-outlined text-[12px]">check</span>
                                  <span>Diterima</span>
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-500 font-semibold text-[10px] flex items-center gap-1 w-fit">
                                  <span>Belum</span>
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              {d.verificationStatus === 'PENDING' && (
                                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px]">
                                  PENDING
                                </span>
                              )}
                              {d.verificationStatus === 'APPROVED' && (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px]">
                                  DISETUJUI
                                </span>
                              )}
                              {d.verificationStatus === 'REVISION_NEEDED' && (
                                <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[10px]">
                                  PERLU REVISI
                                </span>
                              )}
                              {d.verificationStatus === 'REJECTED' && (
                                <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 font-bold text-[10px]">
                                  DITOLAK
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-center">
                              <button
                                onClick={() => openVerifyModal(d)}
                                className="px-3 py-1.5 rounded-xl bg-[#0B2546] hover:bg-slate-900 text-amber-300 font-bold text-xs shadow-sm transition-colors cursor-pointer"
                              >
                                Periksa &amp; Verifikasi
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400">
                            Tidak ada data pengajuan serah simpan yang sesuai filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: DATA ANGGOTA MANDIRI (MEMBERS)                             */}
          {/* ================================================================= */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              {/* TOOLBAR */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={memberTypeFilter}
                    onChange={(e) => setMemberTypeFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-700 outline-none"
                  >
                    <option value="all">Semua Kategori Anggota</option>
                    <option value="Mahasiswa FEB-UB">Mahasiswa FEB-UB</option>
                    <option value="Dosen FEB-UB">Dosen FEB-UB</option>
                    <option value="Tendik FEB-UB">Tendik FEB-UB</option>
                    <option value="Non FEB-UB">Non FEB-UB</option>
                  </select>
                </div>

                <div className="relative w-full sm:w-72">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Cari PIN / NIM / Nama..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-[#0B2546]"
                  />
                </div>
              </div>

              {/* TABEL ANGGOTA */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-3.5">PIN Anggota</th>
                        <th className="p-3.5">NIM / NIK</th>
                        <th className="p-3.5">Nama Lengkap</th>
                        <th className="p-3.5">Kategori</th>
                        <th className="p-3.5">Program Studi</th>
                        <th className="p-3.5">No. WhatsApp</th>
                        <th className="p-3.5">Tanggal Daftar</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-center">Dokumen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {members.length > 0 ? (
                        members.map((m: any) => (
                          <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3.5 font-mono font-bold text-amber-700">{m.pin}</td>
                            <td className="p-3.5 font-mono font-bold text-[#0B2546]">
                              {m.identityNumber}
                            </td>
                            <td className="p-3.5 font-bold text-slate-800">{m.fullName}</td>
                            <td className="p-3.5 text-slate-600">{m.membershipType}</td>
                            <td className="p-3.5 text-slate-600">{m.studyProgram}</td>
                            <td className="p-3.5 font-mono text-slate-600">{m.whatsapp}</td>
                            <td className="p-3.5 text-slate-500 whitespace-nowrap">
                              {new Date(m.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="p-3.5">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                {m.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-center">
                              <button
                                onClick={() => setSelectedMemberModal(m)}
                                className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
                              >
                                Intip Berkas
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-slate-400">
                            Tidak ada data anggota terdaftar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: REPOSITORI & LOG JURNAL LUAR                               */}
          {/* ================================================================= */}
          {activeTab === 'repository' && (
            <div className="space-y-6">
              {/* REKAPITULASI KLIK JURNAL INTERNASIONAL */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-[22px]">
                      ads_click
                    </span>
                    <h3 className="text-sm font-bold text-[#0B2546]">
                      Rekapitulasi Klik Akses Database Jurnal Internasional
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    Live Hit Counter
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { name: 'ScienceDirect / Scopus', count: 184, color: 'text-blue-700' },
                    { name: 'Emerald Insight', count: 142, color: 'text-emerald-700' },
                    { name: 'ProQuest Dissertations', count: 98, color: 'text-purple-700' },
                    { name: 'Pojok Statistik BPS', count: 76, color: 'text-amber-700' },
                  ].map((j) => (
                    <div
                      key={j.name}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <span className="text-[11px] font-bold text-slate-600 block line-clamp-1">
                        {j.name}
                      </span>
                      <div className={`text-xl font-black mt-1 ${j.color}`}>{j.count} hit</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2 TABEL POPULER */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 10 KATA KUNCI PALING POPULER */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <span className="material-symbols-outlined text-amber-500 text-[20px]">
                      search_insights
                    </span>
                    <h3 className="text-sm font-bold text-[#0B2546]">
                      10 Kata Kunci Pencarian Paling Populer
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {repoStats?.topKeywords && repoStats.topKeywords.length > 0 ? (
                      repoStats.topKeywords.map((k, idx) => (
                        <div
                          key={k.keyword}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-slate-800">{k.keyword}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px]">
                            {k.count} kali dicari
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 py-3 text-center">
                        Belum ada data pencarian repositori.
                      </p>
                    )}
                  </div>
                </div>

                {/* 10 NASKAH PALING SERING DIUNDUH */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <span className="material-symbols-outlined text-amber-500 text-[20px]">
                      download_done
                    </span>
                    <h3 className="text-sm font-bold text-[#0B2546]">
                      10 Naskah Skripsi/Tesis Paling Sering Diunduh
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {repoStats?.topDownloadedDocs && repoStats.topDownloadedDocs.length > 0 ? (
                      repoStats.topDownloadedDocs.map((doc, idx) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs gap-3"
                        >
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div className="truncate">
                              <span className="font-semibold text-slate-800 block truncate">
                                {doc.judul}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {doc.nama} • {doc.prodi}
                              </span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] shrink-0">
                            {doc.downloadCount}x unduh
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 py-3 text-center">
                        Belum ada dokumen repositori yang diunduh.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* TABEL LOG AKTIVITAS REAL-TIME */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#0B2546] border-b border-slate-100 pb-3">
                  Riwayat Aktivitas Repositori Ilmiah (Live Activity Feed)
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-3">Waktu</th>
                        <th className="p-3">Mahasiswa / NIM</th>
                        <th className="p-3">Program Studi</th>
                        <th className="p-3">Aktivitas</th>
                        <th className="p-3">Kata Kunci / Judul</th>
                        <th className="p-3">Perangkat / Browser</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {repoStats?.logs && repoStats.logs.length > 0 ? (
                        repoStats.logs.slice(0, 15).map((log: any) => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-slate-800 block">
                                {log.nama || 'Pengunjung Publik'}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">
                                {log.nim || '-'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600">{log.prodi || '-'}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold text-[10px]">
                                {log.aktifitas}
                              </span>
                            </td>
                            <td className="p-3 max-w-xs truncate text-slate-700">
                              {log.kataKunci || log.document?.judul || '-'}
                            </td>
                            <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                              {log.device || 'PC'} • {log.browser || 'Browser'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">
                            Belum ada catatan aktivitas tercatat.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===================================================================== */}
      {/* 3. MODAL: DIALOG VERIFIKASI SERAH SIMPAN INTERAKTIF                    */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {selectedDeposit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-300 overflow-hidden my-8"
            >
              {/* Header Modal */}
              <div className="bg-[#0B2546] text-white p-6 relative border-b border-amber-400/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">
                    Formulir Keputusan Verifikator
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    Verifikasi Naskah Karya Ilmiah Mahasiswa
                  </h3>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">
                    No. Registrasi: {selectedDeposit.depositNumber}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDeposit(null)}
                  className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[24px]">close</span>
                </button>
              </div>

              {/* Body Modal */}
              <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
                {/* 1. Detail Identitas */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-[#0B2546] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-amber-500">
                      person
                    </span>
                    <span>Identitas Mahasiswa Pengunggah</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-slate-400 block font-medium">Nama Lengkap:</span>
                      <span className="font-bold text-slate-800 text-sm">
                        {selectedDeposit.fullName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">NIM:</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {selectedDeposit.identityNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Jenjang &amp; Prodi:</span>
                      <span className="font-semibold text-slate-700">
                        {selectedDeposit.degreeLevel} — {selectedDeposit.studyProgram || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Kontak WhatsApp:</span>
                      <a
                        href={`https://wa.me/${selectedDeposit.whatsappCountryCode.replace(
                          '+',
                          ''
                        )}${selectedDeposit.whatsappNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span className="material-symbols-outlined text-[14px]">chat</span>
                        <span>
                          {selectedDeposit.whatsappCountryCode} {selectedDeposit.whatsappNumber}
                        </span>
                      </a>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block font-medium">Alamat Surat:</span>
                      <span className="text-slate-700">{selectedDeposit.mailingAddress || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Metadata Naskah */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-[#0B2546] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-amber-500">
                      menu_book
                    </span>
                    <span>Metadata Naskah</span>
                  </h4>
                  <div className="space-y-2 pt-1">
                    <div>
                      <span className="text-slate-400 block font-medium">Judul (ID):</span>
                      <span className="font-bold text-slate-800 leading-snug">
                        {selectedDeposit.titleId}
                      </span>
                    </div>
                    {selectedDeposit.titleEn && (
                      <div>
                        <span className="text-slate-400 block font-medium">Judul (EN):</span>
                        <span className="italic text-slate-600 leading-snug">
                          {selectedDeposit.titleEn}
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-slate-400 block font-medium">
                          Dosen Pembimbing:
                        </span>
                        <span className="font-medium text-slate-700">
                          {selectedDeposit.advisor || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Dosen Penguji:</span>
                        <span className="font-medium text-slate-700">
                          {[selectedDeposit.examiner1, selectedDeposit.examiner2]
                            .filter(Boolean)
                            .join(', ') || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Pratinjau / Unduh 3 Berkas PDF */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-[#0B2546] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-amber-500">
                      attach_file
                    </span>
                    <span>3 Berkas PDF Naskah Mandiri</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <a
                      href={`/uploads/${selectedDeposit.initialSectionUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-[#0B2546] flex items-center gap-2 text-slate-700 hover:text-[#0B2546] transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined text-amber-500 text-[18px]">
                        description
                      </span>
                      <div className="truncate">
                        <span className="font-bold block text-[11px] truncate">Bagian Awal</span>
                        <span className="text-[9px] text-slate-400">PDF Cover &amp; Abstrak</span>
                      </div>
                    </a>

                    <a
                      href={`/uploads/${selectedDeposit.mainSectionUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-[#0B2546] flex items-center gap-2 text-slate-700 hover:text-[#0B2546] transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined text-blue-600 text-[18px]">
                        menu_book
                      </span>
                      <div className="truncate">
                        <span className="font-bold block text-[11px] truncate">Bagian Isi</span>
                        <span className="text-[9px] text-slate-400">PDF Bab I–V Utama</span>
                      </div>
                    </a>

                    <a
                      href={`/uploads/${selectedDeposit.finalSectionUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-[#0B2546] flex items-center gap-2 text-slate-700 hover:text-[#0B2546] transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                        library_books
                      </span>
                      <div className="truncate">
                        <span className="font-bold block text-[11px] truncate">Bagian Akhir</span>
                        <span className="text-[9px] text-slate-400">PDF Daftar Pustaka</span>
                      </div>
                    </a>
                  </div>
                </div>

                {/* 4. Checkbox Khusus S2/S3 (DropBox Hardcopy) */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hardcopyReceived}
                      onChange={(e) => setHardcopyReceived(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-xs text-amber-950 leading-relaxed font-semibold">
                      Hardcopy Fisik 1 Eksemplar Sudah Diterima di DropBox Pascasarjana Gedung F
                      Lt. 1
                      <span className="text-[11px] font-normal block text-amber-800">
                        Centang ini untuk menandai mahasiswa telah menyerahkan buku jilid fisik.
                      </span>
                    </span>
                  </label>
                </div>

                {/* Form Catatan Revisi Jika Minta Revisi */}
                {showRevisionForm && (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
                    <label className="block font-bold text-rose-900 text-xs">
                      Catatan Perbaikan Naskah untuk Mahasiswa:
                    </label>
                    <textarea
                      rows={3}
                      value={revisionNotes}
                      onChange={(e) => setRevisionNotes(e.target.value)}
                      placeholder="Tuliskan catatan perbaikan (contoh: Lembar pengesahan belum ditandatangani Kaprodi, abstrak bahasa Inggris hilang, dsb)..."
                      className="w-full p-2.5 rounded-xl border border-rose-300 bg-white text-xs outline-none focus:ring-2 focus:ring-rose-200 resize-none font-medium"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowRevisionForm(false)}
                        className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-white text-xs font-semibold"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleUpdateDepositStatus('REVISION_NEEDED')}
                        disabled={actionLoading || !revisionNotes.trim()}
                        className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Kirim Catatan Revisi
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Modal: Action Buttons */}
              <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedDeposit(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Tutup
                </button>

                <div className="flex items-center gap-2">
                  {/* Tombol Merah: Tolak */}
                  <button
                    onClick={() => {
                      if (confirm('Yakin ingin menolak pengajuan serah simpan ini?')) {
                        handleUpdateDepositStatus('REJECTED');
                      }
                    }}
                    disabled={actionLoading}
                    className="px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Tolak Pengajuan
                  </button>

                  {/* Tombol Kuning: Minta Revisi */}
                  {!showRevisionForm && (
                    <button
                      onClick={() => setShowRevisionForm(true)}
                      disabled={actionLoading}
                      className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Minta Revisi
                    </button>
                  )}

                  {/* Tombol Hijau: Setujui */}
                  <button
                    onClick={() => handleUpdateDepositStatus('APPROVED')}
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>Setujui (Approve)</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* 4. MODAL: KONFIRMASI CHECKOUT PAKSA                                    */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {showForceCheckoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-300 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">logout</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Konfirmasi Checkout Paksa</h3>
                  <span className="text-xs text-slate-500">Penutupan Jam Operasional 16.00 WIB</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Tindakan ini akan <strong>menutup secara massal</strong> seluruh sesi mahasiswa yang
                saat ini masih berstatus <strong>AKTIF</strong> di ruangan SAC ({visitorCounts.active}{' '}
                pengunjung). Jam keluar akan dicatat sesuai waktu saat ini.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowForceCheckoutModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleForceCheckout}
                  disabled={forceCheckoutLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {forceCheckoutLoading ? 'Memproses...' : 'Ya, Checkout Paksa Semua'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* 5. MODAL: INTIP DOKUMEN ANGGOTA                                        */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {selectedMemberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-300 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-[20px]">
                    account_box
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {selectedMemberModal.fullName}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      NIM: {selectedMemberModal.identityNumber} • PIN: {selectedMemberModal.pin}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMemberModal(null)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                  <span className="font-bold text-slate-700 block">Foto Selfie / Profil</span>
                  <div className="w-24 h-24 mx-auto rounded-xl bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-300">
                    {selectedMemberModal.selfiePhotoUrl ? (
                      <img
                        src={selectedMemberModal.selfiePhotoUrl}
                        alt="Selfie"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-slate-400 text-[36px]">
                        person
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                  <span className="font-bold text-slate-700 block">Kartu Identitas (KTM/KTP)</span>
                  <div className="w-24 h-24 mx-auto rounded-xl bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-300">
                    {selectedMemberModal.identityCardUrl ? (
                      <img
                        src={selectedMemberModal.identityCardUrl}
                        alt="ID Card"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-slate-400 text-[36px]">
                        badge
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedMemberModal(null)}
                  className="px-4 py-1.5 rounded-xl bg-[#0B2546] text-white text-xs font-bold"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* 6. MODAL: STANDEE CETAK QR RESEPSIONIS                                */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {showStandeeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-300 space-y-4 text-center"
            >
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <h3 className="font-black text-[#0B2546] text-sm uppercase tracking-wide">
                  Standee QR Presensi Kiosk Ruangan
                </h3>
                <button
                  onClick={() => setShowStandeeModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto shadow-inner">
                <QRCodeSVG
                  value="http://localhost:3000/presensi"
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <p className="text-xs text-slate-600 font-medium max-w-xs mx-auto">
                Scan QR Code ini untuk membuka halaman Presensi Mandiri di Meja Resepsionis Gedung F
                Lantai 2 FEB UB.
              </p>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 rounded-xl bg-[#0B2546] text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Cetak Standee Akrilik</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
