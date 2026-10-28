import { NextRequest, NextResponse } from 'next/server';
import {
  isUserAdmin,
  getAdminDashboardData,
  getProfile,
  saveProfile,
  adminDeleteUser,
  deleteGuestbookComment,
  adminDeleteActivity
} from '@/lib/db';
import { getAuthenticatedUser, generateSalt, hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authUser = getAuthenticatedUser(request);
  if (!authUser || !isUserAdmin(authUser)) {
    return NextResponse.json(
      { error: 'Admin access required. Please sign in as @kevin or a platform administrator.' },
      { status: 403 }
    );
  }

  const dashboard = getAdminDashboardData();
  return NextResponse.json({
    adminUser: authUser,
    ...dashboard
  });
}

export async function PUT(request: NextRequest) {
  const authUser = getAuthenticatedUser(request);
  if (!authUser || !isUserAdmin(authUser)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      username?: string;
      email?: string;
      isAdmin?: boolean;
      newPassword?: string;
      displayName?: string;
    };

    if (!body.username) {
      return NextResponse.json({ error: 'Target username is required.' }, { status: 400 });
    }

    const clean = body.username.toLowerCase().trim();
    const existing = getProfile(clean);
    if (!existing) {
      return NextResponse.json({ error: `User @${clean} not found.` }, { status: 404 });
    }

    const updated = { ...existing };

    if (body.email !== undefined) {
      const cleanEmail = body.email.trim().toLowerCase();
      if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return NextResponse.json({ error: 'Invalid email address format.' }, { status: 400 });
      }
      updated.email = cleanEmail;
    }

    if (body.isAdmin !== undefined && clean !== 'kevin') {
      updated.isAdmin = Boolean(body.isAdmin);
    }

    if (body.displayName !== undefined && body.displayName.trim()) {
      updated.displayName = body.displayName.trim();
    }

    if (body.newPassword && body.newPassword.trim()) {
      if (body.newPassword.trim().length < 4) {
        return NextResponse.json(
          { error: 'Password must be at least 4 characters.' },
          { status: 400 }
        );
      }
      const salt = generateSalt();
      updated.salt = salt;
      updated.passwordHash = hashPassword(body.newPassword.trim(), salt);
    }

    saveProfile(updated);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Admin update error: ${message}` }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authUser = getAuthenticatedUser(request);
  if (!authUser || !isUserAdmin(authUser)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const actionType = searchParams.get('type') || '';

  if (actionType === 'user') {
    const targetUser = searchParams.get('username') || '';
    if (!targetUser) {
      return NextResponse.json({ error: 'Username is required.' }, { status: 400 });
    }
    const res = adminDeleteUser(targetUser);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  }

  if (actionType === 'comment') {
    const profileUser = searchParams.get('username') || '';
    const commentId = searchParams.get('id') || '';
    if (!profileUser || !commentId) {
      return NextResponse.json(
        { error: 'Profile username and comment id are required.' },
        { status: 400 }
      );
    }
    deleteGuestbookComment(profileUser, commentId);
    return NextResponse.json({ success: true });
  }

  if (actionType === 'activity') {
    const activityId = searchParams.get('id') || '';
    if (!activityId) {
      return NextResponse.json({ error: 'Activity ID is required.' }, { status: 400 });
    }
    adminDeleteActivity(activityId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid delete type.' }, { status: 400 });
}
