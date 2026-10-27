import React from 'react';
import { INITIAL_PROFILES } from '@/lib/initial-profiles';
import { UserProfileView } from '@/components/UserProfileView';

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

export function generateStaticParams() {
  return Object.keys(INITIAL_PROFILES).map((username) => ({
    username
  }));
}

export async function generateMetadata({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const normalized = username.toLowerCase() === 'tom' ? 'kevin' : username.toLowerCase();
  const profile = INITIAL_PROFILES[normalized];

  if (!profile) {
    return { title: `@${username} | Teramee Profile` };
  }

  return {
    title: `${profile.displayName} (@${profile.username}) | Teramee`,
    description: profile.tagline || profile.headline || 'Customized retro user profile.'
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const normalized = username.toLowerCase() === 'tom' ? 'kevin' : username.toLowerCase();
  const initialProfile = INITIAL_PROFILES[normalized] || null;

  return <UserProfileView initialProfile={initialProfile} username={normalized} />;
}
