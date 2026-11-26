import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      base: 'INR',
      rates: { INR: 1 },
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
      },
    }
  );
}
