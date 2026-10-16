import React from 'react';
import Link from 'next/link';
import { PlatformNavbar } from '@/components/PlatformNavbar';
import {
  ShieldCheck,
  Sparkles,
  Palette,
  Terminal,
  Zap,
  Lock,
  ArrowRight,
  ExternalLink,
  Cpu,
  Layers,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <PlatformNavbar currentUsername="tom" />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950 -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Teramee: Express Yourself with Custom Profiles &amp; Music</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            User-Customizable Profiles <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
              Zero CSS Bleed. Bulletproof Security.
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Relive the glory days of expressive profile styling on Teramee with full theme token controls,
            YouTube/Spotify media players, and power-user scoped CSS — guaranteed never to
            break the host platform or navigation bar.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Claim Handle &amp; Sign Up Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/editor"
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2"
            >
              <Palette className="w-4 h-4 text-blue-400" />
              <span>Launch Customizer Studio</span>
            </Link>

            <Link
              href="/user/tom"
              className="px-5 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-sm border border-slate-800 transition-all flex items-center gap-2"
            >
              <span>Visit @tom</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* Architecture Deep Dive: Defense in Depth */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Two-Tier Sandbox Security Architecture
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            How we solve the historic MySpace vulnerability where user styles hijacked global login buttons, escape hatches, and site layouts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: CSS AST Sanitizer */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Terminal className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white">
              1. AST Sanitization Pipeline (css-tree)
            </h3>

            <p className="text-slate-400 text-sm leading-relaxed">
              Before user CSS is rendered, our AST pipeline parses the code into a syntax tree to rewrite selectors and sanitize declarations:
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <b>Selector Scoping:</b> Rewrites <code>body</code>, <code>html</code>, and arbitrary selectors strictly to <code>.profile-canvas</code>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <b>Position Fixed Defense:</b> Converts <code>position: fixed</code> to <code>position: absolute</code>, preventing UI escape hatch overlays.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <b>Strict @import Whitelist:</b> Strips unauthorized third-party trackers, permitting only approved Google Fonts CDNs.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <b>XSS Neutralization:</b> Purges legacy <code>expression()</code>, <code>behavior</code>, and <code>javascript:</code> URI vectors.
                </span>
              </li>
            </ul>
          </div>

          {/* Card 2: Isolated Iframe & Shadow DOM */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white">
              2. Sandboxed Iframe & postMessage
            </h3>

            <p className="text-slate-400 text-sm leading-relaxed">
              Physical boundary isolation guarantees that even unexpected browser layout bugs cannot bleed out into the platform:
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <b>Isolated Document Tree:</b> The iframe runs in its own document boundary, completely shielding the host navigation bar.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <b>Zero-Flicker postMessage Sync:</b> Updates tokens and CSS in real time at 60fps without jarring page reloads.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <b>Sandboxing Attribute:</b> Restricts top-level navigation, popups, and clickjacking attacks.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <b>Shadow DOM Mode Available:</b> Toggle between iframe sandboxing and Shadow DOM root encapsulation in the customizer.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Demo Profiles Showcase */}
        <div className="pt-8 space-y-6">
          <h2 className="text-xl font-bold text-white text-center">
            Explore Demo Profiles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Tom */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Tom"
                  className="w-14 h-14 rounded-lg object-cover border border-blue-500/40"
                />
                <div>
                  <h4 className="font-bold text-white">Tom (Classic 2006)</h4>
                  <p className="text-xs text-slate-400">@tom &bull; Everyone&apos;s first friend</p>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                    Classic Blue Preset
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Link
                  href="/user/tom"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold text-center transition-colors"
                >
                  View Profile
                </Link>
                <Link
                  href="/editor?user=tom"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold text-center transition-colors"
                >
                  Edit Theme
                </Link>
              </div>
            </div>

            {/* GlitterQueen */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="glitterqueen99"
                  className="w-14 h-14 rounded-lg object-cover border border-pink-500/40"
                />
                <div>
                  <h4 className="font-bold text-white">xX_Glitter_Star_Xx</h4>
                  <p className="text-xs text-slate-400">@glitterqueen99 &bull; Scene Queen</p>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-mono">
                    Scene Queen Preset
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Link
                  href="/user/glitterqueen99"
                  className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold text-center transition-colors"
                >
                  View Profile
                </Link>
                <Link
                  href="/editor?user=glitterqueen99"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold text-center transition-colors"
                >
                  Edit Theme
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>Teramee &bull; <a href="https://teramee.com" className="text-slate-400 hover:text-white underline">teramee.com</a> &bull; Express Yourself</p>
      </footer>
    </div>
  );
}
