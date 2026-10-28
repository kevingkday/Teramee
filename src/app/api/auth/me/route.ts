import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getProfile } from '@/lib/db';

export async function GET(request: NextRequest) {
  const username = getAuthenticatedUser(request);

  if (!username) {
    return NextResponse.json({
      authenticated: false,
      user: null
    });
  }

  const profile = getProfile(username);
  return NextResponse.json({
    authenticated: true,
    user: {
      username,
      email: profile?.email || (username.toLowerCase() === 'kevin' ? 'kevingkday@gmail.com' : ''),
      isAdmin: Boolean(profile?.isAdmin || username.toLowerCase() === 'kevin'),
      displayName: profile?.displayName || username,
      avatarUrl: profile?.avatarUrl || ''
    }
  });
}
