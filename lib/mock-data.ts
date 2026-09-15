import { VisitorRecord, ResourceLogRecord } from './utils';

export interface MockStore {
  visitors: VisitorRecord[];
  resourceLogs: ResourceLogRecord[];
}

const INITIAL_VISITORS: VisitorRecord[] = [
  {
    id: 'vis-1',
    nim: '225020200111078',
    nama: 'Dimas Satria Ananda',
    prodi: 'S1 Manajemen',
    keperluan: 'Ruang Diskusi Privat',
    tipe: 'Presensi Fisik SAC',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'vis-2',
    nim: '235020307111019',
    nama: 'Jessica Nathania',
    prodi: 'S1 Akuntansi',
    keperluan: 'Belajar Mandiri',
    tipe: 'Presensi Fisik SAC',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: 'vis-3',
    nim: '215020201111054',
    nama: 'Rafi Ardian Pratama',
    prodi: 'S1 Manajemen',
    keperluan: 'Pengerjaan Skripsi/Tesis',
    tipe: 'Presensi Fisik SAC',
    createdAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
  },
  {
    id: 'vis-4',
    nim: '225020101111018',
    nama: 'Siti Sarah Nurhaliza',
    prodi: 'S1 Ekonomi Pembangunan / Ilmu Ekonomi',
    keperluan: 'Akses PC E-Resource',
    tipe: 'Presensi Fisik SAC',
    createdAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
  },
  {
    id: 'vis-5',
    nim: '215020300111067',
    nama: 'Kevin Jonathan Tan',
    prodi: 'S1 Akuntansi',
    keperluan: 'Pengerjaan Skripsi/Tesis',
    tipe: 'Presensi Fisik SAC',
    createdAt: new Date(Date.now() - 130 * 60 * 1000).toISOString(),
  },
  {
    id: 'vis-6',
    nim: '225020207111999',
    nama: 'Fajar Brawijaya',
    prodi: 'S1 Manajemen',
    keperluan: 'Belajar Mandiri',
    tipe: 'Presensi Fisik SAC',
    createdAt: new Date(Date.now() - 190 * 60 * 1000).toISOString(),
  },
  {
    id: 'vis-7',
    nim: '225020207111033',
    nama: 'Putri Ayu Wandira',
    prodi: 'S1 Manajemen',
    keperluan: 'Belajar Mandiri',
    tipe: 'Presensi Fisik SAC',
    createdAt: new Date(Date.now() - 220 * 60 * 1000).toISOString(),
  },
  {
    id: 'vis-8',
    nim: '197805122005011',
    nama: 'Dr. Ir. Hendra Setiawan, SE., ME.',
    prodi: 'Dosen / Tamu Umum',
    keperluan: 'Lainnya',
    tipe: 'Presensi Fisik SAC',
    createdAt: new Date(Date.now() - 250 * 60 * 1000).toISOString(),
  },
  {
    id: 'vis-9',
    nim: '235020400111005',
    nama: 'Bambang Tri Atmojo',
    prodi: 'Program Pascasarjana (S2/S3)',
    keperluan: 'Pojok Statistik BPS',
    tipe: 'Presensi Fisik SAC',
    createdAt: new Date(Date.now() - 280 * 60 * 1000).toISOString(),
  },
  {
    id: 'vis-10',
    nim: '205020201111089',
    nama: 'Nadia Salsabila Wijaya',
    prodi: 'S1 Manajemen',
    keperluan: 'Ruang Diskusi Privat',
    tipe: 'Presensi Fisik SAC',
    createdAt: new Date(Date.now() - 320 * 60 * 1000).toISOString(),
  },
  {
    id: 'vis-11',
    nim: '215020107111022',
    nama: 'Daffa Rizky Ramadhan',
    prodi: 'S1 Ekonomi Pembangunan / Ilmu Ekonomi',
    keperluan: 'Akses PC E-Resource',
    tipe: 'Presensi Fisik SAC',
    createdAt: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
  },
  {
    id: 'vis-12',
    nim: '225020301111045',
    nama: 'Clarissa Maharani Putri',
    prodi: 'S1 Akuntansi',
    keperluan: 'Belajar Mandiri',
    tipe: 'Presensi Fisik SAC',
    createdAt: new Date(Date.now() - 400 * 60 * 1000).toISOString(),
  },
  {
    id: 'vis-13',
    nim: '215020200111012',
    nama: 'Ahmad Faiz Al-Habsyi',
    prodi: 'S1 Manajemen',
    keperluan: 'Pengerjaan Skripsi/Tesis',
    tipe: 'Presensi Fisik SAC',
    createdAt: new Date(Date.now() - 450 * 60 * 1000).toISOString(),
  },
];

