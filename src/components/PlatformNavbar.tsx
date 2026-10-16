'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Sparkles,
  User,
  Palette,
  ExternalLink,
  UserPlus,
  LogIn,
  LogOut
} from 'lucide-react';

interface PlatformNavbarProps {
  currentUsername?: string;
  onSelectUser?: (username: string) => void;
}

export function PlatformNavbar({
  currentUsername,
  onSelectUser
}: PlatformNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('teramee_current_user');
      if (stored) {
        setLoggedInUser(stored);
      }
    }
  }, []);

  const activeUser = currentUsername || loggedInUser || 'tom';

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('teramee_current_user');
      localStorage.removeItem('teramee_session_token');
    }
    setLoggedInUser(null);
    router.push('/');
  };

  return (
    <header
      id="platform-navbar"
      className="sticky top-0 z-[100] w-full border-b border-slate-700 bg-slate-900/95 backdrop-blur-md text-white shadow-lg transition-colors"
      style={{
        isolation: 'isolate',
        pointerEvents: 'auto'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand logo & nostalgic flair */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Teramee
              </span>
              <span className="text-xs ml-2 px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                teramee.com
              </span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href={`/editor?user=${activeUser}`}
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
              href={`/user/${activeUser}`}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                pathname.startsWith('/user')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              Profile: @{activeUser}
            </Link>
          </nav>
        </div>

        {/* Right side controls: Profile Switcher / Auth & Sandbox Shield */}
        <div className="flex items-center gap-3">
          {onSelectUser && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400 font-mono">Demo:</span>
              <select
                value={activeUser}
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
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden lg:inline">Sandbox Shield:</span>
            <span className="font-mono text-emerald-300 uppercase">Active</span>
          </div>

          {/* Authentication state */}
          {loggedInUser ? (
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg p-1 pl-2.5">
              <span className="text-xs font-bold text-blue-300 font-mono">
                @{loggedInUser}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                title="Log Out"
                className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </Link>
              <Link
                href="/signup"
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up Free</span>
              </Link>
            </div>
          )}

          <Link
            href={`/user/${activeUser}`}
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
