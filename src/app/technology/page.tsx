import React from 'react';
import Link from 'next/link';
import { PlatformNavbar } from '@/components/PlatformNavbar';
import {
  ShieldCheck,
  Terminal,
  Lock,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
  Code2,
  FileCode2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export const metadata = {
  title: 'Technology & Security Architecture | Teramee',
  description: 'How Teramee enables full raw CSS customization with zero platform bleed and bulletproof browser sandboxing.',
};

export default function TechnologyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <PlatformNavbar currentUsername="kevin" />

      {/* Header */}
      <section className="relative overflow-hidden pt-16 pb-12 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/25 via-slate-950 to-slate-950 -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Two-Tier Defense-in-Depth Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
            How Teramee Solves <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
              The Historic CSS Bleed Dilemma
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            In the early 2000s, user-generated CSS brought unprecedented digital creativity — but also global layout
            breakage, clickjacking overlays, and code injection vulnerabilities. Here is how Teramee delivers total creative
            freedom with zero platform compromise.
          </p>

          <div className="pt-2 flex items-center justify-center gap-4">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              &larr; Back to Home
            </Link>
            <span className="text-slate-700">&bull;</span>
            <Link
              href="/editor"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              Test Live in Theme Studio &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Main Architecture Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* The Problem Statement */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">The Historical Failure of Raw User CSS</h2>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-300 text-sm leading-relaxed space-y-3">
            <p>
              When social sites like MySpace allowed users to write raw HTML and CSS into profile fields, the browser treated those styles
              as global rules. This created critical security and usability failures:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <li className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="font-semibold text-rose-400 text-xs font-mono uppercase tracking-wider">1. Global CSS Bleed</span>
                <p className="text-xs text-slate-400">
                  Styles like <code className="text-slate-300">body &#123; display: none &#125;</code> or <code className="text-slate-300">a &#123; color: white &#125;</code> hid host navigation bars, footers, and login controls.
                </p>
              </li>
              <li className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="font-semibold text-rose-400 text-xs font-mono uppercase tracking-wider">2. Clickjacking Overlays</span>
                <p className="text-xs text-slate-400">
                  Attackers set <code className="text-slate-300">position: fixed; z-index: 999999;</code> to create invisible full-viewport click traps or counterfeit login modals.
                </p>
              </li>
              <li className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="font-semibold text-rose-400 text-xs font-mono uppercase tracking-wider">3. Script Injection Vectors</span>
                <p className="text-xs text-slate-400">
                  Malicious users exploited legacy CSS behaviors like <code className="text-slate-300">expression()</code>, <code className="text-slate-300">-moz-binding</code>, and <code className="text-slate-300">javascript:</code> URLs.
                </p>
              </li>
            </ul>
          </div>
        </section>

        {/* The Two-Tier Sandbox Solution */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Teramee&apos;s Two-Tier Defense Model</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tier 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Terminal className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-white">
                Tier 1: AST Parsing & Rewriting (<code className="text-blue-400 text-sm">css-tree</code>)
              </h3>

              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Rather than using fragile regular expressions, Teramee parses user CSS into a real Abstract Syntax Tree.
                The AST walker traverses every node and enforces deterministic safety rules:
              </p>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <b>Strict Selector Scoping:</b> Roots like <code className="text-blue-300">body</code>, <code className="text-blue-300">html</code>, and <code className="text-blue-300">:root</code> are rewritten directly to <code className="text-blue-300">.profile-canvas</code>. All child selectors are automatically prepended.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <b>Containment Rewriting:</b> <code className="text-blue-300">position: fixed</code> is converted to <code className="text-blue-300">position: absolute</code>, bounding elements within the profile frame.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <b>Z-Index Clamping:</b> Any <code className="text-blue-300">z-index</code> exceeding 50 is clamped to guarantee host modals and navigation remain visible.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <b>Font CDN Whitelist:</b> External <code className="text-blue-300">@import</code> rules are restricted to trusted font CDNs (Google Fonts, Bunny, Typekit, CDNFonts).
                  </span>
                </li>
              </ul>
            </div>

            {/* Tier 2 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <Lock className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-white">
                Tier 2: Hardened Iframe Boundary & postMessage
              </h3>

              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Even with AST parsing, physical document boundary isolation ensures unexpected browser layout quirks
                never compromise the host environment:
              </p>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <b>Isolated Browsing Context:</b> Profiles run within an <code className="text-pink-300">&lt;iframe sandbox=&quot;...&quot;&gt;</code> container, insulating cookies and local storage.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <b>Live 60fps Synchronization:</b> Changes in the Theme Studio stream via postMessage directly into an injected style sheet for instant, zero-flicker live editing.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <b>HTML Sanitization:</b> Bios and guestbook blurbs pass through an aggressive HTML cleaner stripping event listeners and unapproved script tags.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <b>Shadow DOM Alternative:</b> The system can switch between hardened iframe sandboxing and web standard Shadow DOM encapsulation.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Live Security Inspector Teaser */}
        <section className="p-8 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Try the Live CSS Security Audit Inspector
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              Open the Theme Customizer Studio, paste arbitrary CSS rules into the raw code editor, and watch our AST engine
              inspect and report every rule rewritten, scoped, or blocked in real time.
            </p>
          </div>
          <Link
            href="/editor"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-500/20 whitespace-nowrap transition-transform hover:scale-105"
          >
            <span>Launch Theme Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>Teramee &bull; Built with Next.js App Router, CSS-Tree AST Engine & Hardened Sandboxing</p>
      </footer>
    </div>
  );
}
