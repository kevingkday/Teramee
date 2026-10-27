import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { toggleFriendship, checkIsFriend } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;
  const authUser = getAuthenticatedUser(request);

  if (!authUser) {
    return NextResponse.json({ isFriend: false });
  }

  const isFriend = checkIsFriend(authUser, username);
  return NextResponse.json({ isFriend });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;
  const authUser = getAuthenticatedUser(request);

  if (!authUser) {
    return NextResponse.json(
      { error: 'You must be logged in to add friends.' },
      { status: 401 }
    );
  }

  if (authUser.toLowerCase() === username.toLowerCase()) {
    return NextResponse.json(
      { error: 'You cannot add yourself as a friend.' },
      { status: 400 }
    );
  }

  const result = toggleFriendship(authUser, username);
  return NextResponse.json({
    success: true,
    isFriend: result.isFriend,
    friendCount: result.friendCount
  });
}
