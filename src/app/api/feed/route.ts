import { NextRequest, NextResponse } from 'next/server';
import { getGlobalFeed } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const limitParam = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);
    const cursor = request.nextUrl.searchParams.get('cursor') || undefined;
    const username = request.nextUrl.searchParams.get('username') || undefined;

    const result = getGlobalFeed(
      Number.isNaN(limitParam) ? 20 : limitParam,
      cursor,
      username
    );

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to fetch activity feed: ${message}` },
      { status: 500 }
    );
  }
}

