'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Sparkles, User, Palette, ExternalLink } from 'lucide-react';

interface PlatformNavbarProps {
  currentUsername?: string;
  onSelectUser?: (username: string) => void;
}

export function PlatformNavbar({
  currentUsername = 'tom',
  onSelectUser
}: PlatformNavbarProps) {
  const pathname = usePathname();

  return (
    <header
      id="platform-navbar"
      className="sticky top-0 z-[100] w-full border-b border-slate-700 bg-slate-900/95 backdrop-blur-md text-white shadow-lg transition-colors"
      style={{
        // Host UI defense: fixed platform isolation styles that cannot be inherited
        isolation: 'isolate',
        pointerEvents: 'auto'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand logo & nostalgic flair */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                SpaceMy
              </span>
              <span className="text-xs ml-2 px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                v2006.PRO
              </span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/editor"
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                pathname.startsWith('/editor')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Palette className="w-4 h-4" />
              Theme Customizer
            </Link>

            <Link
              href={`/user/${currentUsername}`}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                pathname.startsWith('/user')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              Public Profile
            </Link>
          </nav>
        </div>

        {/* Right side controls: Profile Switcher & Sandbox Defense Shield */}
        <div className="flex items-center gap-3">
          {onSelectUser && (
            <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400 font-mono">Profile:</span>
              <select
                value={currentUsername}
                onChange={(e) => onSelectUser(e.target.value)}
                aria-label="Switch User Profile"
                className="bg-transparent text-xs font-semibold text-blue-300 focus:outline-none cursor-pointer"
              >
                <option value="tom" className="bg-slate-800 text-white">Tom (Classic 2006)</option>
                <option value="glitterqueen99" className="bg-slate-800 text-white">glitterqueen99 (Scene)</option>
              </select>
            </div>
          )}

          {/* Sandbox Status Badge */}
          <div
            title="Sandbox Defense Active: User CSS is strictly isolated in an iframe / Shadow DOM root and AST sanitized"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Sandbox Shield:</span>
            <span className="font-mono text-emerald-300 uppercase">Active</span>
          </div>

          <Link
            href={`/user/${currentUsername}`}
            target="_blank"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Open Public Profile in New Tab"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
