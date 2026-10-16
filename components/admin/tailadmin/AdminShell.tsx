'use client';
import React, { ReactNode, useState } from 'react';

type Tab = { id: string; label: string; icon: string; badge?: string | null; badgeColor?: string };

const icons: Record<string, string> = {
  dashboard: 'grid.svg', assignment_turned_in: 'check-circle.svg', support_agent: 'chat.svg',
  manage_accounts: 'user-circle.svg', auto_stories: 'docs.svg', badge: 'badge.svg',
  verified: 'check-circle.svg', history: 'time.svg', library_books: 'table.svg',
  qr_code: 'copy.svg', logout: 'plug-in.svg', menu: 'list.svg', schedule: 'calender-line.svg', refresh: 'arrow-right.svg',
};
function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <img aria-hidden="true" src={`/tailadmin/icons/${icons[name] || 'grid.svg'}`} alt="" className={`h-5 w-5 object-contain ${className}`} />;
}

export function AdminShell({
  tabs,
  activeTab,
  onSelectTab,
  currentTime,
  onRefresh,
  refreshing,
  onLogout,
  loggingOut,
  logoutError,
  onOpenStandee,
  children,
}: {
  tabs: Tab[];
  activeTab: string;
  onSelectTab: (id: string) => void;
  currentTime: string;
  onRefresh: () => void;
  refreshing: boolean;
  onLogout: () => void;
  loggingOut: boolean;
  logoutError?: string;
  onOpenStandee: () => void;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = tabs.find((t) => t.id === activeTab);

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 border-b border-gray-100 p-5 dark:border-gray-800">
          <img src="/logo-feb-black.png" alt="FEB UB" className="h-9 w-auto object-contain shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="truncate text-sm font-black text-[#0B2546] dark:text-white">SAC FEB UB</span>
            <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase">Backoffice</span>
          </div>
        </div>

        <nav className="space-y-1 p-3">
          <div className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Menu Utama</div>
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onSelectTab(tab.id);
                  setMobileOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                  active
                    ? 'border border-blue-200/60 bg-blue-50 font-bold text-blue-700 shadow-xs dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-100/70 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon name={tab.icon} className={active ? 'opacity-100' : 'opacity-50'} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${active ? 'bg-blue-600 text-white' : tab.badgeColor || 'bg-gray-200 text-gray-700'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 border-t border-gray-100 p-4 dark:border-gray-800">
        <button
          onClick={onOpenStandee}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-2 px-3 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
        >
          <Icon name="qr_code" className="opacity-70" />
          <span>Cetak Standee QR</span>
        </button>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-white/5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-emerald-500" />
            <div className="flex flex-col min-w-0">
              <span className="truncate text-[11px] font-bold text-gray-900 dark:text-white">Admin Petugas</span>
              <span className="font-mono text-[9px] text-gray-400">Live Session</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="flex min-h-9 min-w-9 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-500/10"
            title={loggingOut ? 'Sedang keluar…' : 'Keluar akun'}
            aria-label={loggingOut ? 'Sedang keluar…' : 'Keluar akun'}
          >
            <Icon name="logout" className="opacity-60" />
          </button>
        </div>
        {logoutError && <p role="alert" className="text-xs text-rose-600">{logoutError}</p>}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-gray-50 font-sans text-gray-800 antialiased dark:bg-gray-900 dark:text-gray-200">
      <aside className="sticky top-0 z-20 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-gray-200 bg-white shadow-xs lg:flex dark:border-gray-800 dark:bg-gray-900">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-64 flex-col border-r border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-4 py-3 shadow-2xs backdrop-blur-xs sm:px-6 dark:border-gray-800 dark:bg-gray-900/95">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 lg:hidden dark:border-gray-800 dark:text-gray-300"
              aria-label="Buka menu navigasi"
            >
              <Icon name="menu" />
            </button>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-600 dark:text-blue-400">SAC FEB UB / Dashboard</div>
              <h1 className="text-lg font-black tracking-tight text-gray-900 sm:text-xl dark:text-white">{current?.label}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-1.5 font-mono text-xs font-bold text-gray-700 md:flex dark:border-gray-800 dark:bg-white/5 dark:text-gray-300">
              <Icon name="schedule" className="opacity-70" />
              <span>{currentTime}</span>
            </div>
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-blue-500/10"
              title="Segarkan Data"
              aria-label="Segarkan Data"
            >
              <Icon name="refresh" className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
