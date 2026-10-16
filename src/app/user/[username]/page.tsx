import React from 'react';
import { INITIAL_PROFILES } from '@/lib/initial-profiles';
import { UserProfileView } from '@/components/UserProfileView';

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

export function generateStaticParams() {
  return [
    { username: 'tom' },
    { username: 'glitterqueen99' }
  ];
}

export async function generateMetadata({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const normalized = username.toLowerCase();
  const profile = INITIAL_PROFILES[normalized];

  if (!profile) {
    return { title: `@${username} | Teramee Profile` };
  }

  return {
    title: `${profile.displayName} (@${profile.username}) | Teramee Profile`,
    description: profile.tagline || profile.headline || 'Customized retro user profile.'
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const normalized = username.toLowerCase();
  const initialProfile = INITIAL_PROFILES[normalized] || null;

  return <UserProfileView initialProfile={initialProfile} username={username} />;
}
