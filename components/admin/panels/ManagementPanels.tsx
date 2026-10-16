'use client';

import { Icon } from '@/components/admin/tailadmin/Icon';
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

export function ReportManagementPanel() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [status, setStatus] = useState('ALL');
  const [selected, setSelected] = useState<any | null>(null);
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    const res = await fetch(`/api/backoffice/reports?status=${status}`);
    const json = await res.json();
    if (json.success) setTickets(json.data);
  }, [status]);
  useEffect(() => { load(); }, [load]);

  async function update(nextStatus: string) {
    if (!selected) return;
    await fetch(`/api/backoffice/reports/${selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: nextStatus, staffNotes: notes }) });
    setSelected(null); load();
  }

  return <div className="space-y-4">
    <div className="flex justify-between items-center rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm font-bold text-gray-900 dark:text-white/90">{tickets.length} tiket</p>
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-gray-200 dark:border-gray-800 p-2 text-xs bg-white"><option value="ALL">Semua Status</option><option value="OPEN">Baru</option><option value="IN_PROGRESS">Diproses</option><option value="RESOLVED">Selesai</option></select>
    </div>
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03]"><table className="w-full text-left text-xs"><thead className="bg-gray-50/75 text-gray-500 uppercase tracking-wider text-[11px] dark:bg-gray-800/40 dark:text-gray-400"><tr><th className="p-3">Tiket</th><th className="p-3">Pengadu</th><th className="p-3">Kategori</th><th className="p-3">Laporan</th><th className="p-3">Status</th><th className="p-3" /></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{tickets.map((t) => <tr key={t.id}><td className="p-3 font-mono font-bold text-gray-900 dark:text-white/90">{t.ticketNumber}</td><td className="p-3"><p className="font-bold">{t.fullName}</p><p className="text-gray-500">{t.identityNumber}</p></td><td className="p-3">{t.category}</td><td className="p-3 max-w-xs line-clamp-2">{t.description}</td><td className="p-3"><span className="rounded bg-warning-50 px-2 py-1 font-bold text-[10px] text-warning-600">{t.status}</span></td><td className="p-3 text-right"><button onClick={() => { setSelected(t); setNotes(t.staffNotes || ''); }} className="text-blue-600 hover:underline">Tanggapi</button></td></tr>)}{tickets.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">Belum ada laporan.</td></tr>}</tbody></table></div>
    {selected && <div className="fixed inset-0 z-50 grid place-items-center bg-gray-950/50 p-4"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"><p className="text-xs font-bold text-warning-600">{selected.ticketNumber}</p><h3 className="mt-2 font-bold text-gray-900 dark:text-white/90">{selected.category}</h3><p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm leading-6">{selected.description}</p><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Tulis tanggapan untuk mahasiswa..." className="mt-4 w-full rounded-xl border p-3 text-sm" /><div className="mt-4 flex flex-wrap justify-end gap-2"><button onClick={() => setSelected(null)} className="rounded-lg border px-3 py-2 text-xs">Batal</button><button onClick={() => update('IN_PROGRESS')} className="rounded-lg bg-warning-50 px-3 py-2 text-xs font-bold">Proses</button><button onClick={() => update('RESOLVED')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Kirim Jawaban & Selesai</button></div></div></div>}
  </div>;
}

export function SheetDataPanel({ dataset, title }: { dataset: 'memberships' | 'deposits' | 'visitors'; title: string }) {
  const [data, setData] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [total, setTotal] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/backoffice/sheets/${dataset}?q=${encodeURIComponent(q)}&page=${page}&from=${from}&to=${to}`);
    const json = await res.json();
    if (json.success) { setData(json.data); setTotal(json.total); }
    setLoading(false);
  }, [dataset, q, page, from, to]);
  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [load]);
  async function sync() {
    setSyncing(true);
    const res = await fetch('/api/backoffice/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataset }) });
    const json = await res.json(); setSyncing(false);
    alert(json.success ? `Sinkronisasi ${title} selesai.` : json.error); if (json.success) load();
  }
  async function downloadExcel() {
    const res = await fetch(`/api/backoffice/sheets/${dataset}?q=${encodeURIComponent(q)}&limit=5000&from=${from}&to=${to}`);
    const json = await res.json();
    if (!json.success || !json.data.length) { alert('Tidak ada data.'); return; }
    const { exportFebUbExcel } = await import('@/lib/admin-export');
    exportFebUbExcel(title, json.data.map((row: any) => ({
      Nama: row.fullName || '-', NIM: row.nim || row.identityNumber || '-', Prodi: row.studyProgram || row.workType || row.memberType || '-',
      Tanggal: row.registeredAt || row.submittedAt || row.checkInTime || '-', Status_Bukti: row.proofNumber || row.status || row.title || '-',
      Tautan_Berkas: row.downloadProofUrl || row.driveFolderUrl || row.mainSectionUrl || '-',
    })), from, to);
  }
  return <div className="space-y-4">
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex w-full flex-wrap gap-2 sm:max-w-2xl"><label className="min-w-48 flex-1"><span className="sr-only">Cari {title}</span><input value={q} onChange={e => { setQ(e.target.value); setPage(1); }} placeholder={`Cari data ${title}...`} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400" /></label><label className="text-xs text-gray-500">Dari<input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} className="ml-1 rounded-xl border border-gray-200 dark:border-gray-800 p-2 text-xs" /></label><label className="text-xs text-gray-500">Sampai<input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1); }} className="ml-1 rounded-xl border border-gray-200 dark:border-gray-800 p-2 text-xs" /></label></div>
      <div className="flex items-center gap-3"><strong className="text-sm text-gray-600">{total.toLocaleString('id-ID')} data</strong><button onClick={downloadExcel} className="min-h-11 rounded-xl border border-gray-200 dark:border-gray-800 px-3 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">Export Excel</button><button onClick={sync} disabled={syncing} className="min-h-11 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white disabled:opacity-50">{syncing ? 'Menyinkronkan…' : 'Sinkron Google Sheet'}</button></div>
    </div>
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03]"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-gray-50/75 text-xs uppercase tracking-wider text-gray-500 dark:bg-gray-800/40 dark:text-gray-400"><tr><th className="p-4">Nama / NIM</th><th className="p-4">Program / Jenis</th><th className="p-4">Tanggal</th><th className="p-4">Status / Bukti</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{loading ? <tr><td colSpan={4} className="p-10 text-center">Memuat…</td></tr> : data.length === 0 ? <tr><td colSpan={4} className="p-10 text-center text-gray-400">Belum ada data.</td></tr> : data.map(row => {
      const rawDate = row.registeredAt || row.submittedAt || row.checkInTime;
      const parsedDate = rawDate ? new Date(rawDate) : null;
      const dateText = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
      const proofText = row.proofNumber ? `${row.proofNumber} • ${row.title || 'Tanpa Judul'}` : (row.title || row.status || (row.checkOutTime ? 'Selesai' : 'Tercatat'));
      return <tr key={row.id} onClick={() => dataset === 'deposits' && setSelectedRecord(row)} className={`align-top ${dataset === 'deposits' ? 'cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-500/10' : 'hover:bg-gray-50 dark:hover:bg-white/[0.03]'}`}><td className="p-4"><b className="block text-gray-900 dark:text-white/90">{row.fullName}</b><span className="text-xs text-gray-500">{row.nim || row.identityNumber}</span></td><td className="p-4">{row.studyProgram || row.memberType || row.workType || '-'}</td><td className="p-4 text-xs font-semibold">{dateText}</td><td className="max-w-md p-4"><span className="line-clamp-2">{proofText}</span></td></tr>;
    })}</tbody></table></div></div>
    <div className="flex justify-end gap-2"><button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="min-h-11 rounded-xl border px-4 disabled:opacity-40">Sebelumnya</button><span className="grid min-h-11 place-items-center px-3 text-sm font-bold">{page} / {Math.max(1, Math.ceil(total / 25))}</span><button disabled={page * 25 >= total} onClick={() => setPage(p => p + 1)} className="min-h-11 rounded-xl border px-4 disabled:opacity-40">Berikutnya</button></div>
    {selectedRecord && <div className="fixed inset-0 z-50 grid place-items-center bg-gray-950/60 p-4" onClick={() => setSelectedRecord(null)}><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}><h3 className="text-lg font-bold text-gray-900 dark:text-white/90">Detail Bukti Serah Simpan</h3><p className="mt-2 text-sm font-bold text-gray-800">{selectedRecord.title || 'Tanpa Judul'}</p><div className="mt-4 space-y-2 text-xs"><p><b>Nama:</b> {selectedRecord.fullName} ({selectedRecord.nim})</p><p><b>Nomor Bukti:</b> {selectedRecord.proofNumber || '-'}</p><p><b>Nilai Plagiasi:</b> {selectedRecord.plagiarismScore || '-'}</p><p><b>Catatan Revisi:</b> {selectedRecord.revisionNotes || '-'}</p></div><div className="mt-5 space-y-2 border-t pt-4 text-xs font-bold text-blue-700">{selectedRecord.downloadProofUrl && <a className="block hover:underline" href={selectedRecord.downloadProofUrl} target="_blank" rel="noopener noreferrer">Unduh Bukti Lengkap (Drive) ↗</a>}{selectedRecord.driveFolderUrl && <a className="block hover:underline" href={selectedRecord.driveFolderUrl} target="_blank" rel="noopener noreferrer">Folder Drive Berkas ↗</a>}{selectedRecord.initialSectionUrl && <a className="block hover:underline" href={selectedRecord.initialSectionUrl} target="_blank" rel="noopener noreferrer">Berkas Awal ↗</a>}{selectedRecord.mainSectionUrl && <a className="block hover:underline" href={selectedRecord.mainSectionUrl} target="_blank" rel="noopener noreferrer">Berkas Isi ↗</a>}{selectedRecord.finalSectionUrl && <a className="block hover:underline" href={selectedRecord.finalSectionUrl} target="_blank" rel="noopener noreferrer">Berkas Akhir ↗</a>}</div><div className="mt-6 flex justify-end"><button onClick={() => setSelectedRecord(null)} className="min-h-10 rounded-xl bg-gray-100 px-4 dark:bg-gray-800 text-xs font-bold text-gray-700">Tutup</button></div></div></div>}
  </div>;
}

