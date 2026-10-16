'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PlatformNavbar } from '@/components/PlatformNavbar';
import { ThemeEditor } from '@/components/ThemeEditor';
import { UserProfile } from '@/lib/types';
import { INITIAL_PROFILES } from '@/lib/initial-profiles';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function EditorContent() {
  const searchParams = useSearchParams();
  const username = (searchParams.get('user') || 'tom').toLowerCase();
  
  // Start with known fallback if available to prevent flash
  const fallbackProfile = INITIAL_PROFILES[username] || INITIAL_PROFILES.tom;
  const [profile, setProfile] = useState<UserProfile>(fallbackProfile);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    fetch(`/api/profiles/${encodeURIComponent(username)}`)
      .then((res) => {
        if (!res.ok) {
          // If not in database yet, check if we have initial seed
          if (INITIAL_PROFILES[username]) {
            return { profile: INITIAL_PROFILES[username] };
          }
          throw new Error(`Profile '@${username}' was not found.`);
        }
        return res.json();
      })
      .then((data) => {
        if (!isCancelled && data?.profile) {
          setProfile(data.profile);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          if (INITIAL_PROFILES[username]) {
            setProfile(INITIAL_PROFILES[username]);
            setError(null);
          } else {
            setError(err instanceof Error ? err.message : String(err));
          }
        }
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [username]);

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <PlatformNavbar currentUsername="tom" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-black mb-2">Profile Not Found</h1>
          <p className="text-slate-400 text-sm max-w-md mb-6">{error}</p>
          <Link
            href="/editor?user=tom"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Customize Tom&apos;s Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col overflow-hidden">
      <PlatformNavbar currentUsername={username} />
      <main className="flex-1 overflow-hidden">
        {loading && (
          <div className="bg-blue-600/20 text-blue-300 text-[11px] py-1 px-4 text-center border-b border-blue-500/30 flex items-center justify-center gap-2">
            <span className="inline-block w-2.5 h-2.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
            <span>Syncing latest profile state with Cloudflare D1...</span>
          </div>
        )}
        <ThemeEditor initialProfile={profile} />
      </main>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <div className="space-y-2 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 font-mono">Loading Teramee Customizer Studio...</p>
          </div>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
