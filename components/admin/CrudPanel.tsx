'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Kind = 'repository' | 'books' | 'members' | 'membership-records';
type Row = Record<string, any>;
const config: Record<Kind, { title: string; fields: string[]; required: string[] }> = {
  repository: { title: 'Repositori', fields: ['nama', 'nim', 'judul', 'judulEn', 'prodi', 'jenis', 'pembimbing', 'koPromotor1', 'koPromotor2', 'penguji1', 'penguji2', 'penguji3', 'penguji4', 'bagianAwalUrl', 'bagianIsiUrl', 'bagianAkhirUrl', 'pernyataanUrl'], required: ['nama', 'nim', 'judul', 'prodi', 'jenis'] },
  books: { title: 'Buku', fields: ['title', 'inventoryNumber', 'registerNumber', 'author', 'edition', 'publisher', 'publicationPlace', 'publicationYear', 'physicalDescription', 'isbn', 'ddc', 'subject'], required: ['title'] },
  members: { title: 'Anggota Website', fields: ['fullName', 'nim', 'email', 'memberType', 'studyProgram', 'studyLevel', 'whatsapp', 'mailingAddress', 'identityType', 'status'], required: ['fullName', 'nim', 'email', 'memberType', 'status'] },
  'membership-records': { title: 'Arsip Anggota', fields: ['fullName', 'nim', 'email', 'memberType', 'studyProgram', 'whatsapp', 'mailingAddress', 'identityType', 'status', 'activeDate', 'validUntil'], required: ['fullName', 'nim', 'memberType', 'status'] },
};
const labels: Record<string, string> = { fullName: 'Nama lengkap', nim: 'NIM', email: 'Email', memberType: 'Jenis anggota', studyProgram: 'Program studi', studyLevel: 'Jenjang', whatsapp: 'WhatsApp', mailingAddress: 'Alamat surat', identityType: 'Jenis identitas', status: 'Status', activeDate: 'Tanggal aktif', validUntil: 'Berlaku sampai', nama: 'Nama penulis', judul: 'Judul', judulEn: 'Judul Inggris', prodi: 'Program studi', jenis: 'Jenis karya', pembimbing: 'Pembimbing', koPromotor1: 'Ko-promotor 1', koPromotor2: 'Ko-promotor 2', penguji1: 'Penguji 1', penguji2: 'Penguji 2', penguji3: 'Penguji 3', penguji4: 'Penguji 4', bagianAwalUrl: 'URL bagian awal', bagianIsiUrl: 'URL bagian isi', bagianAkhirUrl: 'URL bagian akhir', pernyataanUrl: 'URL pernyataan', title: 'Judul buku', inventoryNumber: 'Nomor inventaris', registerNumber: 'Nomor register', author: 'Pengarang', edition: 'Edisi', publisher: 'Penerbit', publicationPlace: 'Tempat terbit', publicationYear: 'Tahun terbit', physicalDescription: 'Deskripsi fisik', isbn: 'ISBN', ddc: 'DDC', subject: 'Subjek', password: 'Password awal (minimal 8 karakter)' };
const inputClass = 'mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm focus-visible:outline-2 focus-visible:outline-amber-500';
const sheetWarning = 'Perubahan hanya disimpan di DB, bukan Google Sheet. Sinkronisasi dapat menimpa perubahan atau memunculkan kembali data yang dihapus.';

