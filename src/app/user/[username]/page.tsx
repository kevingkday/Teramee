import React from 'react';
import { notFound } from 'next/navigation';
import { getProfile } from '@/lib/db';
import { sanitizeAndScopeCss } from '@/lib/sanitize-css';
import { PlatformNavbar } from '@/components/PlatformNavbar';
import { ProfileCanvas } from '@/components/ProfileCanvas';
import Link from 'next/link';
import { Palette, ShieldCheck, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const profile = getProfile(username);
  if (!profile) {
    return { title: 'User Not Found | SpaceMy' };
  }
  return {
    title: `${profile.displayName} (@${profile.username}) | SpaceMy Profile`,
    description: profile.tagline || profile.headline || 'Customized retro user profile.'
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const profile = getProfile(username);

  if (!profile) {
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

  // Server-side CSS sanitization and containment scoping
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

        <Link
          href={`/editor?user=${profile.username}`}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm transition-colors"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Customize Profile</span>
        </Link>
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
