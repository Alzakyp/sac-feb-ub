import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard & Log Kunjungan - SAC FEB UB',
  description: 'Sistem Monitoring Log Kunjungan Harian dan Akses E-Resource Self Access Centre FEB UB',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex font-sans antialiased text-slate-800">
      {children}
    </div>
  );
}
