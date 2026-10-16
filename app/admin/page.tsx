'use client';

import { Icon } from '@/components/admin/tailadmin/Icon';
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
import ComingSoonNotice, { ComingSoonDetails } from '@/components/ComingSoonNotice';
import { depositWorkflow } from '@/lib/deposit-workflow';
import { validateDepositDecision } from '@/lib/deposit-decision';
import CrudPanel from '@/components/admin/CrudPanel';
import { ReportManagementPanel, SheetDataPanel, RepositoryManagementPanel, StaffManagementPanel } from '@/components/admin/panels/ManagementPanels';
import { AdminShell } from '@/components/admin/tailadmin/AdminShell';
import { StatCard, Card, Badge } from '@/components/admin/tailadmin/Primitives';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'visitors' | 'deposits' | 'memberships' | 'depositRecords' | 'visitorHistory' | 'reports' | 'staff' | 'repository' | 'books'
  >('overview');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  async function logout() {
    setLoggingOut(true);
    setLogoutError('');
    try {
      const response = await fetch('/api/backoffice/logout', { method: 'POST' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error('Logout gagal. Silakan coba kembali.');
      window.location.assign('/backoffice/login');
    } catch {
      setLogoutError('Logout gagal. Periksa koneksi, lalu coba kembali.');
      setLoggingOut(false);
    }
  }
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
      openReportsCount: number;
      totalStaffCount: number;
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
  const [decision, setDecision] = useState<'APPROVED' | 'REVISION_NEEDED' | 'REJECTED'>('APPROVED');

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

  // Coming Soon Notification State
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [comingSoonDetails, setComingSoonDetails] = useState<ComingSoonDetails | null>(null);

  const handleTriggerComingSoon = (details: ComingSoonDetails) => {
    setComingSoonDetails(details);
    setComingSoonOpen(true);
  };

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
      const decisionError = validateDepositDecision({ status, notes: revisionNotes, degreeLevel: selectedDeposit.degreeLevel, hardcopy: hardcopyReceived });
      if (decisionError) { alert(decisionError); setActionLoading(false); return; }
      const payload: any = {
        verificationStatus: status,
        hardcopySubmitted: hardcopyReceived,
      };
      payload.revisionNotes = status === 'APPROVED' ? null : revisionNotes;

      const res = await fetch(`/api/admin/deposits/${selectedDeposit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSelectedDeposit(null);
        setDecision('APPROVED');
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
    setDecision(deposit.verificationStatus === 'REVISION_NEEDED' || deposit.verificationStatus === 'REJECTED' ? deposit.verificationStatus : 'APPROVED');
  };

  return (
    <>
    <AdminShell
      tabs={[
        { id: 'overview', label: 'Overview', icon: 'dashboard' },
        { id: 'deposits', label: 'Serah Simpan', icon: 'assignment_turned_in', badge: overviewData?.kpis?.pendingDepositsCount ? String(overviewData.kpis.pendingDepositsCount) : null, badgeColor: 'bg-warning-50 text-warning-600' },
        { id: 'reports', label: 'Lapor Kendala', icon: 'support_agent', badge: overviewData?.kpis?.openReportsCount ? String(overviewData.kpis.openReportsCount) : null, badgeColor: 'bg-rose-100 text-rose-800' },
        { id: 'staff', label: 'Kelola Staf', icon: 'manage_accounts' },
        { id: 'repository', label: 'Kelola Repositori', icon: 'auto_stories' },
        { id: 'memberships', label: 'Data Keanggotaan', icon: 'badge' },
        { id: 'depositRecords', label: 'Bukti Serah Simpan', icon: 'verified' },
        { id: 'visitorHistory', label: 'Riwayat Buku Tamu', icon: 'history' },
        { id: 'books', label: 'Kelola Buku', icon: 'library_books' },
      ]}
      activeTab={activeTab}
      onSelectTab={id => setActiveTab(id as typeof activeTab)}
      currentTime={currentTime}
      onRefresh={refreshAll}
      refreshing={refreshing}
      onLogout={logout}
      loggingOut={loggingOut}
      logoutError={logoutError}
      onOpenStandee={() => setShowStandeeModal(true)}
    >
          {/* ================================================================= */}
          {/* TAB 1: OVERVIEW (RINGKASAN EKSEKUTIF)                             */}
          {/* ================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Pengunjung di Ruangan" value={overviewData?.kpis?.activeVisitorsCount ?? 0} note="Sesi aktif ruangan" icon="co_present" tone="emerald" />
                <StatCard label="Menunggu Verifikasi" value={overviewData?.kpis?.pendingDepositsCount ?? 0} note="Antrean serah simpan" icon="pending_actions" tone="amber" />
                <StatCard label="Total Staf" value={overviewData?.kpis?.totalStaffCount ?? 0} note="Akun petugas" icon="manage_accounts" tone="blue" />
                <StatCard label="Aktivitas E-Resource" value={overviewData?.kpis?.totalActivityCount ?? 0} note="Pencarian & unduh naskah" icon="query_stats" tone="purple" />
              </div>

              {/* 2 PANEL WIDGET OVERVIEW */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* WIDGET 1: PENGUNJUNG TERBARU HARI INI */}
                <Card
                  title={<span className="flex items-center gap-2"><Icon name="time" />Pengunjung Terbaru Hari Ini</span>}
                  right={<button onClick={() => setActiveTab('visitorHistory')} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">Lihat Semua →</button>}
                >
                  <div className="divide-y divide-gray-100">
                    {overviewData?.recentVisitors && overviewData.recentVisitors.length > 0 ? (
                      overviewData.recentVisitors.map((v: any) => (
                        <div key={v.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-[11px]">
                              {v.fullName ? v.fullName[0] : 'M'}
                            </div>
                            <div>
                              <div className="font-bold text-gray-800">{v.fullName}</div>
                              <div className="text-[11px] text-gray-400 font-mono">
                                {v.identityNumber} • {v.studyProgram}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={v.status === 'ACTIVE' ? 'success' : 'neutral'}>
                              {v.status === 'ACTIVE' ? 'DI RUANGAN' : 'SELESAI'}
                            </Badge>
                            <span className="text-[10px] text-gray-400 block mt-0.5 font-mono">
                              {formatTimeOnly(v.checkInTime)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 py-4 text-center">
                        Belum ada data presensi hari ini.
                      </p>
                    )}
                  </div>
                </Card>

                {/* WIDGET 2: ANTREAN SERAH SIMPAN PRIORITAS */}
                <Card
                  title={<span className="flex items-center gap-2"><Icon name="alert" />Antrean Serah Simpan Prioritas</span>}
                  right={<button onClick={() => setActiveTab('deposits')} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">Buka Verifikasi →</button>}
                >
                  <div className="divide-y divide-gray-100">
                    {overviewData?.priorityDeposits && overviewData.priorityDeposits.length > 0 ? (
                      overviewData.priorityDeposits.map((d: any) => (
                        <div key={d.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex-1 pr-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-gray-900 dark:text-white/90">
                                {d.depositNumber}
                              </span>
                              <Badge variant="warning">{d.degreeLevel}</Badge>
                            </div>
                            <div className="font-medium text-gray-800 line-clamp-1 mt-0.5">
                              {d.titleId}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              Oleh: {d.fullName} ({d.identityNumber})
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              openVerifyModal(d);
                              setActiveTab('deposits');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors shrink-0 cursor-pointer shadow-xs"
                          >
                            Verifikasi
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 py-4 text-center">
                        Tidak ada antrean serah simpan yang menunggu verifikasi.
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: PRESENSI RUANGAN KIOSK (VISITOR LOG)                       */}
          {/* ================================================================= */}


          {/* ================================================================= */}
          {/* TAB 3: SERAH SIMPAN KARYA ILMIAH (DEPOSITS)                       */}
          {/* ================================================================= */}
          {activeTab === 'deposits' && (
            <div className="space-y-4">
              {/* TOOLBAR FILTER */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-white/[0.03] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {/* Status Filter Dropdown */}
                  <select
                    value={depositStatusFilter}
                    onChange={(e) => setDepositStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold bg-white text-gray-700 outline-none"
                  >
                    <option value="all">Semua Status ({depositCounts.total})</option>
                    <option value="PENDING">Menunggu Verifikasi ({depositCounts.pending})</option>
                    <option value="APPROVED">Disetujui, menunggu bukti ({depositCounts.approved})</option>
                    <option value="REVISION_NEEDED">
                      Perlu Revisi ({depositCounts.revision})
                    </option>
                    <option value="REJECTED">Ditolak ({depositCounts.rejected})</option>
                  </select>

                  {/* Degree Level Filter */}
                  <select
                    value={depositDegreeFilter}
                    onChange={(e) => setDepositDegreeFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold bg-white text-gray-700 outline-none"
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
                  <Icon name="docs" />
                  <input
                    type="text"
                    value={depositSearch}
                    onChange={(e) => setDepositSearch(e.target.value)}
                    placeholder="Cari No. Reg / NIM / Judul..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-medium outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* TABEL PENGURUSAN SERAH SIMPAN */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-100 dark:bg-gray-800/50 dark:border-gray-800 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
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
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {deposits.length > 0 ? (
                        deposits.map((d: any) => (
                          <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                            <td className="p-3.5 font-mono font-bold text-gray-900 dark:text-white/90">
                              {d.depositNumber}
                            </td>
                            <td className="p-3.5 text-gray-500 whitespace-nowrap">
                              {new Date(d.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-gray-800 block">{d.fullName}</span>
                              <span className="font-mono text-[11px] text-gray-400">
                                {d.identityNumber}
                              </span>
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold text-[10px]">
                                {d.degreeLevel} • {d.workType}
                              </span>
                            </td>
                            <td className="p-3.5 max-w-xs">
                              <span className="font-medium text-gray-800 line-clamp-2 leading-snug">
                                {d.titleId}
                              </span>
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              {d.degreeLevel === 'S1' ? <span className="text-gray-500">Tidak wajib</span> : d.hardcopySubmitted ? (
                                <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1 w-fit">
                                  <Icon name="info" />
                                  <span>Diterima</span>
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 font-semibold text-[10px] flex items-center gap-1 w-fit">
                                  <span>Belum</span>
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-full border font-bold text-[10px] ${depositWorkflow(d).tone === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : depositWorkflow(d).tone === 'revision' || depositWorkflow(d).tone === 'rejected' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-warning-50 text-warning-600 border-warning-500/20'}`}>{depositWorkflow(d).label}</span>
                            </td>
                            <td className="p-3.5 text-center">
                              <button
                                onClick={() => openVerifyModal(d)}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-warning-600 font-bold text-xs shadow-sm transition-colors cursor-pointer"
                              >
                                Buka Detail
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-gray-400">
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
          {activeTab === 'reports' && <ReportManagementPanel />}

          {activeTab === 'staff' && (
            <div className="space-y-4">
              <StaffManagementPanel />
            </div>
          )}



          {/* ================================================================= */}
          {/* TAB 5: REPOSITORI & LOG JURNAL LUAR                               */}
          {/* ================================================================= */}
          {activeTab === 'repository' && (
            <div className="space-y-6">
              <CrudPanel kind="repository" />
              {/* REKAPITULASI KLIK JURNAL INTERNASIONAL */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Icon name="info" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white/90">
                      Rekapitulasi Klik Akses Database Jurnal Internasional
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-gray-400">
                    Live Hit Counter
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { name: 'ScienceDirect / Scopus', count: 184, color: 'text-blue-700' },
                    { name: 'Emerald Insight', count: 142, color: 'text-emerald-700' },
                    { name: 'ProQuest Dissertations', count: 98, color: 'text-purple-700' },
                    { name: 'Pojok Statistik BPS', count: 76, color: 'text-warning-600' },
                  ].map((j) => (
                    <div
                      key={j.name}
                      className="p-3.5 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <span className="text-[11px] font-bold text-gray-600 block line-clamp-1">
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
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <Icon name="info" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white/90">
                      10 Kata Kunci Pencarian Paling Populer
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {repoStats?.topKeywords && repoStats.topKeywords.length > 0 ? (
                      repoStats.topKeywords.map((k, idx) => (
                        <div
                          key={k.keyword}
                          className="flex items-center justify-between p-2 rounded-xl bg-gray-50 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-gray-800">{k.keyword}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px]">
                            {k.count} kali dicari
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 py-3 text-center">
                        Belum ada data pencarian repositori.
                      </p>
                    )}
                  </div>
                </div>

                {/* 10 NASKAH PALING SERING DIUNDUH */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <Icon name="info" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white/90">
                      10 Naskah Skripsi/Tesis Paling Sering Diunduh
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {repoStats?.topDownloadedDocs && repoStats.topDownloadedDocs.length > 0 ? (
                      repoStats.topDownloadedDocs.map((doc, idx) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-gray-50 text-xs gap-3"
                        >
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div className="truncate">
                              <span className="font-semibold text-gray-800 block truncate">
                                {doc.judul}
                              </span>
                              <span className="text-[10px] text-gray-400">
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
                      <p className="text-xs text-gray-400 py-3 text-center">
                        Belum ada dokumen repositori yang diunduh.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* TABEL LOG AKTIVITAS REAL-TIME */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white/90 border-b border-gray-100 pb-3">
                  Riwayat Aktivitas Repositori Ilmiah (Live Activity Feed)
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-100 dark:bg-gray-800/50 dark:border-gray-800 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-3">Waktu</th>
                        <th className="p-3">Mahasiswa / NIM</th>
                        <th className="p-3">Program Studi</th>
                        <th className="p-3">Aktivitas</th>
                        <th className="p-3">Kata Kunci / Judul</th>
                        <th className="p-3">Tujuan / Akses</th>
                        <th className="p-3">Perangkat / Browser</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {repoStats?.logs && repoStats.logs.length > 0 ? (
                        repoStats.logs.slice(0, 15).map((log: any) => (
                          <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="p-3 font-mono text-gray-500 whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-gray-800 block">
                                {log.nama || 'Pengunjung Publik'}
                              </span>
                              <span className="font-mono text-[10px] text-gray-400">
                                {log.nim || '-'}
                              </span>
                            </td>
                            <td className="p-3 text-gray-600">{log.prodi || '-'}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold text-[10px]">
                                {log.aktifitas}
                              </span>
                            </td>
                            <td className="p-3 max-w-xs truncate text-gray-700">
                              {log.kataKunci || log.document?.judul || '-'}
                            </td>
                            <td className="p-3 max-w-xs text-gray-600"><span className="font-bold">{log.accessType === 'READ' ? 'Baca' : log.accessType === 'DOWNLOAD' ? 'Unduh' : '-'}</span>{log.section ? ` • ${log.section}` : ''}<span className="block truncate text-[10px] text-gray-400" title={log.purpose || undefined}>{log.purpose || '-'}</span></td>
                            <td className="p-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                              {log.device || 'PC'} • {log.browser || 'Browser'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-400">
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

          {/* ================================================================= */}
          {/* TAB 7: KATALOG BUKU FISIK                                         */}
          {/* ================================================================= */}
          {activeTab === 'memberships' && <CrudPanel kind="members" />}
          {activeTab === 'depositRecords' && <SheetDataPanel dataset="deposits" title="Bukti Serah Simpan" />}
          {activeTab === 'visitorHistory' && <SheetDataPanel dataset="visitors" title="Buku Tamu" />}
          {activeTab === 'books' && <CrudPanel kind="books" />}
    </AdminShell>

      {/* ===================================================================== */}
      {/* 3. MODAL: DIALOG VERIFIKASI SERAH SIMPAN INTERAKTIF                    */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {selectedDeposit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-300 overflow-hidden my-8"
            >
              {/* Header Modal */}
              <div className="bg-blue-600 text-white p-6 relative border-b border-warning-500/20/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-warning-600 uppercase tracking-widest block">
                    Formulir Keputusan Verifikator
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    Verifikasi Naskah Karya Ilmiah Mahasiswa
                  </h3>
                  <p className="text-xs text-gray-300 font-mono mt-0.5">
                    No. Registrasi: {selectedDeposit.depositNumber}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDeposit(null)}
                  className="p-1.5 text-gray-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  <Icon name="close" />
                </button>
              </div>

              {/* Body Modal */}
              <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
                {/* 1. Detail Identitas */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                  <h4 className="font-bold text-gray-900 dark:text-white/90 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Icon name="user-line" />
                    <span>Identitas Mahasiswa Pengunggah</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-gray-400 block font-medium">Nama Lengkap:</span>
                      <span className="font-bold text-gray-800 text-sm">
                        {selectedDeposit.fullName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium">NIM:</span>
                      <span className="font-mono font-bold text-gray-800 text-sm">
                        {selectedDeposit.identityNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium">Jenjang &amp; Prodi:</span>
                      <span className="font-semibold text-gray-700">
                        {selectedDeposit.degreeLevel} — {selectedDeposit.studyProgram || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium">Kontak WhatsApp:</span>
                      <a
                        href={`https://wa.me/${selectedDeposit.whatsappCountryCode.replace(
                          '+',
                          ''
                        )}${selectedDeposit.whatsappNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Icon name="info" />
                        <span>
                          {selectedDeposit.whatsappCountryCode} {selectedDeposit.whatsappNumber}
                        </span>
                      </a>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400 block font-medium">Alamat Surat:</span>
                      <span className="text-gray-700">{selectedDeposit.mailingAddress || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Metadata Naskah */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                  <h4 className="font-bold text-gray-900 dark:text-white/90 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Icon name="info" />
                    <span>Metadata Naskah</span>
                  </h4>
                  <div className="space-y-2 pt-1">
                    <div>
                      <span className="text-gray-400 block font-medium">Judul (ID):</span>
                      <span className="font-bold text-gray-800 leading-snug">
                        {selectedDeposit.titleId}
                      </span>
                    </div>
                    {selectedDeposit.titleEn && (
                      <div>
                        <span className="text-gray-400 block font-medium">Judul (EN):</span>
                        <span className="italic text-gray-600 leading-snug">
                          {selectedDeposit.titleEn}
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-gray-400 block font-medium">
                          Dosen Pembimbing:
                        </span>
                        <span className="font-medium text-gray-700">
                          {selectedDeposit.advisor || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-medium">Dosen Penguji:</span>
                        <span className="font-medium text-gray-700">
                          {[selectedDeposit.examiner1, selectedDeposit.examiner2]
                            .filter(Boolean)
                            .join(', ') || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Pratinjau / Unduh 3 Berkas PDF */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                  <h4 className="font-bold text-gray-900 dark:text-white/90 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Icon name="info" />
                    <span>3 Berkas PDF Naskah Mandiri</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <a
                      href={
                        selectedDeposit.initialSectionUrl.startsWith('/')
                          ? selectedDeposit.initialSectionUrl
                          : `/uploads/${selectedDeposit.initialSectionUrl}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-white rounded-xl border border-gray-200 hover:border-[#0B2546] flex items-center gap-2 text-gray-700 hover:text-gray-900 dark:text-white/90 transition-colors shadow-sm"
                    >
                      <Icon name="docs" />
                      <div className="truncate">
                        <span className="font-bold block text-[11px] truncate">Bagian Awal</span>
                        <span className="text-[9px] text-gray-400">PDF Cover &amp; Abstrak</span>
                      </div>
                    </a>

                    <a
                      href={
                        selectedDeposit.mainSectionUrl.startsWith('/')
                          ? selectedDeposit.mainSectionUrl
                          : `/uploads/${selectedDeposit.mainSectionUrl}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-white rounded-xl border border-gray-200 hover:border-[#0B2546] flex items-center gap-2 text-gray-700 hover:text-gray-900 dark:text-white/90 transition-colors shadow-sm"
                    >
                      <Icon name="info" />
                      <div className="truncate">
                        <span className="font-bold block text-[11px] truncate">Bagian Isi</span>
                        <span className="text-[9px] text-gray-400">PDF Bab I–V Utama</span>
                      </div>
                    </a>

                    <a
                      href={
                        selectedDeposit.finalSectionUrl.startsWith('/')
                          ? selectedDeposit.finalSectionUrl
                          : `/uploads/${selectedDeposit.finalSectionUrl}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-white rounded-xl border border-gray-200 hover:border-[#0B2546] flex items-center gap-2 text-gray-700 hover:text-gray-900 dark:text-white/90 transition-colors shadow-sm"
                    >
                      <Icon name="info" />
                      <div className="truncate">
                        <span className="font-bold block text-[11px] truncate">Bagian Akhir</span>
                        <span className="text-[9px] text-gray-400">PDF Daftar Pustaka</span>
                      </div>
                    </a>
                  </div>
                </div>

                {/* 4. Checkbox Khusus S2/S3 (DropBox Hardcopy) */}
                <div className="p-3 bg-warning-50 rounded-xl border border-warning-500/20">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hardcopyReceived}
                      onChange={(e) => setHardcopyReceived(e.target.checked)}
                      className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-xs text-warning-600 leading-relaxed font-semibold">
                      Hardcopy Fisik 1 Eksemplar Sudah Diterima di DropBox Pascasarjana Gedung F
                      Lt. 1
                      <span className="text-[11px] font-normal block text-warning-600">
                        Centang ini untuk menandai mahasiswa telah menyerahkan buku jilid fisik.
                      </span>
                    </span>
                  </label>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
                  <h4 className="font-bold text-gray-900 dark:text-white/90">Keputusan pemeriksaan</h4>
                  <div className="grid gap-2 sm:grid-cols-3">{([
                    ['APPROVED', 'Softcopy valid', 'emerald'],
                    ['REVISION_NEEDED', 'Minta revisi', 'amber'],
                    ['REJECTED', 'Tolak pengajuan', 'rose'],
                  ] as const).map(([value, label, tone]) => <label key={value} className={`cursor-pointer rounded-xl border p-3 text-xs font-bold ${decision === value ? `border-${tone}-500 bg-${tone}-50` : 'border-gray-200'}`}><input className="sr-only" type="radio" name="decision" checked={decision === value} onChange={() => setDecision(value)} />{label}</label>)}</div>
                  {decision !== 'APPROVED' && <><label className="block text-xs font-bold text-gray-700">Catatan untuk mahasiswa <span className="text-rose-600">(wajib)</span></label><textarea rows={3} value={revisionNotes} onChange={(e) => setRevisionNotes(e.target.value)} placeholder="Jelaskan perbaikan atau alasan penolakan..." className="w-full rounded-xl border border-gray-200 dark:border-gray-800 p-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20" /></>}
                  <button onClick={() => handleUpdateDepositStatus(decision)} disabled={actionLoading || (decision !== 'APPROVED' && !revisionNotes.trim())} className="min-h-11 w-full rounded-xl bg-blue-600 px-4 text-sm font-bold text-white disabled:opacity-50">{actionLoading ? 'Menyimpan…' : 'Simpan keputusan'}</button>
                  {selectedDeposit.verificationStatus === 'APPROVED' && <button onClick={async () => { if (!confirm('Terbitkan bukti serah simpan sekarang?')) return; setActionLoading(true); const res = await fetch(`/api/admin/deposits/${selectedDeposit.id}/issue-proof`, { method: 'POST' }); const json = await res.json(); setActionLoading(false); if (json.success) { alert(`Bukti berhasil diterbitkan: ${json.data.proofNumber}`); setSelectedDeposit(null); await fetchDeposits(); } else { alert(json.error || 'Gagal menerbitkan bukti.'); } }} disabled={actionLoading} className="min-h-11 w-full rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">{actionLoading ? 'Memproses…' : 'Terbitkan Bukti Serah Simpan'}</button>}
                  {selectedDeposit.verificationStatus === 'PROOF_ISSUED' && <a href={`/api/serah-simpan/proof/${selectedDeposit.id}`} target="_blank" rel="noopener noreferrer" className="grid min-h-11 w-full place-items-center rounded-xl border border-blue-300 bg-blue-50 px-4 text-sm font-bold text-blue-700 hover:bg-blue-100">Buka Bukti Resmi ↗</a>}
                </div>
              </div>

              {/* Footer Modal: Action Buttons */}
              <div className="bg-gray-100 p-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedDeposit(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Tutup
                </button>

                <p className="text-[11px] text-gray-500">Pilih keputusan dan simpan melalui panel pemeriksaan di atas.</p>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-300 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <Icon name="plug-in" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Konfirmasi Checkout Paksa</h3>
                  <span className="text-xs text-gray-500">Penutupan Jam Operasional 16.00 WIB</span>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                Tindakan ini akan <strong>menutup secara massal</strong> seluruh sesi mahasiswa yang
                saat ini masih berstatus <strong>AKTIF</strong> di ruangan SAC ({visitorCounts.active}{' '}
                pengunjung). Jam keluar akan dicatat sesuai waktu saat ini.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setShowForceCheckoutModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-300 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Icon name="info" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      {selectedMemberModal.fullName}
                    </h3>
                    <span className="text-[11px] font-mono text-gray-400">
                      NIM: {selectedMemberModal.identityNumber} • PIN: {selectedMemberModal.pin}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMemberModal(null)}
                  className="p-1 text-gray-400 hover:text-gray-800 rounded-lg"
                >
                  <Icon name="close" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center space-y-2">
                  <span className="font-bold text-gray-700 block">Foto Selfie / Profil</span>
                  <div className="w-24 h-24 mx-auto rounded-xl bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
                    {selectedMemberModal.selfiePhotoUrl ? (
                      <img
                        src={selectedMemberModal.selfiePhotoUrl}
                        alt="Selfie"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon name="user-line" />
                    )}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center space-y-2">
                  <span className="font-bold text-gray-700 block">Kartu Identitas (KTM/KTP)</span>
                  <div className="w-24 h-24 mx-auto rounded-xl bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
                    {selectedMemberModal.identityCardUrl ? (
                      <img
                        src={selectedMemberModal.identityCardUrl}
                        alt="ID Card"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon name="info" />
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedMemberModal(null)}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. MODAL: STANDEE CETAK QR RESEPSIONIS                                */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {showStandeeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-300 space-y-4 text-center"
            >
              <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
                <h3 className="font-black text-gray-900 dark:text-white/90 text-sm uppercase tracking-wide">
                  Standee QR Presensi Kiosk Ruangan
                </h3>
                <button
                  onClick={() => setShowStandeeModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-800 rounded-lg"
                >
                  <Icon name="close" />
                </button>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 inline-block mx-auto shadow-inner">
                <QRCodeSVG
                  value="http://localhost:3000/presensi"
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <p className="text-xs text-gray-600 font-medium max-w-xs mx-auto">
                Scan QR Code ini untuk membuka halaman Presensi Mandiri di Meja Resepsionis Gedung F
                Lantai 2 FEB UB.
              </p>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-warning-600 text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Icon name="docs" />
                  <span>Cetak Standee Akrilik</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: FITUR SEGERA HADIR (COMING SOON NOTICE) */}
      <ComingSoonNotice
        isOpen={comingSoonOpen}
        onClose={() => setComingSoonOpen(false)}
        details={comingSoonDetails}
      />
    </>
  );
}
