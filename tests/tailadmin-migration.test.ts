import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const page = readFileSync('app/admin/page.tsx', 'utf8');
for (const name of ['ReportManagementPanel', 'SheetDataPanel', 'RepositoryManagementPanel', 'StaffManagementPanel']) {
  assert.match(page, new RegExp(name));
}
assert.ok(readFileSync('components/admin/panels/ManagementPanels.tsx', 'utf8').length > 1000);
function files(dir: string): string[] { return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)]); }
for (const file of ['app/admin/page.tsx', 'app/backoffice/login/page.tsx', ...files('components/admin')].filter(f => f.endsWith('.tsx'))) {
  assert.doesNotMatch(readFileSync(file, 'utf8'), /material-symbols|\b(?:bg|text|border)-slate-|\b(?:bg|text|border)-amber-/, file);
}
const crud = readFileSync('components/admin/CrudPanel.tsx', 'utf8');
assert.match(crud, /<Button/);
assert.match(crud, /<Table/);
console.log('TailAdmin complete migration contract passed');
