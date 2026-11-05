import React from 'react';
import type { Metadata } from 'next';
import { INITIAL_PROFILES } from '@/lib/initial-profiles';
import { SITE_NAME, shareCardFromProfile } from '@/lib/seo';
import { UserProfileView } from '@/components/UserProfileView';

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

export function generateStaticParams() {
  return Object.keys(INITIAL_PROFILES).map((username) => ({
    username
  }));
}

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const normalized = username.toLowerCase() === 'tom' ? 'kevin' : username.toLowerCase();
  const profile = INITIAL_PROFILES[normalized];

  if (!profile) {
    return {
      title: `@${username} | Teramee`,
      description: 'This Teramee profile could not be found.',
      robots: { index: false, follow: false }
    };
  }

  const card = shareCardFromProfile(profile);
  const path = `/user/${profile.username}`;
  return {
    title: card.title,
    description: card.description,
    alternates: { canonical: path },
    openGraph: {
      type: 'profile',
      title: card.title,
      description: card.description,
      url: path,
      siteName: SITE_NAME,
      username: profile.username
    },
    twitter: {
      card: 'summary_large_image',
      title: card.title,
      description: card.description
    }
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const normalized = username.toLowerCase() === 'tom' ? 'kevin' : username.toLowerCase();
  const initialProfile = INITIAL_PROFILES[normalized] || null;

  return <UserProfileView initialProfile={initialProfile} username={normalized} />;
}
