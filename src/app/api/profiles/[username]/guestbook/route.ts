import { NextRequest, NextResponse } from 'next/server';
import { addGuestbookComment } from '@/lib/db';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;

  try {
    const body = await request.json();
    const { author, content, avatarUrl } = body || {};

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required.' },
        { status: 400 }
      );
    }

    const entry = addGuestbookComment(username, author || 'Anonymous Visitor', content, avatarUrl);

    if (!entry) {
      return NextResponse.json(
        { error: `User '@${username}' was not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      entry
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to add guestbook comment: ${message}` },
      { status: 500 }
    );
  }
}
