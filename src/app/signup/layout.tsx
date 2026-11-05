import type { Metadata } from 'next';
import { DEFAULT_SHARE_IMAGE, SITE_NAME } from '@/lib/seo';

const title = 'Claim Your Teramee Handle | Teramee';
const description =
  'Your handle reserves your permanent retro profile URL, unlocks your personal Theme Studio, and gives you full creative control over your space.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: '/signup',
    siteName: SITE_NAME,
    images: [DEFAULT_SHARE_IMAGE]
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/twitter-image']
  }
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
