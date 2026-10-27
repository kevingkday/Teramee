import { NextRequest, NextResponse } from 'next/server';
import { getProfile, saveProfile } from '@/lib/db';
import { sanitizeAndScopeCss } from '@/lib/sanitize-css';
import { UserProfile } from '@/lib/types';
import { getAuthenticatedUser, hashPassword, generateSalt } from '@/lib/auth';

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
    let targetUsername = username.toLowerCase().trim();
    if (targetUsername === 'tom') targetUsername = 'kevin';

    // Verify session authentication
    const authUser = getAuthenticatedUser(request);
    if (!authUser || authUser.toLowerCase() !== targetUsername) {
      return NextResponse.json(
        { error: `Unauthorized: You must be logged in as @${targetUsername} to save changes.` },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid payload provided' },
        { status: 400 }
      );
    }

    const existing = getProfile(targetUsername);
    if (!existing) {
      return NextResponse.json(
        { error: `Profile '@${targetUsername}' not found to update.` },
        { status: 404 }
      );
    }

    // Optional password update
    let passwordHash = existing.passwordHash;
    let salt = existing.salt;
    if (body.newPassword && typeof body.newPassword === 'string' && body.newPassword.trim().length >= 4) {
      salt = generateSalt();
      passwordHash = hashPassword(body.newPassword.trim(), salt);
    }

    // Merge updates
    const toSave: UserProfile = {
      ...existing,
      ...body,
      username: existing.username, // Protect username identity
      passwordHash,
      salt
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
