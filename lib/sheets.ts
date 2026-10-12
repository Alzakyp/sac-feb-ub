import crypto from 'node:crypto';
import * as XLSX from 'xlsx';

export type SheetRow = Record<string, unknown>;

export const SHEETS = {
  repository: 'https://docs.google.com/spreadsheets/d/1EyvdG4x1rV3pyytt4smIHs6Mpu3nhSGnfiB_vg9vtAg/export?format=csv&gid=1485930570',
  memberships: 'https://docs.google.com/spreadsheets/d/1PHZ9uBjJ61Sf1Pt6kCUOG0uGVOEM2bHzJEkduxXv-Mo/export?format=csv',
  deposits: 'https://docs.google.com/spreadsheets/d/1MtkNXJn5Mcac9YzxeZnrkjmzpsrBD0WhsUeHpGd5T3c/export?format=csv',
  visitors: 'https://docs.google.com/spreadsheets/d/1dksQK8-m9XiByAbmYNUBGTMbcS7-ed78OMedWqF6lXU/export?format=csv',
} as const;

export function text(value: unknown): string | null {
  const result = String(value ?? '').trim();
  return result && result !== '-' ? result : null;
}

export function key(...values: unknown[]) {
  return crypto.createHash('sha256').update(values.map((value) => text(value) || '').join('\u001f')).digest('hex');
}

export function url(value: unknown) {
  const result = text(value);
  return result && /^https?:\/\//i.test(result) ? result : null;
}

export function date(value: unknown): Date | null {
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    return parsed ? new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d, parsed.H - 7, parsed.M, Math.floor(parsed.S))) : null;
  }
  const input = text(value);
  if (!input) return null;
  const match = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!match) {
    const parsed = new Date(input);
    return Number.isNaN(parsed.valueOf()) ? null : parsed;
  }
  const [, first, secondPart, year, hour = '0', minute = '0', second = '0'] = match;
  // Google Sheets exports locale-dependent dates. Values with first > 12 are DD/MM; otherwise use MM/DD.
  const firstNumber = Number(first);
  const secondNumber = Number(secondPart);
  const day = firstNumber > 12 ? firstNumber : secondNumber;
  const month = firstNumber > 12 ? secondNumber : firstNumber;
  return new Date(Date.UTC(+year, month - 1, day, +hour - 7, +minute, +second));
}

export async function fetchRows(source: keyof typeof SHEETS): Promise<SheetRow[]> {
  const response = await fetch(SHEETS[source]);
  if (!response.ok) throw new Error(`${source}: Google Sheet HTTP ${response.status}`);
  const workbook = XLSX.read(await response.text(), { type: 'string', raw: true });
  return XLSX.utils.sheet_to_json<SheetRow>(workbook.Sheets[workbook.SheetNames[0]], { defval: null });
}
