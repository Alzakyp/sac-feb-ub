type SourceRow = Record<string, unknown>;

export type ImportedBook = {
  inventoryNumber: string | null;
  registerNumber: string | null;
  title: string;
  author: string | null;
  edition: string | null;
  publicationPlace: string | null;
  publisher: string | null;
  publicationYear: number | null;
  physicalDescription: string | null;
  isbn: string | null;
  ddc: string | null;
  subject: string | null;
};

function text(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  return String(value).trim() || null;
}

function integer(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 1000 && parsed <= 2100 ? Math.trunc(parsed) : null;
}

export function mapKatalogRow(row: SourceRow): ImportedBook | null {
  const title = text(row.Judul);
  if (!title) return null;
  return {
    inventoryNumber: text(row['No. Inventaris']),
    registerNumber: text(row.Register),
    title,
    author: text(row.Pengarang),
    edition: text(row.Edisi),
    publicationPlace: text(row['Tempat Terbit']),
    publisher: text(row.Penerbit),
    publicationYear: integer(row.Tahun),
    physicalDescription: text(row.Deskripsi),
    isbn: text(row.ISBN),
    ddc: text(row.DDC),
    subject: text(row.Subjek),
  };
}