const INITIAL_RESOURCE_LOGS: ResourceLogRecord[] = [
  { id: 'res-1', resourceName: 'ScienceDirect & Scopus', userAgent: 'Chrome / MacOS', createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  { id: 'res-2', resourceName: 'Emerald Insight & ProQuest', userAgent: 'Chrome / Windows', createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString() },
  { id: 'res-3', resourceName: 'Repositori Skripsi & Tesis FEB UB', userAgent: 'Safari / iPhone', createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
  { id: 'res-4', resourceName: 'Pojok Statistik BPS FEB UB', userAgent: 'Firefox / Linux', createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
  { id: 'res-5', resourceName: 'Galeri Investasi BEI Corner', userAgent: 'Edge / Windows', createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
  { id: 'res-6', resourceName: 'E-Books & Open Access Directory', userAgent: 'Chrome / Android', createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString() },
];

// Global in-memory storage attached to globalThis to survive HMR in development
const globalStore = globalThis as unknown as {
  mockStore?: MockStore;
};

if (!globalStore.mockStore) {
  globalStore.mockStore = {
    visitors: [...INITIAL_VISITORS],
    resourceLogs: [...INITIAL_RESOURCE_LOGS],
  };
}

export const mockStore = globalStore.mockStore!;

export function addMockVisitor(data: {
  nim: string;
  nama: string;
  prodi: string;
  keperluan: string;
  tipe?: string;
}): VisitorRecord {
  const newRecord: VisitorRecord = {
    id: 'vis-' + Date.now(),
    nim: data.nim.trim(),
    nama: data.nama.trim(),
    prodi: data.prodi.trim(),
    keperluan: data.keperluan.trim(),
    tipe: data.tipe || 'Presensi Fisik SAC',
    createdAt: new Date().toISOString(),
  };

  mockStore.visitors.unshift(newRecord);
  return newRecord;
}

export function logMockResource(resourceName: string, userAgent?: string): ResourceLogRecord {
  const newLog: ResourceLogRecord = {
    id: 'res-' + Date.now(),
    resourceName,
    userAgent: userAgent || 'Browser Web Client',
    createdAt: new Date().toISOString(),
  };

  mockStore.resourceLogs.unshift(newLog);
  return newLog;
}

export function getMockStatsData(search = '', prodiFilter = 'all') {
  let filtered = [...mockStore.visitors];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (v) =>
        v.nama.toLowerCase().includes(q) ||
        v.nim.toLowerCase().includes(q) ||
        v.keperluan.toLowerCase().includes(q)
    );
  }

  if (prodiFilter && prodiFilter !== 'all') {
    filtered = filtered.filter((v) =>
      v.prodi.toLowerCase().includes(prodiFilter.toLowerCase())
    );
  }

  // Count by prodi
  const prodiDistribution: Record<string, number> = {
    'S1 Manajemen': 0,
    'S1 Akuntansi': 0,
    'S1 Ekonomi Pembangunan': 0,
    'Pascasarjana': 0,
    'Dosen / Tamu': 0,
  };

  mockStore.visitors.forEach((v) => {
    if (v.prodi.includes('Manajemen')) prodiDistribution['S1 Manajemen']++;
    else if (v.prodi.includes('Akuntansi')) prodiDistribution['S1 Akuntansi']++;
    else if (v.prodi.includes('Ekonomi')) prodiDistribution['S1 Ekonomi Pembangunan']++;
    else if (v.prodi.includes('Pascasarjana')) prodiDistribution['Pascasarjana']++;
    else prodiDistribution['Dosen / Tamu']++;
  });

  return {
    kpis: {
      todayVisitorsCount: mockStore.visitors.length,
      yesterdayVisitorsCount: 11,
      todayResourceAccessCount: mockStore.resourceLogs.length + 80,
      totalResourceAccessCount: 540,
      topProdi: 'S1 Manajemen',
      topProdiCount: prodiDistribution['S1 Manajemen'],
      peakHour: '11.00 – 12.00 WIB',
      peakHourCount: 7,
    },
    prodiDistribution,
    weeklyTrend: [
      { day: 'Sen', date: '04 Sep', fisik: 180, online: 320 },
      { day: 'Sel', date: '05 Sep', fisik: 210, online: 380 },
      { day: 'Rab', date: '06 Sep', fisik: 245, online: 450 },
      { day: 'Kam', date: '07 Sep', fisik: 230, online: 410 },
      { day: 'Jum', date: '08 Sep', fisik: 148, online: 290 },
    ],
    visitors: filtered,
    recentResourceLogs: mockStore.resourceLogs,
  };
}
