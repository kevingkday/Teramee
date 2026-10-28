import { NextRequest, NextResponse } from 'next/server';
import { recordProfileView } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    let viewerUsername = getAuthenticatedUser(request);
    let viewerAvatarUrl: string | undefined;

    if (!viewerUsername) {
      try {
        const body = await request.json();
        if (body?.viewerUsername) {
          viewerUsername = body.viewerUsername;
          viewerAvatarUrl = body.viewerAvatarUrl;
        }
      } catch {
        // Ignore empty body
      }
    }

    if (!viewerUsername) {
      return NextResponse.json({ recorded: false, reason: 'Unauthenticated visitor' });
    }

    const result = recordProfileView(username, viewerUsername, viewerAvatarUrl);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to record profile view: ${message}` },
      { status: 500 }
    );
  }
}

