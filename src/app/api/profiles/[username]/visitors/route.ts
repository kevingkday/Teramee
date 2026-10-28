import { NextRequest, NextResponse } from 'next/server';
import { getRecentVisitors } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    const visitors = getRecentVisitors(username, 8);
    return NextResponse.json({ visitors });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to fetch recent visitors: ${message}` },
      { status: 500 }
    );
  }
}

