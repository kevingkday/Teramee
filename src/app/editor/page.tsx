import React, { Suspense } from 'react';
import { getProfile } from '@/lib/db';
import { PlatformNavbar } from '@/components/PlatformNavbar';
import { ThemeEditor } from '@/components/ThemeEditor';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'SpaceMy Customizer Studio | Scoped Profile Theme Editor',
  description: 'Customize retro MySpace profiles with real-time CSS AST sanitization and sandboxed iframe isolation.'
};

async function EditorContent({
  searchParams
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const { user } = await searchParams;
  const username = user || 'tom';
  const profile = getProfile(username);

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col overflow-hidden">
      <PlatformNavbar currentUsername={username} />
      <main className="flex-1 overflow-hidden">
        <ThemeEditor initialProfile={profile} />
      </main>
    </div>
  );
}

export default function EditorPage({
  searchParams
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <div className="space-y-2 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 font-mono">Loading SpaceMy Customizer Studio...</p>
          </div>
        </div>
      }
    >
      <EditorContent searchParams={searchParams} />
    </Suspense>
  );
}
