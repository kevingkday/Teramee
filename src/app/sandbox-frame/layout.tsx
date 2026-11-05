import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sandbox | Teramee',
  robots: { index: false, follow: false }
};

export default function SandboxFrameLayout({ children }: { children: React.ReactNode }) {
  return children;
}
