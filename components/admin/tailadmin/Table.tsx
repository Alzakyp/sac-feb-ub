import React, { ReactNode } from 'react';

export function TailTable({
  headers,
  children,
  loading = false,
  empty = false,
  emptyMessage = 'Belum ada data.',
  colSpan = 5,
}: {
  headers: ReactNode[];
  children: ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  colSpan?: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 text-left text-sm dark:divide-gray-800">
          <thead className="bg-gray-50/75 dark:bg-gray-800/40">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-5 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="p-12 text-center text-sm font-medium text-gray-400">
                  <span className="inline-flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-[20px] text-blue-600">progress_activity</span>
                    <span>Memuat data…</span>
                  </span>
                </td>
              </tr>
            ) : empty ? (
              <tr>
                <td colSpan={colSpan} className="p-12 text-center text-sm font-medium text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TailInput({
  icon,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon?: string }) {
  if (icon) {
    return (
      <div className="relative w-full">
        <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
          {icon}
        </span>
        <input
          {...props}
          className={`h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-xs font-medium text-gray-800 transition outline-none placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-blue-500 ${className}`}
        />
      </div>
    );
  }
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-xs font-medium text-gray-800 transition outline-none placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-blue-500 ${className}`}
    />
  );
}

export function TailSelect({
  className = '',
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-11 rounded-xl border border-gray-200 bg-white px-3.5 text-xs font-medium text-gray-700 transition outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 ${className}`}
    >
      {children}
    </select>
  );
}

export function TailButton({
  variant = 'primary',
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) {
  const styles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs focus:ring-blue-200',
    secondary: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-xs focus:ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs focus:ring-rose-200',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800',
  };
  return (
    <button
      {...props}
      className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
