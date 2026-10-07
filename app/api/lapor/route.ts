import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTicketNumber } from '@/lib/report-ticket';
import { validateLaporPayload } from '@/lib/lapor-validation';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ success: false, error: 'Format formulir tidak valid.' }, { status: 400 });

  const fullName = String(form.get('fullName') || '').trim();
  const identityNumber = String(form.get('identityNumber') || '').trim();
  const email = String(form.get('email') || '').trim().toLowerCase();
  const phone = String(form.get('phone') || '').trim() || null;
  const category = String(form.get('category') || '').trim();
  const description = String(form.get('description') || '').trim();
  const attachment = form.get('attachment');

  if (!category) return NextResponse.json({ success: false, error: 'Kategori wajib diisi.' }, { status: 400 });
  const validationError = validateLaporPayload({ fullName, identityNumber, email, phone: phone || '', description });
  if (validationError) return NextResponse.json({ success: false, error: validationError }, { status: 400 });

  let attachmentUrl: string | null = null;
  if (attachment instanceof File && attachment.size > 0) {
    if (!IMAGE_TYPES.has(attachment.type) || attachment.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ success: false, error: 'Foto harus JPG, PNG, atau WebP maksimal 5 MB.' }, { status: 400 });
    }
    const ext = attachment.type === 'image/png' ? 'png' : attachment.type === 'image/webp' ? 'webp' : 'jpg';
    const name = `${randomUUID()}.${ext}`;
    const destination = path.join(process.cwd(), 'public', 'uploads', 'reports');
    await mkdir(destination, { recursive: true });
    await writeFile(path.join(destination, name), Buffer.from(await attachment.arrayBuffer()));
    attachmentUrl = `/uploads/reports/${name}`;
  }

  const count = await prisma.ticketReport.count();
  const ticketNumber = createTicketNumber(new Date(), count + 1);
  const data = await prisma.ticketReport.create({
    data: { ticketNumber, fullName, identityNumber, email, phone, category, description, attachmentUrl },
  });

  return NextResponse.json({ success: true, message: 'Aduan berhasil diterima.', data: { ...data, submittedAt: data.createdAt, slaHours: '1×24 jam kerja (Senin–Jumat 08.00–15.00 WIB)' } });
}
