export function generateRoomReservationCode(date: Date, count: number): string {
  const yymmdd = date.toISOString().slice(2, 10).replace(/-/g, '');
  const seq = String(count).padStart(3, '0');
  return `RSV-${yymmdd}-${seq}`;
}
