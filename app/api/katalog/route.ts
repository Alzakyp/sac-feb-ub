import { NextResponse } from 'next/server';
import { KATALOG_BUKU_DATA, DDC_CATEGORIES, BookRecord } from '@/lib/katalog-buku-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim().toLowerCase();
    const ddc = (searchParams.get('ddc') || 'ALL').trim().toUpperCase();
    const availableOnly = searchParams.get('availableOnly') === 'true';

    let results: BookRecord[] = [...KATALOG_BUKU_DATA];

    // Filter by DDC classification
    if (ddc && ddc !== 'ALL') {
      results = results.filter((book) => book.ddcCode === ddc);
    }

    // Filter by availability
    if (availableOnly) {
      results = results.filter((book) => book.isAvailable);
    }

    // Filter by search query keyword
    if (query) {
      results = results.filter((book) => {
        return (
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.isbn.toLowerCase().includes(query) ||
          book.callNumber.toLowerCase().includes(query) ||
          book.publisher.toLowerCase().includes(query) ||
          book.shelfLocation.toLowerCase().includes(query) ||
          book.synopsis.toLowerCase().includes(query)
        );
      });
    }

    return NextResponse.json({
      success: true,
      total: results.length,
      data: results,
      categories: DDC_CATEGORIES,
    });
  } catch (error) {
    console.error('Error fetching catalog books:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal memproses data katalog buku.',
      },
      { status: 500 }
    );
  }
}
