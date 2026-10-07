import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').trim();
  const ddc = (searchParams.get('ddc') || '').trim();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '24'));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (query) {
    where.OR = [
      { title: { contains: query } },
      { author: { contains: query } },
      { isbn: { contains: query } },
      { ddc: { contains: query } },
      { publisher: { contains: query } },
    ];
  }

  if (ddc) {
    // match ddc prefix, e.g. "657" matches "657.042 WEY f"
    where.ddc = { contains: ddc };
  }

  const [total, books] = await Promise.all([
    prisma.bookCollection.count({ where }),
    prisma.bookCollection.findMany({ where, skip, take: limit, orderBy: { inventoryNumber: 'asc' } }),
  ]);

  return NextResponse.json({ success: true, total, page, limit, data: books });
}
