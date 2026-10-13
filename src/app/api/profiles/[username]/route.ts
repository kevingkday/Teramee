import { NextRequest, NextResponse } from 'next/server';
import { getProfile, saveProfile } from '@/lib/db';
import { sanitizeAndScopeCss } from '@/lib/sanitize-css';
import { UserProfile } from '@/lib/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;
  const profile = getProfile(username);

  if (!profile) {
    return NextResponse.json(
      { error: `Profile '@${username}' was not found.` },
      { status: 404 }
    );
  }

  // Pre-calculate sanitized CSS for instant safe delivery
  const cssResult = sanitizeAndScopeCss(profile.rawCss || '');

  return NextResponse.json({
    profile,
    sanitizedCss: cssResult.sanitizedCss,
    cssAudit: cssResult
  });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;

  try {
    const body = await request.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid payload provided' },
        { status: 400 }
      );
    }

    const existing = getProfile(username);
    if (!existing) {
      return NextResponse.json(
        { error: `Profile '@${username}' not found to update.` },
        { status: 404 }
      );
    }

    // Merge updates
    const toSave: UserProfile = {
      ...existing,
      ...body,
      username: existing.username // Protect username identity
    };

    const saved = saveProfile(toSave);
    const cssResult = sanitizeAndScopeCss(saved.rawCss || '');

    return NextResponse.json({
      success: true,
      profile: saved,
      sanitizedCss: cssResult.sanitizedCss,
      cssAudit: cssResult
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to save profile: ${message}` },
      { status: 500 }
    );
  }
}
