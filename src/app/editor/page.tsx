'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PlatformNavbar } from '@/components/PlatformNavbar';
import { ThemeEditor } from '@/components/ThemeEditor';
import { UserProfile } from '@/lib/types';
import { INITIAL_PROFILES } from '@/lib/initial-profiles';

function createFallbackProfile(username: string): UserProfile {
  const clean = username.toLowerCase().trim() || 'kevin';
  if (INITIAL_PROFILES[clean]) {
    return INITIAL_PROFILES[clean];
  }
  return {
    ...INITIAL_PROFILES.kevin,
    username: clean,
    displayName: clean.charAt(0).toUpperCase() + clean.slice(1),
    headline: `${clean} just joined Teramee!`,
    tagline: 'Customizing my space...',
    guestbook: [],
    updatedAt: new Date().toISOString()
  };
}

function EditorContent() {
  const searchParams = useSearchParams();
  const rawUserParam = searchParams.get('user');
  const isNew = searchParams.get('new') === 'true';

  const initialHandle =
    !rawUserParam || rawUserParam.toLowerCase() === 'tom'
      ? 'kevin'
      : rawUserParam.toLowerCase();

  const [username, setUsername] = useState<string>(initialHandle);
  const [profile, setProfile] = useState<UserProfile>(() => createFallbackProfile(initialHandle));
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const nextUser =
      !rawUserParam || rawUserParam.toLowerCase() === 'tom'
        ? null
        : rawUserParam.toLowerCase();

    if (nextUser) {
      setUsername(nextUser);
      setProfile(createFallbackProfile(nextUser));
    } else {
      fetch('/api/auth/me')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const resolved = data?.authenticated && data?.user?.username ? data.user.username.toLowerCase() : 'kevin';
          setUsername(resolved);
          setProfile(createFallbackProfile(resolved));
        })
        .catch(() => {});
    }
  }, [rawUserParam]);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    fetch(`/api/profiles/${encodeURIComponent(username)}`)
      .then((res) => {
        if (!res.ok) {
          return { profile: createFallbackProfile(username) };
        }
        return res.json();
      })
      .then((data) => {
        if (!isCancelled && data?.profile) {
          setProfile(data.profile);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setProfile(createFallbackProfile(username));
        }
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [username]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col overflow-hidden">
      <PlatformNavbar currentUsername={username} />
      <main className="flex-1 overflow-hidden">
        {loading && (
          <div className="bg-blue-600/20 text-blue-300 text-[11px] py-1 px-4 text-center border-b border-blue-500/30 flex items-center justify-center gap-2">
            <span className="inline-block w-2.5 h-2.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
            <span>Syncing latest profile state...</span>
          </div>
        )}
        <ThemeEditor key={profile.username} initialProfile={profile} isClaimingNew={isNew} />
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
            <p className="text-xs text-slate-400 font-mono">Loading Teramee Theme Studio...</p>
          </div>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
