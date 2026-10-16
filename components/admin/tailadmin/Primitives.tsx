'use client';
import React, { ReactNode } from 'react';

export function Card({ title, subtitle, right, children, className = '' }: { title?: ReactNode; subtitle?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      {(title || right) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
          <div>
            {title && <h3 className="text-base font-bold text-gray-800 dark:text-white/90">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
          {right && <div>{right}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'neutral' }: { children: ReactNode; variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }) {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400',
    warning: 'bg-warning-50 text-warning-600 border-warning-500/20 dark:bg-warning-50 dark:text-warning-600',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[variant]}`}>{children}</span>;
}

const statIcons: Record<string, string> = {
  co_present: 'user-line.svg',
  pending_actions: 'time.svg',
  manage_accounts: 'user-circle.svg',
  query_stats: 'pie-chart.svg',
};

export function StatCard({ label, value, note, icon, tone = 'blue' }: { label: string; value: ReactNode; note?: string; icon: string; tone?: 'blue' | 'amber' | 'emerald' | 'purple' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10',
    amber: 'bg-warning-50 text-warning-600 dark:bg-warning-50',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10',
  };
  const iconFile = statIcons[icon] || 'box.svg';
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</span>
          <div className="mt-1 text-2xl font-black text-gray-800 sm:text-3xl dark:text-white/90">{value}</div>
          {note && <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">{note}</span>}
        </div>
        <div className={`grid h-12 w-12 place-items-center rounded-xl ${tones[tone]}`}>
          <img src={`/tailadmin/icons/${iconFile}`} alt="" className="h-6 w-6 object-contain opacity-80" />
        </div>
      </div>
    </div>
  );
}
