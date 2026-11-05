import type { Metadata } from 'next';
import { UserProfileView } from '@/components/UserProfileView';

export const metadata: Metadata = {
  title: 'Teramee Profile',
  description: 'A customized profile on Teramee.',
  robots: { index: false, follow: false }
};

/**
 * Static HTML shell for members who signed up after the last export.
 * The worker serves this document at `/user/:handle` and `/@:handle`
 * only when that profile exists, then rewrites the head tags.
 */
export default function ProfileShellPage() {
  return <UserProfileView initialProfile={null} username="" />;
}
