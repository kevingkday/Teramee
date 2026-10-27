import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { toggleFavorite, checkIsFavorite } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;
  const authUser = getAuthenticatedUser(request);

  if (!authUser) {
    return NextResponse.json({ isFavorite: false });
  }

  const isFav = checkIsFavorite(authUser, username);
  return NextResponse.json({ isFavorite: isFav });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;
  const authUser = getAuthenticatedUser(request);

  if (!authUser) {
    return NextResponse.json(
      { error: 'You must be logged in to favorite profiles.' },
      { status: 401 }
    );
  }

  const favorited = toggleFavorite(authUser, username);
  return NextResponse.json({
    success: true,
    isFavorite: favorited
  });
}
