import { NextRequest, NextResponse } from 'next/server';
import { getProfileWidgets } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    const widgets = await getProfileWidgets(username);
    return NextResponse.json({ widgets });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to load profile widgets: ${message}` },
      { status: 500 }
    );
  }
}

