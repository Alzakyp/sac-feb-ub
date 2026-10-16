'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Button from '@/components/admin/tailadmin/Button';
import Badge from '@/components/admin/tailadmin/Badge';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/admin/tailadmin/Table';

type Kind = 'repository' | 'books' | 'members' | 'membership-records';
type Row = Record<string, any>;
const config: Record<Kind, { title: string; fields: string[]; required: string[] }> = {
  repository: { title: 'Repositori', fields: ['nama', 'nim', 'judul', 'judulEn', 'prodi', 'jenis', 'pembimbing', 'koPromotor1', 'koPromotor2', 'penguji1', 'penguji2', 'penguji3', 'penguji4', 'bagianAwalUrl', 'bagianIsiUrl', 'bagianAkhirUrl', 'pernyataanUrl'], required: ['nama', 'nim', 'judul', 'prodi', 'jenis'] },
  books: { title: 'Buku', fields: ['title', 'inventoryNumber', 'registerNumber', 'author', 'edition', 'publisher', 'publicationPlace', 'publicationYear', 'physicalDescription', 'isbn', 'ddc', 'subject'], required: ['title'] },
  members: { title: 'Anggota Website', fields: ['fullName', 'nim', 'email', 'memberType', 'studyProgram', 'studyLevel', 'whatsapp', 'mailingAddress', 'identityType', 'identityPhoto', 'selfiePhoto', 'status'], required: ['fullName', 'nim', 'email', 'memberType', 'status'] },
  'membership-records': { title: 'Arsip Anggota', fields: ['fullName', 'nim', 'email', 'memberType', 'studyProgram', 'whatsapp', 'mailingAddress', 'identityType', 'identityPhoto', 'selfiePhoto', 'status', 'activeDate', 'validUntil'], required: ['fullName', 'nim', 'memberType', 'status'] },
};
const labels: Record<string, string> = { fullName: 'Nama lengkap', nim: 'NIM', email: 'Email', memberType: 'Jenis anggota', identityPhoto: 'Foto identitas', selfiePhoto: 'Foto selfie', studyProgram: 'Program studi', studyLevel: 'Jenjang', whatsapp: 'WhatsApp', mailingAddress: 'Alamat surat', identityType: 'Jenis identitas', status: 'Status', activeDate: 'Tanggal aktif', validUntil: 'Berlaku sampai', nama: 'Nama penulis', judul: 'Judul', judulEn: 'Judul Inggris', prodi: 'Program studi', jenis: 'Jenis karya', pembimbing: 'Pembimbing', koPromotor1: 'Ko-promotor 1', koPromotor2: 'Ko-promotor 2', penguji1: 'Penguji 1', penguji2: 'Penguji 2', penguji3: 'Penguji 3', penguji4: 'Penguji 4', bagianAwalUrl: 'URL bagian awal', bagianIsiUrl: 'URL bagian isi', bagianAkhirUrl: 'URL bagian akhir', pernyataanUrl: 'URL pernyataan', title: 'Judul buku', inventoryNumber: 'Nomor inventaris', registerNumber: 'Nomor register', author: 'Pengarang', edition: 'Edisi', publisher: 'Penerbit', publicationPlace: 'Tempat terbit', publicationYear: 'Tahun terbit', physicalDescription: 'Deskripsi fisik', isbn: 'ISBN', ddc: 'DDC', subject: 'Subjek', password: 'Password awal (minimal 8 karakter)' };
const inputClass = 'mt-1 w-full rounded-xl border border-gray-200 bg-white p-3 text-xs font-medium text-gray-800 transition outline-none placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-blue-500';
const sheetWarning = 'Perubahan hanya disimpan di DB, bukan Google Sheet. Sinkronisasi dapat menimpa perubahan atau memunculkan kembali data yang dihapus.';
export function displayRepositoryIdentity(row: Row) {
  const nama = String(row.nama || '').trim(), nim = String(row.nim || '').trim();
  return /^\d{8,20}$/.test(nama) && !/^\d{8,20}$/.test(nim) ? { nama: nim, nim: nama } : { nama, nim };
}