export function RepositoryManagementPanel() {
  const [data, setData] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [editDoc, setEditDoc] = useState<any | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/backoffice/repository?q=${encodeURIComponent(q)}&page=${page}`);
    const json = await res.json();
    if (json.success) {
      setData(json.data);
      setTotal(json.total);
    }
    setLoading(false);
  }, [q, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function handleSync() {
    if (!confirm('Tarik data baru dari Google Spreadsheet sekarang?')) return;
    setSyncing(true);
    const res = await fetch('/api/backoffice/repository/sync', { method: 'POST' });
    const json = await res.json();
    alert(json.message || json.error);
    setSyncing(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm('Hapus naskah ini dari repositori?')) return;
    await fetch(`/api/backoffice/repository/${id}`, { method: 'DELETE' });
    load();
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editDoc) return;
    await fetch(`/api/backoffice/repository/${editDoc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editDoc),
    });
    setEditDoc(null);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="relative w-full sm:w-80">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Cari judul, NIM, penulis, prodi..."
            className="w-full pl-3 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs outline-none"
          />
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-xs font-bold text-gray-500">{total.toLocaleString('id-ID')} Karya</span>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <Icon name="info" />
            <span>{syncing ? 'Menyinkronkan…' : 'Sinkron Google Sheets'}</span>
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-100 dark:bg-gray-800/50 dark:border-gray-800 text-gray-500 font-bold uppercase text-[11px]">
            <tr>
              <th className="p-3">Penulis / NIM</th>
              <th className="p-3">Judul Karya</th>
              <th className="p-3">Prodi & Jenis</th>
              <th className="p-3">Tautan Berkas</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="p-3">
                  <p className="font-bold text-gray-800">{d.nama}</p>
                  <p className="text-[11px] text-gray-500 font-mono">{d.nim}</p>
                </td>
                <td className="p-3 max-w-md">
                  <p className="font-semibold text-gray-900 dark:text-white/90 line-clamp-2">{d.judul}</p>
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-bold block w-fit mb-1">{d.jenis}</span>
                  <span className="text-[11px] text-gray-600">{d.prodi}</span>
                </td>
                <td className="p-3 space-x-1.5 whitespace-nowrap">
                  {d.bagianAwalUrl && <a href={d.bagianAwalUrl} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 rounded bg-warning-50 text-warning-600 border border-warning-500/20">Awal</a>}
                  {d.bagianIsiUrl && <a href={d.bagianIsiUrl} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200">Isi</a>}
                  {d.bagianAkhirUrl && <a href={d.bagianAkhirUrl} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">Akhir</a>}
                </td>
                <td className="p-3 text-right space-x-2 whitespace-nowrap">
                  <button onClick={() => setEditDoc(d)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => remove(d.id)} className="text-xs text-rose-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">{loading ? 'Memuat data…' : 'Tidak ada naskah ditemukan.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center px-2 py-1 text-xs">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-40">Sebelumnya</button>
        <span>Halaman {page}</span>
        <button disabled={data.length < 20} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-40">Berikutnya</button>
      </div>

      {editDoc && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-gray-950/50 p-4">
          <form onSubmit={saveEdit} className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl space-y-3">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white/90">Edit Data Karya</h3>
            <input required value={editDoc.nama} onChange={(e) => setEditDoc({ ...editDoc, nama: e.target.value })} placeholder="Nama" className="w-full rounded-xl border p-2 text-xs" />
            <input required value={editDoc.nim} onChange={(e) => setEditDoc({ ...editDoc, nim: e.target.value })} placeholder="NIM" className="w-full rounded-xl border p-2 text-xs" />
            <textarea required value={editDoc.judul} onChange={(e) => setEditDoc({ ...editDoc, judul: e.target.value })} rows={3} placeholder="Judul" className="w-full rounded-xl border p-2 text-xs" />
            <input value={editDoc.prodi} onChange={(e) => setEditDoc({ ...editDoc, prodi: e.target.value })} placeholder="Prodi" className="w-full rounded-xl border p-2 text-xs" />
            <input value={editDoc.bagianAwalUrl || ''} onChange={(e) => setEditDoc({ ...editDoc, bagianAwalUrl: e.target.value })} placeholder="Link Bagian Awal" className="w-full rounded-xl border p-2 text-xs" />
            <input value={editDoc.bagianIsiUrl || ''} onChange={(e) => setEditDoc({ ...editDoc, bagianIsiUrl: e.target.value })} placeholder="Link Bagian Isi" className="w-full rounded-xl border p-2 text-xs" />
            <input value={editDoc.bagianAkhirUrl || ''} onChange={(e) => setEditDoc({ ...editDoc, bagianAkhirUrl: e.target.value })} placeholder="Link Bagian Akhir" className="w-full rounded-xl border p-2 text-xs" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditDoc(null)} className="px-3 py-1.5 text-xs rounded-lg border">Batal</button>
              <button className="px-4 py-1.5 text-xs rounded-lg bg-blue-600 text-white font-bold">Simpan</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function StaffManagementPanel() {
  const [list, setList] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PETUGAS');
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selfRole, setSelfRole] = useState('ADMIN');
  const [editStaff, setEditStaff] = useState<any | null>(null);
  const [resetId, setResetId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/backoffice/staff');
    const json = await res.json();
    if (json.success) { setList(json.data); setSelfRole(json.role); }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/backoffice/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || 'Gagal');
      return;
    }
    setName('');
    setEmail('');
    setPassword('');
    setShowCreate(false);
    load();
  }

  async function toggle(id: string, active: boolean) {
    await fetch(`/api/backoffice/staff/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    });
    load();
  }

  async function reset(id: string) {
    if (resetPassword.length < 8) {
      setError('Password baru minimal 8 karakter.');
      return;
    }
    await fetch(`/api/backoffice/staff/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: resetPassword }),
    });
    setResetId(null);
    setResetPassword('');
    setError('');
  }

  async function remove(id: string) {
    if (!confirm('Hapus staf ini?')) return;
    await fetch(`/api/backoffice/staff/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={() => { setError(''); setShowCreate(true); }} className="min-h-11 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white">Tambah Staf</button></div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-100 dark:bg-gray-800/50 dark:border-gray-800 text-[11px] font-bold uppercase text-gray-500">
            <tr>
              <th className="p-3.5">Nama</th>
              <th className="p-3.5">Email</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {list.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="p-3.5 font-bold text-gray-800">{s.name}</td>
                <td className="p-3.5 text-gray-600 font-mono">{s.email}</td>
                <td className="p-3.5">
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold">
                    {s.role}
                  </span>
                </td>
                <td className="p-3.5">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      s.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {s.active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="p-3.5 text-right space-x-3">
                  <button onClick={() => setEditStaff(s)} className="min-h-11 text-blue-700 hover:underline">Detail{(s.role !== 'PROGRAMMER' || selfRole === 'PROGRAMMER') ? ' / Edit' : ''}</button>
                  {(s.role !== 'PROGRAMMER' || selfRole === 'PROGRAMMER') && <><button
                    onClick={() => toggle(s.id, s.active)}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    {s.active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button
                    onClick={() => { setResetId(s.id); setResetPassword(''); }}
                    className="text-xs text-warning-600 hover:underline font-medium"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={() => remove(s.id)}
                    className="text-xs text-rose-600 hover:underline font-medium"
                  >
                    Hapus
                  </button></>}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  Belum ada data staf terdaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showCreate && <div className="fixed inset-0 z-50 grid place-items-center bg-gray-950/60 p-4"><form onSubmit={create} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl"><h3 className="text-lg font-bold text-gray-900 dark:text-white/90">Tambah Staf Baru</h3>{error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}<label className="block text-sm font-bold">Nama lengkap<input required autoFocus value={name} onChange={e => setName(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border p-3" /></label><label className="block text-sm font-bold">Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border p-3" /></label><label className="block text-sm font-bold">Password<input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border p-3" /></label><label className="block text-sm font-bold">Role<select value={role} onChange={e => setRole(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border p-3"><option value="PETUGAS">PETUGAS</option><option value="ADMIN">ADMIN</option>{selfRole === 'PROGRAMMER' && <option value="PROGRAMMER">PROGRAMMER</option>}</select></label><div className="flex justify-end gap-2"><button type="button" onClick={() => setShowCreate(false)} className="min-h-11 rounded-xl border px-4">Batal</button><button className="min-h-11 rounded-xl bg-blue-600 px-4 font-bold text-white">Simpan</button></div></form></div>}
      {editStaff && <div className="fixed inset-0 z-50 grid place-items-center bg-gray-950/50 p-4"><form onSubmit={async event => { event.preventDefault(); if (editStaff.role === 'PROGRAMMER' && selfRole !== 'PROGRAMMER') return; const response = await fetch(`/api/backoffice/staff/${editStaff.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editStaff.name, role: editStaff.role }) }); const result = await response.json(); if (!response.ok) { setError(result.error || 'Simpan gagal.'); return; } setEditStaff(null); load(); }} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-xl"><h3 className="text-lg font-bold text-gray-900 dark:text-white/90">Detail / Edit Staf</h3><p className="text-xs text-gray-500">{editStaff.email}</p>{error && <p role="alert" className="text-sm text-rose-700">{error}</p>}<label className="block text-sm font-bold">Nama<input required value={editStaff.name} disabled={editStaff.role === 'PROGRAMMER' && selfRole !== 'PROGRAMMER'} onChange={event => setEditStaff({ ...editStaff, name: event.target.value })} className="mt-1 min-h-11 w-full rounded-xl border p-3" /></label><label className="block text-sm font-bold">Role<select value={editStaff.role} disabled={editStaff.role === 'PROGRAMMER' && selfRole !== 'PROGRAMMER'} onChange={event => setEditStaff({ ...editStaff, role: event.target.value })} className="mt-1 min-h-11 w-full rounded-xl border p-3"><option value="PETUGAS">PETUGAS</option><option value="ADMIN">ADMIN</option>{selfRole === 'PROGRAMMER' && <option value="PROGRAMMER">PROGRAMMER</option>}</select></label><div className="flex justify-end gap-2"><button type="button" onClick={() => setEditStaff(null)} className="min-h-11 rounded-xl border px-4">Tutup</button>{(editStaff.role !== 'PROGRAMMER' || selfRole === 'PROGRAMMER') && <button className="min-h-11 rounded-xl bg-blue-600 px-4 font-bold text-white">Simpan</button>}</div></form></div>}
      {resetId && <div className="fixed inset-0 z-50 grid place-items-center bg-gray-950/50 p-4"><form onSubmit={(e) => { e.preventDefault(); reset(resetId); }} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"><h3 className="font-bold text-gray-900 dark:text-white/90">Reset Password Staf</h3><input required minLength={8} type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="Password baru (min. 8 karakter)" className="mt-4 w-full rounded-xl border p-3 text-sm"/><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setResetId(null)} className="rounded-lg border px-3 py-2 text-xs">Batal</button><button className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white">Simpan</button></div></form></div>}
    </div>
  );
}

