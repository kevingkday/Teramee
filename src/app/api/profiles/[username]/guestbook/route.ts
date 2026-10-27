import { NextRequest, NextResponse } from 'next/server';
import { addGuestbookComment, deleteGuestbookComment } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;

  try {
    const body = await request.json();
    const { author, content, avatarUrl } = body || {};
    const authUser = getAuthenticatedUser(request) || body.username;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required.' },
        { status: 400 }
      );
    }

    const entry = addGuestbookComment(
      username,
      author || 'Anonymous Visitor',
      content,
      avatarUrl,
      authUser || undefined
    );

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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;
  const authUser = getAuthenticatedUser(request);

  if (!authUser || authUser.toLowerCase() !== username.toLowerCase()) {
    return NextResponse.json(
      { error: 'Unauthorized: Only the profile owner can remove comments.' },
      { status: 401 }
    );
  }

  try {
    const { commentId } = await request.json();
    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required.' }, { status: 400 });
    }

    const deleted = deleteGuestbookComment(username, commentId);
    return NextResponse.json({ success: deleted });
  } catch {
    return NextResponse.json({ error: 'Failed to delete comment.' }, { status: 500 });
  }
}
