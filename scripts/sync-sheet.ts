import { closeSync, syncSheet, type Dataset } from '../lib/sync-sheets';

const dataset = process.argv[2] as Dataset | undefined;
const valid: Dataset[] = ['repository', 'memberships', 'deposits', 'visitors'];
if (!dataset || !valid.includes(dataset)) throw new Error(`Dataset wajib: ${valid.join(', ')}`);

syncSheet(dataset)
  .then((result) => console.log(JSON.stringify(result, null, 2)))
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(closeSync);
