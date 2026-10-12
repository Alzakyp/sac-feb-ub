import { closeSync, syncSheet, type Dataset } from '../lib/sync-sheets';

const datasets: Dataset[] = ['repository', 'memberships', 'deposits', 'visitors'];
(async () => {
  try {
    for (const dataset of datasets) console.log(await syncSheet(dataset));
  } finally { await closeSync(); }
})();
