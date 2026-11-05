import type { Metadata } from 'next';
import Link from 'next/link';
import { PlatformNavbar } from '@/components/PlatformNavbar';
import { NotFoundCopy } from '@/components/NotFoundCopy';

export const metadata: Metadata = {
  title: '404 | Teramee',
  description: 'That page is not on Teramee.',
  robots: { index: false, follow: false }
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <PlatformNavbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl overflow-hidden border-2 border-cyan-300 bg-slate-900 shadow-[10px_10px_0_#ff2bd6]">
          <div className="flex items-center justify-between bg-gradient-to-r from-fuchsia-600 via-pink-500 to-cyan-400 px-3 py-2 font-mono text-[11px] font-bold text-white">
            <span>C:\TERAMEE\404.HTML</span>
            <span className="flex gap-1">
              <span className="inline-block h-3 w-3 border border-white/70 bg-yellow-300" />
              <span className="inline-block h-3 w-3 border border-white/70 bg-emerald-400" />
              <span className="inline-block h-3 w-3 border border-white/70 bg-rose-500" />
            </span>
          </div>
          <div
            className="px-8 py-10 text-center"
            style={{
              backgroundImage:
                'radial-gradient(circle at 12% 20%, rgba(255,43,214,0.16), transparent 28%), radial-gradient(circle at 88% 10%, rgba(34,211,238,0.16), transparent 26%)'
            }}
          >
            <p className="font-mono text-xs tracking-[0.35em] text-cyan-300">ERROR 404</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Lost in cyberspace</h1>
            <NotFoundCopy />
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-[3px_3px_0_#fff] transition-transform hover:-translate-y-0.5"
              >
                Back to Teramee
              </Link>
              <Link
                href="/signup"
                className="border border-pink-400 px-4 py-2 text-xs font-bold text-pink-300 transition-colors hover:bg-pink-500/10"
              >
                Claim a handle
              </Link>
              <Link
                href="/user/sarah"
                className="border border-slate-600 px-4 py-2 font-mono text-xs text-slate-300 transition-colors hover:border-slate-400 hover:text-white"
              >
                Visit @sarah
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
