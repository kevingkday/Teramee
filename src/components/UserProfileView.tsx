'use client';

import React, { useEffect, useState } from 'react';
import { UserProfile } from '@/lib/types';
import { sanitizeAndScopeCss } from '@/lib/sanitize-css';
import { PlatformNavbar } from '@/components/PlatformNavbar';
import { ProfileCanvas } from '@/components/ProfileCanvas';
import Link from 'next/link';
import { Palette, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';

interface UserProfileViewProps {
  initialProfile: UserProfile | null;
  username: string;
}

export function UserProfileView({ initialProfile, username }: UserProfileViewProps) {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [loading, setLoading] = useState<boolean>(!initialProfile);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    // Fetch latest profile state from Cloudflare D1
    fetch(`/api/profiles/${encodeURIComponent(username.toLowerCase())}`)
      .then((res) => {
        if (!res.ok) {
          if (initialProfile) return { profile: initialProfile };
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
          if (!initialProfile) {
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
  }, [username, initialProfile]);

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <PlatformNavbar currentUsername="tom" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs text-slate-400 font-mono">Loading @{username}&apos;s profile from D1...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <PlatformNavbar currentUsername="tom" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <span className="text-3xl">🛸</span>
          </div>
          <h1 className="text-2xl font-black mb-2">Profile Not Found</h1>
          <p className="text-slate-400 text-sm max-w-md mb-6">
            The profile &ldquo;@{username}&rdquo; does not exist or may have been deleted into cyberspace.
          </p>
          <Link
            href="/user/tom"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Visit Tom&apos;s Profile (Everyone&apos;s Friend)
          </Link>
        </div>
      </div>
    );
  }

  // Scoped CSS calculation
  const cssResult = sanitizeAndScopeCss(profile.rawCss || '');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Platform Navigation Bar - Platform Escape Hatch */}
      <PlatformNavbar currentUsername={profile.username} />

      {/* Floating Fast Action / Safety Banner */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 text-xs flex items-center justify-between text-slate-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            Viewing Public Profile: <b className="text-white">@{profile.username}</b>
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400 font-mono text-[11px]">
            CSS Scope: <code className="text-emerald-400">.profile-canvas</code> ({cssResult.stats.scopedRuleCount} rules scoped)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/editor?user=${profile.username}`}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm transition-colors"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Customize Profile</span>
          </Link>
        </div>
      </div>

      {/* Sandboxed Profile Canvas Container */}
      <main className="flex-1 w-full overflow-x-hidden">
        <ProfileCanvas
          profile={profile}
          sanitizedCss={cssResult.sanitizedCss}
          isInsideIframe={false}
        />
      </main>
    </div>
  );
}
