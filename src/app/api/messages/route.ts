import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getMessages, getUnreadMessageCount, sendMessage, markMessageRead, getProfile } from '@/lib/db';

export async function GET(request: NextRequest) {
  const authUser = getAuthenticatedUser(request);

  if (!authUser) {
    return NextResponse.json(
      { error: 'You must be logged in to view messages.' },
      { status: 401 }
    );
  }

  const messages = getMessages(authUser);
  const unreadCount = getUnreadMessageCount(authUser);

  return NextResponse.json({
    messages,
    unreadCount
  });
}

export async function POST(request: NextRequest) {
  const authUser = getAuthenticatedUser(request);

  if (!authUser) {
    return NextResponse.json(
      { error: 'You must be logged in to send messages.' },
      { status: 401 }
    );
  }

  try {
    const { toUsername, subject, body } = await request.json();

    if (!toUsername || !body || !body.trim()) {
      return NextResponse.json(
        { error: 'Recipient and message body are required.' },
        { status: 400 }
      );
    }

    const recipient = getProfile(toUsername);
    if (!recipient) {
      return NextResponse.json(
        { error: `User '@${toUsername}' does not exist.` },
        { status: 404 }
      );
    }

    const message = sendMessage(authUser, toUsername, subject || 'No Subject', body);

    return NextResponse.json({
      success: true,
      message
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to send message: ${msg}` },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const authUser = getAuthenticatedUser(request);

  if (!authUser) {
    return NextResponse.json(
      { error: 'Unauthorized.' },
      { status: 401 }
    );
  }

  try {
    const { messageId } = await request.json();
    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required.' }, { status: 400 });
    }

    const success = markMessageRead(authUser, messageId);
    return NextResponse.json({ success });
  } catch {
    return NextResponse.json({ error: 'Failed to update message.' }, { status: 500 });
  }
}
