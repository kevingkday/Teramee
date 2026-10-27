'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Sparkles,
  User,
  Palette,
  ExternalLink,
  Mail,
  LogIn,
  LogOut,
  Loader2,
  X,
  Lock,
  KeyRound
} from 'lucide-react';
import { InboxModal } from './InboxModal';

interface PlatformNavbarProps {
  currentUsername?: string;
  onSelectUser?: (username: string) => void;
}

export function PlatformNavbar({
  currentUsername = 'kevin',
  onSelectUser
}: PlatformNavbarProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentDisplayName, setCurrentDisplayName] = useState<string>('');
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showInbox, setShowInbox] = useState<boolean>(false);

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginHandle, setLoginHandle] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  const fetchUnread = () => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user.username);
          setCurrentDisplayName(data.user.displayName || data.user.username);
          setCurrentAvatarUrl(data.user.avatarUrl || '');
          fetch('/api/messages')
            .then((mRes) => mRes.json())
            .then((mData) => {
              if (mData && typeof mData.unreadCount === 'number') {
                setUnreadCount(mData.unreadCount);
              }
            })
            .catch(() => {});
        } else {
          setCurrentUser(null);
          setCurrentDisplayName('');
          setCurrentAvatarUrl('');
          setUnreadCount(0);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    setMounted(true);
    fetchUnread();

    const handleOpenLogin = () => setShowLoginModal(true);
    window.addEventListener('open-login-modal', handleOpenLogin);
    return () => window.removeEventListener('open-login-modal', handleOpenLogin);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      setCurrentDisplayName('');
      setCurrentAvatarUrl('');
      setUnreadCount(0);
      window.location.reload();
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginHandle.trim() || !loginPassword) return;
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginHandle.trim().toLowerCase(),
          password: loginPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowLoginModal(false);
        setLoginPassword('');
        fetchUnread();
        window.location.reload();
      } else {
        setLoginError(data.error || 'Login failed. Please check credentials.');
      }
    } catch {
      setLoginError('Network error during login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

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
            className="flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 flex items-center justify-center shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Teramee
              </span>
              <span className="text-xs ml-2 px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-mono border border-pink-500/30">
                teramee.com
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
              Theme Studio
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
              Member Profiles
            </Link>

            <Link
              href="/technology"
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                pathname.startsWith('/technology')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Tech & Security
            </Link>
          </nav>
        </div>

        {/* Right side controls: Profile Switcher & CTA */}
        <div className="flex items-center gap-3">
          {onSelectUser && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400 font-mono">Preview:</span>
              <select
                value={currentUsername}
                onChange={(e) => onSelectUser(e.target.value)}
                aria-label="Switch User Profile"
                className="bg-transparent text-xs font-semibold text-blue-300 focus:outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="kevin" className="bg-slate-800 text-white">Kevin (Classic 2006)</option>
                <option value="glitterqueen99" className="bg-slate-800 text-white">glitterqueen99 (Scene)</option>
                <option value="sarah" className="bg-slate-800 text-white">Sarah (Indie Pop)</option>
                <option value="alex" className="bg-slate-800 text-white">Alex (Garage Rock)</option>
                <option value="maya" className="bg-slate-800 text-white">Maya (Pixel Art)</option>
                <option value="jordan" className="bg-slate-800 text-white">Jordan (DJ Beats)</option>
                <option value="vampirekitten" className="bg-slate-800 text-white">VampireKitten (Goth)</option>
                <option value="cybergoth" className="bg-slate-800 text-white">CyberGoth (Industrial)</option>
                <option value="pixeldoll" className="bg-slate-800 text-white">PixelDoll (Kawaii)</option>
                <option value="neonskater" className="bg-slate-800 text-white">NeonSkater (Skate Punk)</option>
              </select>
            </div>
          )}

          {/* Sandbox Status Badge */}
          <Link
            href="/technology"
            title="Sandbox Defense Active: User CSS is strictly isolated in an iframe and AST sanitized. Click to learn how."
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden lg:inline">Sandbox:</span>
            <span className="font-mono text-emerald-300 uppercase">Secure</span>
          </Link>

          {/* Direct Messages Mail Button (Visible when logged in) */}
          {currentUser && (
            <button
              type="button"
              onClick={() => setShowInbox(true)}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Open Direct Messages Inbox"
            >
              <Mail className="w-4 h-4 text-cyan-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-pink-500 text-white animate-pulse shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* User Auth Section: Logged-in profile badge & Log Out OR Log In & Claim buttons */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700/80">
              <Link
                href={`/user/${currentUser}`}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-xs text-white transition-all group"
                title={`Logged in as ${currentDisplayName || currentUser} (@${currentUser}). Click to view profile.`}
              >
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={currentUser}
                    className="w-5 h-5 rounded-full object-cover border border-emerald-400"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900" />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="font-mono text-emerald-300 font-bold text-[11px] group-hover:text-emerald-200">
                    @{currentUser}
                  </span>
                  <span className="text-[9px] text-slate-400 font-normal">
                    Online
                  </span>
                </div>
              </Link>

              <Link
                href={`/editor?user=${currentUser}`}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-semibold text-indigo-200 transition-colors"
                title="Open Customizer Studio for your profile"
              >
                <Palette className="w-3.5 h-3.5 text-indigo-300" />
                <span className="hidden md:inline">Studio</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-red-950/60 border border-slate-700/80 hover:border-red-800/60 text-xs font-semibold text-slate-300 hover:text-red-300 transition-colors cursor-pointer"
                title="Log out of your Teramee account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                <span>Log In</span>
              </button>

              <Link
                href="/editor?new=true"
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-400 hover:to-indigo-400 text-white shadow-sm shadow-pink-500/20 transition-all hover:scale-105"
              >
                Claim Handle
              </Link>
            </div>
          )}

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

      {/* Direct Messages Inbox Modal */}
      <InboxModal
        isOpen={showInbox}
        onClose={() => {
          setShowInbox(false);
          fetchUnread();
        }}
        currentUser={currentUser}
      />

      {/* Retro-Modern Member Login Modal */}
      {showLoginModal && mounted && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLoginModal(false);
              setLoginError('');
            }
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
        >
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-scale font-sans my-auto">
            {/* Titlebar */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white select-none border-b border-indigo-500/30">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-200" />
                <span className="font-bold text-sm tracking-tight">Teramee Member Login</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginError('');
                }}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogin} className="p-5 sm:p-6 space-y-4">
              {/* Demo Account Fast Selectors */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">Quick-Fill Demo Accounts:</span>
                  <span className="text-[10px] text-slate-500 font-mono">Password: teramee2026</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginHandle('kevin');
                      setLoginPassword('teramee2026');
                      setLoginError('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-mono font-semibold transition-colors cursor-pointer"
                  >
                    @kevin (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginHandle('glitterqueen99');
                      setLoginPassword('teramee2026');
                      setLoginError('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 text-xs font-mono font-semibold transition-colors cursor-pointer"
                  >
                    @glitterqueen99 (Scene)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginHandle('sarah');
                      setLoginPassword('teramee2026');
                      setLoginError('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-mono font-semibold transition-colors cursor-pointer"
                  >
                    @sarah (Indie)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginHandle('alex');
                      setLoginPassword('teramee2026');
                      setLoginError('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/30 text-xs font-mono font-semibold transition-colors cursor-pointer"
                  >
                    @alex (Bassist)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginHandle('maya');
                      setLoginPassword('teramee2026');
                      setLoginError('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-mono font-semibold transition-colors cursor-pointer"
                  >
                    @maya (Artist)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginHandle('vampirekitten');
                      setLoginPassword('teramee2026');
                      setLoginError('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-mono font-semibold transition-colors cursor-pointer"
                  >
                    @vampirekitten (Goth)
                  </button>
                </div>
              </div>

              {/* Username Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Handle / Username</label>
                <div className="flex items-center rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus-within:border-indigo-500">
                  <span className="text-slate-500 font-mono mr-1">@</span>
                  <input
                    type="text"
                    value={loginHandle}
                    onChange={(e) => setLoginHandle(e.target.value)}
                    placeholder="kevin"
                    required
                    className="bg-transparent text-white font-mono focus:outline-none w-full text-xs"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn || !loginHandle.trim() || !loginPassword}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Log In to Teramee</span>
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-slate-800 text-center text-xs text-slate-400">
                <span>Don&apos;t have a profile yet? </span>
                <Link
                  href="/editor?new=true"
                  onClick={() => setShowLoginModal(false)}
                  className="text-pink-400 hover:text-pink-300 font-bold underline"
                >
                  Claim your handle &rarr;
                </Link>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
