import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeWhatsapp, validateMemberInput } from '@/lib/member-registration';

const MAX = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ID_TYPES = new Set([...IMAGE_TYPES, 'application/pdf']);

async function saveFile(file: File, folder: string, allowed: Set<string>) {
  if (!allowed.has(file.type) || file.size > MAX) throw new Error('Format file tidak sesuai atau ukuran melebihi 5 MB.');
  const ext = file.type === 'application/pdf' ? 'pdf' : file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const dir = path.join(process.cwd(), 'storage', 'members', folder);
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${randomUUID()}.${ext}`);
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()));
  return filePath;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const fullName = String(form.get('fullName') || '').trim();
    const nim = String(form.get('nim') || '').replace(/\D/g, '');
    const email = String(form.get('email') || '').trim().toLowerCase();
    const whatsappRaw = String(form.get('whatsapp') || '').trim();
    const password = String(form.get('password') || '');
    const validation = validateMemberInput({ fullName, nim, email, whatsapp: whatsappRaw, password });
    if (validation) return NextResponse.json({ success: false, error: validation }, { status: 400 });

    if (await prisma.member.findFirst({ where: { OR: [{ nim }, { email }] } })) {
      return NextResponse.json({ success: false, error: 'NIM atau email sudah terdaftar.' }, { status: 409 });
    }

    const selfie = form.get('selfie');
    const identity = form.get('identityFile');
    if (!(selfie instanceof File) || !(identity instanceof File)) return NextResponse.json({ success: false, error: 'Foto diri dan identitas wajib diunggah.' }, { status: 400 });
    const [selfiePath, identityPath] = await Promise.all([saveFile(selfie, 'selfie', IMAGE_TYPES), saveFile(identity, 'identity', ID_TYPES)]);

    const member = await prisma.member.create({ data: {
      memberType: String(form.get('memberType') || ''), fullName, nim,
      studyLevel: String(form.get('studyLevel') || '') || null,
      studyProgram: String(form.get('studyProgram') || '') || null,
      whatsapp: normalizeWhatsapp(whatsappRaw), email,
      mailingAddress: String(form.get('mailingAddress') || '').trim(),
      identityType: String(form.get('identityType') || ''),
      passwordHash: await bcrypt.hash(password, 10), selfiePath, identityPath,
    }});
    return NextResponse.json({ success: true, data: { id: member.id, nim: member.nim, status: member.status } });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
