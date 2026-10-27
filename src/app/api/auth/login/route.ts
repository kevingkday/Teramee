import { NextRequest, NextResponse } from 'next/server';
import { getProfile, saveProfile } from '@/lib/db';
import { verifyPassword, hashPassword, generateSalt, setSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    let cleanUsername = username.toLowerCase().trim();
    if (cleanUsername === 'tom') cleanUsername = 'kevin';

    const profile = getProfile(cleanUsername);
    if (!profile) {
      return NextResponse.json(
        { error: `User '@${cleanUsername}' does not exist.` },
        { status: 404 }
      );
    }

    // If profile has no password set yet, claim/set it now
    if (!profile.passwordHash || !profile.salt) {
      const salt = generateSalt();
      const passwordHash = hashPassword(password, salt);
      saveProfile({
        ...profile,
        passwordHash,
        salt
      });

      const res = NextResponse.json({
        success: true,
        username: profile.username,
        message: 'Password initialized successfully.'
      });
      setSessionCookie(res, profile.username);
      return res;
    }

    const isValid = verifyPassword(password, profile.passwordHash, profile.salt);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Incorrect password. Try again!' },
        { status: 401 }
      );
    }

    const res = NextResponse.json({
      success: true,
      username: profile.username,
      message: 'Logged in successfully.'
    });
    setSessionCookie(res, profile.username);
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Authentication failed: ${message}` },
      { status: 500 }
    );
  }
}
