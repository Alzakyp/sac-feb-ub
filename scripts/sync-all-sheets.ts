import { closeSync, syncSheet, type Dataset } from '../lib/sync-sheets';

const datasets: Dataset[] = ['repository', 'memberships', 'deposits', 'visitors'];
(async () => {
  try {
    for (const dataset of datasets) {
      console.log(`\n▶ Mulai sinkronisasi ${dataset}...`);
      await syncSheet(dataset);
    }
    console.log('\n✅ Semua Google Sheet berhasil disinkronkan.');
  } catch (error) {
    console.error('Sinkronisasi gagal:', error);
    process.exitCode = 1;
  } finally { await closeSync(); }
})();
