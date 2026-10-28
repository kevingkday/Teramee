import { NextRequest, NextResponse } from 'next/server';
import { getProfile, saveProfile, getOrCreateProfile } from '@/lib/db';
import { hashPassword, generateSalt, setSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, displayName } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
    if (cleanUsername.length < 2) {
      return NextResponse.json(
        { error: 'Username must be at least 2 characters.' },
        { status: 400 }
      );
    }

    const existing = getProfile(cleanUsername);
    if (existing && existing.passwordHash) {
      return NextResponse.json(
        { error: `The handle '@${cleanUsername}' is already registered. Please log in instead.` },
        { status: 409 }
      );
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    const baseProfile = getOrCreateProfile(cleanUsername);
    const updated = saveProfile({
      ...baseProfile,
      email: cleanEmail,
      displayName: displayName?.trim() || cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
      passwordHash,
      salt
    });

    const res = NextResponse.json({
      success: true,
      username: updated.username,
      message: 'Account created and profile reserved!'
    });
    setSessionCookie(res, updated.username);
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Registration failed: ${message}` },
      { status: 500 }
    );
  }
}
