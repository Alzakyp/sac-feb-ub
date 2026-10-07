import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateRoomReservationCode } from '@/lib/reservation-code';

const ROOMS = [
  { name: 'Ruang Diskusi 1', capacity: 4 },
  { name: 'Ruang Diskusi 2', capacity: 6 },
  { name: 'Ruang Diskusi 3', capacity: 8 },
];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const responsibleNim = String(body.responsibleNim || '').replace(/\D/g, '');
  const responsibleName = String(body.responsibleName || '').trim();
  const participantNims = Array.isArray(body.participantNims) ? body.participantNims.map(String).filter(Boolean) : [];
  const usageDate = String(body.usageDate || '');
  const startTime = String(body.startTime || '');
  const endTime = String(body.endTime || '');
  const purpose = String(body.purpose || '').trim();

  if (!responsibleNim || !responsibleName || !usageDate || !startTime || !endTime || !purpose || participantNims.length < 4) {
    return NextResponse.json({ success: false, error: 'Lengkapi NIM penanggung jawab, minimal 4 peserta, waktu, dan keperluan.' }, { status: 400 });
  }
  if (startTime >= endTime || startTime < '08:00' || endTime > '15:00') return NextResponse.json({ success: false, error: 'Jam penggunaan harus antara 08.00–15.00 WIB.' }, { status: 400 });

  const date = new Date(`${usageDate}T00:00:00`);
  const booked = await prisma.roomReservation.findMany({ where: { usageDate: date, status: { in: ['BOOKED', 'ACTIVE'] } }, select: { room: true, startTime: true, endTime: true } });
  const room = ROOMS.find((candidate) => candidate.capacity >= participantNims.length && !booked.some((item) => item.room === candidate.name && startTime < item.endTime && endTime > item.startTime));
  if (!room) return NextResponse.json({ success: false, error: 'Tidak ada ruang tersedia pada waktu tersebut.' }, { status: 409 });

  const count = await prisma.roomReservation.count();
  const reservation = await prisma.roomReservation.create({ data: { reservationCode: generateRoomReservationCode(new Date(), count + 1), responsibleNim, responsibleName, participantNims: JSON.stringify(participantNims), usageDate: date, startTime, endTime, participantCount: participantNims.length, room: room.name, purpose } });
  return NextResponse.json({ success: true, data: reservation });
}
