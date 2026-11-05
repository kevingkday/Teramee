import type { Metadata } from 'next';
import { DEFAULT_SHARE_IMAGE, SITE_NAME } from '@/lib/seo';

const title = 'Log In to Your Space | Teramee';
const description = 'Enter your handle and password to customize your retro Teramee profile.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: '/login',
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

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
