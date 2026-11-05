import { ImageResponse } from 'next/og';
import { INITIAL_PROFILES } from '@/lib/initial-profiles';
import { OG_SIZE, shareCardFromProfile, type ShareCard } from '@/lib/seo';
import { ProfileShareImage } from '@/lib/share-image';

export const alt = 'Teramee profile';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';

export function generateStaticParams() {
  return Object.keys(INITIAL_PROFILES).map((username) => ({ username }));
}

function cardForUsername(username: string): ShareCard {
  const normalized = username.toLowerCase() === 'tom' ? 'kevin' : username.toLowerCase();
  const profile = INITIAL_PROFILES[normalized];
  if (profile) return shareCardFromProfile(profile);
  return {
    username: normalized,
    displayName: normalized,
    title: `@${normalized} | Teramee`,
    description: 'A customized profile on Teramee.',
    imageDescription: 'A customized profile on Teramee.',
    backgroundColor: '#020617',
    headerColor: '#003366',
    accentColor: '#22d3ee',
    cardColor: '#0f172a',
    textColor: '#f8fafc',
    updatedAt: ''
  };
}

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return new ImageResponse(<ProfileShareImage card={cardForUsername(username)} />, { ...size });
}