export default function CrudPanel({ kind: initialKind }: { kind: 'repository' | 'books' | 'members' }) {
  const [kind, setKind] = useState<Kind>(initialKind);
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
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
  const name = (row: Row) => row.fullName || row.nama || row.title || row.judul || row.id;
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${endpoint}?q=${encodeURIComponent(q)}&page=${page}&status=${status}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Data gagal dimuat.');
      setRows(result.data); setTotal(result.total ?? result.data.length);
    } catch (error) { setError(error instanceof Error ? error.message : 'Koneksi gagal.'); }
    finally { setLoading(false); }
  }, [endpoint, q, page, status]);
  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [load]);
  useEffect(() => { if (selected && !dialog.current?.open) dialog.current?.showModal(); }, [selected]);
  async function open(row: Row, nextMode: 'detail' | 'edit') {
    setError('');
    try {
      const response = await fetch(`${endpoint}/${row.id}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Detail gagal dimuat.');
      setSelected(result.data); setMode(nextMode); setTimeout(() => dialog.current?.showModal(), 0);
    } catch (error) { setError(error instanceof Error ? error.message : 'Koneksi gagal.'); }
  }
  function startCreate() { setError(''); setMode('create'); setSelected({ status: 'PENDING', jenis: 'Skripsi', memberType: 'Mahasiswa' }); setTimeout(() => dialog.current?.showModal(), 0); }
  function close() { if (busy) return; dialog.current?.close(); setSelected(null); }
  async function save(event: React.FormEvent) {
    event.preventDefault(); if (!selected) return;
    setBusy(true); setError('');
    try {
      const payload: Row = {};
      for (const field of [...settings.fields, ...(mode === 'create' && kind === 'members' ? ['password'] : [])]) {
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
  return <section className="space-y-4">
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-4">
      {initialKind === 'members' && <label className="text-sm font-bold">Sumber<select className={inputClass} value={kind} onChange={event => { setKind(event.target.value as Kind); setPage(1); }}><option value="members">Pendaftaran website</option><option value="membership-records">Arsip Google Sheet / lokal</option></select></label>}
      <label className="flex-1 text-sm font-bold">Cari<input className={inputClass} value={q} onChange={event => { setQ(event.target.value); setPage(1); }} /></label>
      {isMembership && <label className="text-sm font-bold">Status<select value={status} className={inputClass} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">Semua</option>{['ACTIVE', 'APPROVED', 'PENDING', 'REJECTED', 'INACTIVE'].map(value => <option key={value}>{value}</option>)}</select></label>}
      <button disabled={busy} className="min-h-11 rounded-xl bg-[#0B2546] px-4 text-sm font-bold text-white" onClick={startCreate}>Tambah {settings.title}</button>
      {(kind === 'repository' || kind === 'membership-records') && <button disabled={busy} className="min-h-11 rounded-xl border px-4 text-sm" onClick={sync}>Sinkron Sheet</button>}
    </div>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
    <p className="text-sm text-slate-600">{total.toLocaleString('id-ID')} data · {settings.title}</p>
    <div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-4">Nama / Judul</th><th className="p-4">NIM / Inventaris</th><th className="p-4">Status / Jenis</th><th className="p-4">Sumber</th><th className="p-4">Aksi</th></tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-t"><td className="max-w-sm p-4">{name(row)}</td><td className="p-4">{row.nim || row.inventoryNumber || '-'}</td><td className="p-4">{row.status || row.jenis || row.author || '-'}</td><td className="p-4">{sheet(row) ? 'SHEET' : kind === 'members' ? 'WEB' : 'LOCAL'}</td><td className="whitespace-nowrap p-2"><button className="min-h-11 px-3 text-blue-700" onClick={() => open(row, 'detail')}>Detail</button><button className="min-h-11 px-3 text-blue-700" onClick={() => open(row, 'edit')}>Edit</button><button disabled={busy} className="min-h-11 px-3 text-rose-700" onClick={() => remove(row)}>Hapus</button></td></tr>)}{!rows.length && <tr><td colSpan={5} className="p-8 text-center">{loading ? 'Memuat…' : 'Tidak ada data.'}</td></tr>}</tbody></table></div>
    <div className="flex justify-end gap-3"><button className="min-h-11 rounded-xl border px-4" disabled={page === 1} onClick={() => setPage(page - 1)}>Sebelumnya</button><span className="p-3">{page}</span><button className="min-h-11 rounded-xl border px-4" disabled={page * (kind === 'repository' || kind === 'books' ? 20 : 25) >= total} onClick={() => setPage(page + 1)}>Berikutnya</button></div>
    <dialog ref={dialog} onCancel={event => { if (busy) event.preventDefault(); else setSelected(null); }} className="m-auto max-h-[90dvh] w-[min(95vw,48rem)] rounded-2xl p-6 backdrop:bg-slate-950/60" aria-labelledby="crud-title">
      {selected && <form onSubmit={save}><h2 id="crud-title" className="text-xl font-bold text-[#0B2546]">{mode === 'detail' ? 'Detail' : mode === 'edit' ? 'Edit' : 'Tambah'} {settings.title}</h2>
        {sheet(selected) && <p className="my-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{sheetWarning}</p>}
        {error && <p role="alert" className="my-3 text-sm text-rose-700">{error}</p>}
        <div className="my-5 grid gap-4 sm:grid-cols-2">{[...settings.fields, ...(mode === 'create' && kind === 'members' ? ['password'] : [])].map(field => <label key={field} className="text-sm font-bold">{labels[field] || field}{field === 'status' ? <select className={inputClass} disabled={mode === 'detail'} value={selected[field] || ''} onChange={event => setSelected({ ...selected, [field]: event.target.value })}>{['ACTIVE', 'APPROVED', 'PENDING', 'REJECTED', 'INACTIVE'].map(value => <option key={value}>{value}</option>)}</select> : <input className={inputClass} readOnly={mode === 'detail' || (mode === 'edit' && field === 'nim' && isMembership)} type={field === 'password' ? 'password' : field.endsWith('Url') ? 'url' : field === 'email' ? 'email' : field === 'publicationYear' ? 'number' : field === 'activeDate' || field === 'validUntil' ? 'date' : 'text'} required={settings.required.includes(field) || field === 'password'} value={selected[field] == null ? '' : (field === 'activeDate' || field === 'validUntil' ? String(selected[field]).slice(0, 10) : selected[field])} onChange={event => setSelected({ ...selected, [field]: event.target.value })} />}</label>)}</div>
        <div className="flex justify-end gap-3"><button type="button" disabled={busy} onClick={close} className="min-h-11 rounded-xl border px-4">{mode === 'detail' ? 'Tutup' : 'Batal'}</button>{mode !== 'detail' && <button disabled={busy} className="min-h-11 rounded-xl bg-[#0B2546] px-4 font-bold text-white">{busy ? 'Menyimpan…' : 'Simpan'}</button>}</div>
      </form>}
    </dialog>
  </section>;
}
