import { NextRequest, NextResponse } from 'next/server';
import { getProfile } from '@/lib/db';
import { INITIAL_PROFILES } from '@/lib/initial-profiles';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('username') || '';
  const normalized = raw.toLowerCase().trim();

  if (!normalized || normalized.length < 3) {
    return NextResponse.json({
      available: false,
      normalized,
      reason: 'Handle must be at least 3 characters.'
    });
  }

  if (normalized.length > 24) {
    return NextResponse.json({
      available: false,
      normalized,
      reason: 'Handle cannot exceed 24 characters.'
    });
  }

  if (!/^[a-z0-9_]+$/.test(normalized)) {
    return NextResponse.json({
      available: false,
      normalized,
      reason: 'Only letters, numbers, and underscores are allowed.'
    });
  }

  const reserved = [
    'admin',
    'api',
    'editor',
    'login',
    'signup',
    'user',
    'sandbox-frame',
    'settings',
    'technology',
    'teramee',
    'root',
    'support'
  ];
  if (reserved.includes(normalized)) {
    return NextResponse.json({
      available: false,
      normalized,
      reason: `@${normalized} is a reserved platform handle.`
    });
  }

  if (INITIAL_PROFILES[normalized] || getProfile(normalized)) {
    return NextResponse.json({
      available: false,
      normalized,
      reason: `@${normalized} is already claimed by another member.`
    });
  }

  return NextResponse.json({
    available: true,
    normalized,
    reason: `@${normalized} is available! Claim it below.`
  });
}
