'use client';

import React, { useEffect, useState } from 'react';
import { UserProfile } from '@/lib/types';
import { INITIAL_PROFILES } from '@/lib/initial-profiles';
import { sanitizeAndScopeCss } from '@/lib/sanitize-css';
import { PlatformNavbar } from '@/components/PlatformNavbar';
import { ProfileCanvas } from '@/components/ProfileCanvas';
import Link from 'next/link';
import { Palette, ShieldCheck, ArrowLeft, Lock } from 'lucide-react';

interface UserProfileViewProps {
  initialProfile: UserProfile | null;
  username: string;
}

export function UserProfileView({ initialProfile, username }: UserProfileViewProps) {
  const [effectiveUsername, setEffectiveUsername] = useState<string>(
    username.toLowerCase() === 'tom' ? 'kevin' : username.toLowerCase()
  );
  const [profile, setProfile] = useState<UserProfile | null>(
    initialProfile || INITIAL_PROFILES[effectiveUsername] || null
  );
  const [loading, setLoading] = useState<boolean>(!profile);
  const [error, setError] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/^\/user\/([^/]+)/);
      if (match && match[1]) {
        const pathUser = decodeURIComponent(match[1]).toLowerCase();
        const resolved = pathUser === 'tom' ? 'kevin' : pathUser;
        if (resolved !== effectiveUsername) {
          setEffectiveUsername(resolved);
          setProfile(INITIAL_PROFILES[resolved] || null);
        }
      }
    }
  }, [effectiveUsername]);

  useEffect(() => {
    let isCancelled = false;

    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isCancelled && data?.authenticated && data?.user?.username) {
          const viewer = data.user.username;
          setAuthUser(viewer);
          if (viewer.toLowerCase() !== effectiveUsername.toLowerCase()) {
            fetch(`/api/profiles/${encodeURIComponent(effectiveUsername)}/view`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                viewerUsername: viewer,
                viewerAvatarUrl: data.user.avatarUrl || ''
              })
            }).catch(() => {});
          }
        }
      })
      .catch(() => {});

    fetch(`/api/profiles/${encodeURIComponent(effectiveUsername)}`)
      .then((res) => {
        if (!res.ok) {
          if (INITIAL_PROFILES[effectiveUsername]) {
            return { profile: INITIAL_PROFILES[effectiveUsername] };
          }
          throw new Error(`Profile '@${effectiveUsername}' was not found.`);
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
          if (INITIAL_PROFILES[effectiveUsername]) {
            setProfile(INITIAL_PROFILES[effectiveUsername]);
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
  }, [effectiveUsername]);

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <PlatformNavbar currentUsername="kevin" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs text-slate-400 font-mono">Loading @{effectiveUsername}&apos;s profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <PlatformNavbar currentUsername="kevin" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <span className="text-3xl">🛸</span>
          </div>
          <h1 className="text-2xl font-black mb-2">Profile Not Found</h1>
          <p className="text-slate-400 text-sm max-w-md mb-6">
            The profile &ldquo;@{effectiveUsername}&rdquo; does not exist or may have been deleted into cyberspace.
          </p>
          <Link
            href="/user/kevin"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Visit Kevin&apos;s Profile (Everyone&apos;s Friend)
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = authUser?.toLowerCase() === profile.username.toLowerCase();
  const cssResult = sanitizeAndScopeCss(profile.rawCss || '');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <PlatformNavbar currentUsername={profile.username} />

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

        {isOwner ? (
          <Link
            href={`/editor?user=${profile.username}`}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Edit My Profile</span>
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            {profile.username.toLowerCase() !== 'kevin' ? (
              <Link
                href={`/editor?user=${profile.username}`}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition-colors border border-slate-700"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Owner Login</span>
              </Link>
            ) : (
              <Link
                href="/editor?user=glitterqueen99"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition-colors border border-slate-700"
              >
                <Palette className="w-3 h-3 text-pink-400" />
                <span>Try Demo Studio</span>
              </Link>
            )}
            <Link
              href="/signup"
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-semibold shadow-sm transition-all"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Claim Your Handle</span>
            </Link>
          </div>
        )}
      </div>

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
