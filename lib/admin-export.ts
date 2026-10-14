import * as XLSX from 'xlsx';

export function exportFebUbExcel(title: string, rows: Record<string, unknown>[], from = '', to = '') {
  const period = from || to ? `${from || 'awal'} s.d. ${to || 'sekarang'}` : 'Semua periode';
  const heading = [
    ['UNIVERSITAS BRAWIJAYA'],
    ['FAKULTAS EKONOMI DAN BISNIS'],
    ['SELF ACCESS CENTRE (SAC)'],
    [title],
    [`Periode: ${period}`],
    [`Diekspor: ${new Date().toLocaleString('id-ID')}`],
    [],
  ];
  const ws = XLSX.utils.aoa_to_sheet(heading);
  XLSX.utils.sheet_add_json(ws, rows, { origin: 'A8' });
  const width = Math.max(8, ...rows.flatMap(row => Object.keys(row).map(key => key.length)));
  ws['!cols'] = Array.from({ length: width }, () => ({ wch: 22 }));
  ws['!merges'] = [0, 1, 2, 3, 4, 5].map(r => ({ s: { r, c: 0 }, e: { r, c: Math.max(0, Object.keys(rows[0] || {}).length - 1) } }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, `${title.replace(/[^a-z0-9]+/gi, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
