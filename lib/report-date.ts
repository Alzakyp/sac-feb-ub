// WIB calendar dates; upper bound is exclusive, including the entire selected day.
export function reportDateRange(params: URLSearchParams) {
  const from = params.get('from') || '';
  const to = params.get('to') || '';
  for (const value of [from, to]) {
    if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)) throw new Error('Tanggal tidak valid.');
  }
  if (from && to && from > to) throw new Error('Tanggal awal harus sebelum tanggal akhir.');
  return {
    ...(from ? { gte: new Date(`${from}T00:00:00+07:00`) } : {}),
    ...(to ? { lt: new Date(new Date(`${to}T00:00:00+07:00`).getTime() + 86400000) } : {}),
  };
}
