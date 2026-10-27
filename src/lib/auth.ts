import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const AUTH_COOKIE_NAME = 'teramee_session';
const AUTH_SECRET = process.env.AUTH_SECRET || 'teramee-retro-social-edge-secret-key-2026';
const TOKEN_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

export function createSessionToken(username: string): string {
  const timestamp = Date.now().toString();
  const payload = `${username.toLowerCase().trim()}.${timestamp}`;
  const hmac = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

export function verifySessionToken(token: string): string | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [username, timestamp, signature] = parts;
  const payload = `${username}.${timestamp}`;
  const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');

  try {
    const match = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSig, 'hex')
    );
    if (!match) return null;

    // Check expiry
    const tokenTime = parseInt(timestamp, 10);
    if (isNaN(tokenTime) || Date.now() - tokenTime > TOKEN_MAX_AGE_SECONDS * 1000) {
      return null;
    }

    return username;
  } catch {
    return null;
  }
}

export function getAuthenticatedUser(request: NextRequest): string | null {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);
  if (!cookie?.value) return null;
  return verifySessionToken(cookie.value);
}

export function setSessionCookie(response: NextResponse, username: string) {
  const token = createSessionToken(username);
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: TOKEN_MAX_AGE_SECONDS,
    path: '/'
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/'
  });
}
