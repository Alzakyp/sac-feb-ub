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
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[variant]}`}>{children}</span>;
}

export function StatCard({ label, value, note, icon, tone = 'blue' }: { label: string; value: ReactNode; note?: string; icon: string; tone?: 'blue' | 'amber' | 'emerald' | 'purple' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10',
  };
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</span>
          <div className="mt-1 text-2xl font-black text-gray-800 sm:text-3xl dark:text-white/90">{value}</div>
          {note && <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">{note}</span>}
        </div>
        <div className={`grid h-12 w-12 place-items-center rounded-xl text-[24px] ${tones[tone]}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
    </div>
  );
}
