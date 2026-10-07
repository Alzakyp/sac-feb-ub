export function createTicketNumber(date: Date, sequence: number): string {
  return `LAP-${date.getFullYear()}-${String(sequence).padStart(4, '0')}`;
}
