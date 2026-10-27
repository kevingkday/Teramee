import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getOrCreateProfile } from '@/lib/db';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { PlatformNavbar } from '@/components/PlatformNavbar';
import { ThemeEditor } from '@/components/ThemeEditor';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Theme Studio | Teramee Profile Customizer',
  description: 'Customize your personal Teramee profile with design tokens, retro patterns, and real-time scoped CSS.'
};

async function EditorContent({
  searchParams
}: {
  searchParams: Promise<{ user?: string; new?: string }>;
}) {
  const params = await searchParams;
  if (params.user?.toLowerCase() === 'tom') {
    redirect('/editor?user=kevin');
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const authenticatedUser = sessionCookie ? verifySessionToken(sessionCookie) : null;

  const isNew = params.new === 'true';
  const username = params.user || authenticatedUser || 'kevin';
  const profile = getOrCreateProfile(username);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col overflow-hidden">
      <PlatformNavbar currentUsername={username} />
      <main className="flex-1 overflow-hidden">
        <ThemeEditor initialProfile={profile} isClaimingNew={isNew} />
      </main>
    </div>
  );
}

export default async function EditorPage({
  searchParams
}: {
  searchParams: Promise<{ user?: string; new?: string }>;
}) {
  const params = await searchParams;
  if (params.user?.toLowerCase() === 'tom') {
    redirect('/editor?user=kevin');
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <div className="space-y-2 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 font-mono">Loading Teramee Theme Studio...</p>
          </div>
        </div>
      }
    >
      <EditorContent searchParams={searchParams} />
    </Suspense>
  );
}