export default function CrudPanel({ kind: initialKind }: { kind: 'repository' | 'books' | 'members' }) {
  const [kind, setKind] = useState<Kind>(initialKind);
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [jenis, setJenis] = useState('');
  const [prodi, setProdi] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Row | null>(null);
  const [mode, setMode] = useState<'detail' | 'edit' | 'create'>('detail');
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const settings = config[kind];
  const isMembership = kind === 'members' || kind === 'membership-records';
  const endpoint = `/api/backoffice/${kind}`;
  const sheet = (row: Row) => row.sourceKey && !row.sourceKey.startsWith('local:');
  const name = (row: Row) => kind === 'repository' ? displayRepositoryIdentity(row).nama : (row.fullName || row.title || row.judul || row.id);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${endpoint}?q=${encodeURIComponent(q)}&page=${page}&status=${status}&jenis=${jenis}&prodi=${encodeURIComponent(prodi)}&from=${from}&to=${to}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Data gagal dimuat.');
      setRows(result.data); setTotal(result.total ?? result.data.length);
    } catch (error) { setError(error instanceof Error ? error.message : 'Koneksi gagal.'); }
    finally { setLoading(false); }
  }, [endpoint, q, page, status, jenis, prodi, from, to]);
  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [load]);
  useEffect(() => { if (selected && !dialog.current?.open) dialog.current?.showModal(); }, [selected]);
  async function open(row: Row, nextMode: 'detail' | 'edit') {
    setError('');
    try {
      const response = await fetch(`${endpoint}/${row.id}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Detail gagal dimuat.');
      setSelected(kind === 'repository' ? { ...result.data, ...displayRepositoryIdentity(result.data) } : result.data); setMode(nextMode); setTimeout(() => dialog.current?.showModal(), 0);
    } catch (error) { setError(error instanceof Error ? error.message : 'Koneksi gagal.'); }
  }
  function startCreate() { setError(''); setMode('create'); setSelected({ status: 'PENDING', jenis: 'Skripsi', memberType: 'Mahasiswa' }); setTimeout(() => dialog.current?.showModal(), 0); }
  function close() { if (busy) return; dialog.current?.close(); setSelected(null); }
  async function save(event: React.FormEvent) {
    event.preventDefault(); if (!selected) return;
    setBusy(true); setError('');
    try {
      const payload: Row = {};
      for (const field of [...settings.fields.filter(field => !['identityPhoto', 'selfiePhoto'].includes(field)), ...(mode === 'create' && kind === 'members' ? ['password'] : [])]) {
        if (mode === 'edit' && field === 'nim' && isMembership) continue;
        const value = selected[field];
        payload[field] = field === 'publicationYear' ? (value === '' || value == null ? null : Number(value)) : (value ?? '');
      }
      const response = await fetch(mode === 'create' ? endpoint : `${endpoint}/${selected.id}`, { method: mode === 'create' ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Penyimpanan gagal.');
      dialog.current?.close(); setSelected(null); await load();
    } catch (error) { setError(error instanceof Error ? error.message : 'Koneksi gagal.'); }
    finally { setBusy(false); }
  }
  async function remove(row: Row) {
    if (!confirm(`Hapus ${name(row)}?${sheet(row) ? `\n${sheetWarning}` : ''}`)) return;
    setBusy(true); setError('');
    try {
      const response = await fetch(`${endpoint}/${row.id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Hapus gagal.');
      await load();
    } catch (error) { setError(error instanceof Error ? error.message : 'Koneksi gagal.'); }
    finally { setBusy(false); }
  }
  async function sync() {
    if (!confirm('Sinkronisasi dapat menimpa perubahan lokal. Lanjutkan?')) return;
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/backoffice/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataset: kind === 'repository' ? 'repository' : 'memberships' }) });
      const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.error || 'Sinkronisasi gagal.'); await load();
    } catch (error) { setError(error instanceof Error ? error.message : 'Koneksi gagal.'); } finally { setBusy(false); }
  }
  async function exportExcel() {
    setBusy(true);
    try {
      const result: { data: Row[] } = { data: [] };
      let exportPage = 1;
      while (true) {
        const response = await fetch(`${endpoint}?q=${encodeURIComponent(q)}&page=${exportPage}&limit=50&status=${status}&jenis=${jenis}&prodi=${encodeURIComponent(prodi)}&from=${from}&to=${to}`);
        const batch = await response.json();
        if (!response.ok) throw new Error(batch.error || 'Export gagal.');
        result.data.push(...batch.data);
        if (!batch.data.length || result.data.length >= batch.total) break;
        exportPage++;
      }
      if (!result.data?.length) { alert('Tidak ada data.'); return; }
      const { exportFebUbExcel } = await import('@/lib/admin-export');
      exportFebUbExcel(settings.title, result.data.map((row: Row) => kind === 'repository' ? { Nama: displayRepositoryIdentity(row).nama, NIM: displayRepositoryIdentity(row).nim, Judul: row.judul, Jenis: row.jenis, Prodi: row.prodi, Bagian_Awal: row.bagianAwalUrl || '-', Bagian_Isi: row.bagianIsiUrl || '-', Bagian_Akhir: row.bagianAkhirUrl || '-' } : Object.fromEntries(settings.fields.filter(field => !['password', 'identityPhoto', 'selfiePhoto'].includes(field)).map(field => [labels[field] || field, row[field] ?? '-']))), from, to);
    } catch (error) { setError(error instanceof Error ? error.message : 'Export gagal.'); }
    finally { setBusy(false); }
  }
  const icon = kind === 'repository' ? 'docs.svg' : kind === 'books' ? 'table.svg' : 'user-circle.svg';
  return <section className="space-y-4">
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
      {initialKind === 'members' && (
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
          Sumber
          <select className={inputClass} value={kind} onChange={event => { setKind(event.target.value as Kind); setPage(1); }}>
            <option value="members">Pendaftaran website</option>
            <option value="membership-records">Arsip Google Sheet / lokal</option>
          </select>
        </label>
      )}
      <label className="min-w-52 flex-1 text-xs font-bold text-gray-700 dark:text-gray-300">
        <span className="sr-only">Cari {settings.title}</span>
        <div className="relative">
          <img src="/tailadmin/icons/docs.svg" alt="" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
          <input placeholder={`Cari ${settings.title.toLowerCase()}...`} className={`${inputClass} pl-10`} value={q} onChange={event => { setQ(event.target.value); setPage(1); }} />
        </div>
      </label>
      {kind === 'repository' && (
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
          Jenis
          <select className={inputClass} value={jenis} onChange={e => { setJenis(e.target.value); setPage(1); }}>
            <option value="">Semua jenis</option>
            <option>Skripsi</option>
            <option>Tesis</option>
            <option>Disertasi</option>
          </select>
        </label>
      )}
      {kind === 'repository' && (
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
          Program studi
          <input className={inputClass} value={prodi} onChange={e => { setProdi(e.target.value); setPage(1); }} placeholder="Semua program studi" />
        </label>
      )}
      {kind === 'repository' && (
        <>
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
            Dari
            <input type="date" className={inputClass} value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} />
          </label>
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
            Sampai
            <input type="date" className={inputClass} value={to} onChange={e => { setTo(e.target.value); setPage(1); }} />
          </label>
        </>
      )}
      {isMembership && (
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
          Status
          <select value={status} className={inputClass} onChange={event => { setStatus(event.target.value); setPage(1); }}>
            <option value="">Semua</option>
            {['ACTIVE', 'APPROVED', 'PENDING', 'REJECTED', 'INACTIVE'].map(value => <option key={value}>{value}</option>)}
          </select>
        </label>
      )}
      <span className="flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-xs font-bold text-gray-700 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300">
        <img src="/tailadmin/icons/table.svg" alt="" className="h-4 w-4" />
        {total.toLocaleString('id-ID')} data
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={exportExcel}
        className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white px-3.5 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        Export Excel
      </button>
      <Button disabled={busy} onClick={startCreate} className="min-h-11">
        Tambah {settings.title}
      </Button>
      {(kind === 'repository' || kind === 'membership-records') && (
        <button
          disabled={busy}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          onClick={sync}
        >
          <img src="/tailadmin/icons/arrow-right.svg" alt="" className="h-4 w-4" />
          Sinkron Sheet
        </button>
      )}
    </div>
    {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">{error}</p>}
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="overflow-x-auto">
        <Table className="w-full min-w-[760px] text-left text-sm">
          <TableHeader className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-400">
            <TableRow>
              <TableCell isHeader className="p-4">Nama / Judul</TableCell>
              <TableCell isHeader className="p-4">NIM / Inventaris</TableCell>
              <TableCell isHeader className="p-4">Status / Jenis</TableCell>
              <TableCell isHeader className="p-4">Sumber</TableCell>
              <TableCell isHeader className="p-4 text-right">Aksi</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map(row => (
              <tr key={row.id} onClick={() => open(row, 'detail')} className="cursor-pointer align-top transition-colors hover:bg-gray-50/75 dark:hover:bg-white/[0.02]">
                <td className="max-w-sm p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                      <img src={`/tailadmin/icons/${icon}`} alt="" className="h-4 w-4" />
                    </span>
                    <b className="font-semibold text-gray-900 dark:text-white/90 line-clamp-2">{name(row)}</b>
                  </div>
                </td>
                <td className="p-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                  {kind === 'repository' ? displayRepositoryIdentity(row).nim : (row.nim || row.inventoryNumber || '-')}
                </td>
                <td className="p-4">
                  <Badge color="warning" size="sm">{row.status || row.jenis || row.author || '-'}</Badge>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                    sheet(row)
                      ? 'border-warning-500/20 bg-warning-50 text-warning-600 dark:border-warning-500/20 dark:bg-warning-50 dark:text-warning-600'
                      : kind === 'members'
                      ? 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300'
                  }`}>
                    {sheet(row) ? 'SHEET' : kind === 'members' ? 'WEB' : 'LOCAL'}
                  </span>
                </td>
                <td className="whitespace-nowrap p-4 text-right" onClick={event => event.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button aria-label={`Detail ${name(row)}`} className="grid h-9 w-9 place-items-center rounded-lg text-blue-600 transition hover:bg-blue-50 dark:hover:bg-blue-500/10" onClick={() => open(row, 'detail')}>
                      <img src="/tailadmin/icons/eye.svg" alt="" className="h-4 w-4" />
                    </button>
                    <button aria-label={`Edit ${name(row)}`} className="grid h-9 w-9 place-items-center rounded-lg text-warning-600 transition hover:bg-warning-50 dark:hover:bg-warning-50/10" onClick={() => open(row, 'edit')}>
                      <img src="/tailadmin/icons/pencil.svg" alt="" className="h-4 w-4" />
                    </button>
                    <button aria-label={`Hapus ${name(row)}`} disabled={busy} className="grid h-9 w-9 place-items-center rounded-lg text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-500/10" onClick={() => remove(row)}>
                      <img src="/tailadmin/icons/trash.svg" alt="" className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-sm font-medium text-gray-400">
                  {loading ? 'Memuat…' : 'Belum ada data.'}
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
    <div className="flex items-center justify-end gap-2">
      <button
        className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        Sebelumnya
      </button>
      <span className="grid min-h-10 place-items-center px-3 font-mono text-xs font-bold text-gray-600 dark:text-gray-400">
        Halaman {page}
      </span>
      <button
        className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        disabled={page * (kind === 'repository' || kind === 'books' ? 20 : 25) >= total}
        onClick={() => setPage(page + 1)}
      >
        Berikutnya
      </button>
    </div>
    <dialog
      ref={dialog}
      onCancel={event => { if (busy) event.preventDefault(); else setSelected(null); }}
      className="m-auto max-h-[90dvh] w-[min(95vw,48rem)] rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl backdrop:bg-gray-950/50 backdrop:backdrop-blur-xs dark:border-gray-800 dark:bg-gray-900"
      aria-labelledby="crud-title"
    >
      {selected && (
        <form onSubmit={save}>
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
            <h2 id="crud-title" className="text-base font-bold text-gray-900 dark:text-white">
              {mode === 'detail' ? 'Detail' : mode === 'edit' ? 'Edit' : 'Tambah'} {settings.title}
            </h2>
            <button
              type="button"
              onClick={close}
              className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              <img src="/tailadmin/icons/table.svg" alt="" className="h-4 w-4" />
            </button>
          </div>
          {sheet(selected) && (
            <p className="my-4 rounded-xl border border-warning-500/20 bg-warning-50 p-3 text-xs text-warning-600 dark:border-warning-500/20 dark:bg-warning-50 dark:text-warning-600">
              {sheetWarning}
            </p>
          )}
          {error && <p role="alert" className="my-3 text-xs font-semibold text-rose-600">{error}</p>}
          <div className="my-5 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
            {[...settings.fields.filter(field => mode === 'detail' || !['identityPhoto', 'selfiePhoto'].includes(field)), ...(mode === 'create' && kind === 'members' ? ['password'] : [])].map(field => (
              <label key={field} className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                {labels[field] || field}
                {mode === 'detail' && (field === 'identityPhoto' || field === 'selfiePhoto') && selected[field] ? (
                  <span className="mt-2 block">
                    <a
                      href={/^https:\/\//i.test(selected[field]) || String(selected[field]).startsWith('/api/backoffice/members/') ? selected[field] : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 underline hover:text-blue-800"
                    >
                      Buka berkas foto ↗
                    </a>
                  </span>
                ) : mode === 'detail' && field.endsWith('Url') && selected[field] ? (
                  <span className="mt-1 block">
                    <a
                      className="text-xs font-bold text-blue-600 underline hover:text-blue-800"
                      href={/^https:\/\//i.test(selected[field]) ? selected[field] : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Buka Google Drive ↗
                    </a>
                  </span>
                ) : field === 'status' ? (
                  <select
                    className={inputClass}
                    disabled={mode === 'detail'}
                    value={selected[field] || ''}
                    onChange={event => setSelected({ ...selected, [field]: event.target.value })}
                  >
                    {['ACTIVE', 'APPROVED', 'PENDING', 'REJECTED', 'INACTIVE'].map(value => <option key={value}>{value}</option>)}
                  </select>
                ) : (
                  <input
                    className={inputClass}
                    readOnly={mode === 'detail' || (mode === 'edit' && field === 'nim' && isMembership)}
                    type={field === 'password' ? 'password' : field.endsWith('Url') ? 'url' : field === 'email' ? 'email' : field === 'publicationYear' ? 'number' : field === 'activeDate' || field === 'validUntil' ? 'date' : 'text'}
                    required={settings.required.includes(field) || field === 'password'}
                    value={selected[field] == null ? '' : (field === 'activeDate' || field === 'validUntil' ? String(selected[field]).slice(0, 10) : selected[field])}
                    onChange={event => setSelected({ ...selected, [field]: event.target.value })}
                  />
                )}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
            <button
              type="button"
              disabled={busy}
              onClick={close}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {mode === 'detail' ? 'Tutup' : 'Batal'}
            </button>
            {mode !== 'detail' && (
              <button
                disabled={busy}
                className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
              >
                {busy ? 'Menyimpan…' : 'Simpan'}
              </button>
            )}
          </div>
        </form>
      )}
    </dialog>
  </section>;
}
