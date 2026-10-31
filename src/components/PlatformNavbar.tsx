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
  Mail,
  LogIn,
  LogOut,
  Loader2,
  X,
  Lock,
  KeyRound,
  Menu
} from 'lucide-react';
import { InboxModal } from './InboxModal';

const PREVIEW_PROFILES = [
  { value: 'kevin', label: 'Kevin (Classic 2006)' },
  { value: 'glitterqueen99', label: 'glitterqueen99 (Scene)' },
  { value: 'sarah', label: 'Sarah (Indie Pop)' },
  { value: 'alex', label: 'Alex (Garage Rock)' },
  { value: 'maya', label: 'Maya (Pixel Art)' },
  { value: 'jordan', label: 'Jordan (DJ Beats)' },
  { value: 'vampirekitten', label: 'VampireKitten (Goth)' },
  { value: 'cybergoth', label: 'CyberGoth (Industrial)' },
  { value: 'pixeldoll', label: 'PixelDoll (Kawaii)' },
  { value: 'neonskater', label: 'NeonSkater (Skate Punk)' }
];

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
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
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
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const mobileOpen = menuPath === pathname;

  const fetchUnread = () => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user.username);
          setIsAdmin(
            Boolean(data.user.isAdmin || data.user.username?.toLowerCase() === 'kevin')
          );
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
          setIsAdmin(false);
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

  const closeMenu = () => setMenuPath(null);

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
      className="sticky top-0 z-[100] w-full max-w-full overflow-x-clip border-b border-slate-700 bg-slate-900/95 backdrop-blur-md text-white shadow-lg"
      style={{
        // Host UI defense: fixed platform isolation styles that cannot be inherited
        isolation: 'isolate',
        pointerEvents: 'auto'
      }}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 shadow-md shadow-pink-500/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="truncate text-lg font-black tracking-tight bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Teramee
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <Link
              href={currentUser ? `/editor?user=${currentUser}` : '/editor?user=glitterqueen99'}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                pathname.startsWith('/editor')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span className="hidden xl:inline">Theme Studio</span>
              <span className="xl:hidden">Studio</span>
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
              <span className="hidden xl:inline">Member Profiles</span>
              <span className="xl:hidden">Profiles</span>
            </Link>

            {isAdmin && (
              <Link
                href="/technology"
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  pathname.startsWith('/technology')
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden xl:inline">Tech & Security</span>
                <span className="xl:hidden">Security</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
          {onSelectUser && (
            <div className="hidden xl:flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5">
              <span className="font-mono text-xs text-slate-400">Preview</span>
              <select
                value={currentUsername}
                onChange={(e) => onSelectUser(e.target.value)}
                aria-label="Switch User Profile"
                className="max-w-[9rem] cursor-pointer truncate bg-transparent text-xs font-semibold text-blue-300 focus:outline-none"
              >
                {PREVIEW_PROFILES.map((profile) => (
                  <option key={profile.value} value={profile.value} className="bg-slate-800 text-white">
                    {profile.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {currentUser && (
            <button
              type="button"
              onClick={() => setShowInbox(true)}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              title="Messages"
              aria-label={unreadCount > 0 ? `Messages, ${unreadCount} unread` : 'Messages'}
            >
              <Mail className="h-4 w-4 text-cyan-400" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-pink-500 px-0.5 text-[9px] font-bold leading-none text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {currentUser ? (
            <>
              <Link
                href={`/user/${currentUser}`}
                className="inline-flex h-9 items-center gap-2 rounded-lg px-1.5 text-slate-200 transition-colors hover:bg-slate-800"
                aria-label={`View profile for @${currentUser}`}
                title={`View @${currentUser}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover"
                />
                <span className="hidden font-mono text-xs font-semibold xl:inline">@{currentUser}</span>
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`hidden h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold lg:inline-flex ${
                    pathname.startsWith('/admin')
                      ? 'border-amber-400 bg-amber-500 text-slate-950'
                      : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  aria-label="Admin"
                  title="Admin"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline">Admin</span>
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="hidden h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white lg:inline-flex"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">Log out</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                aria-label="Log in"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <LogIn className="h-3.5 w-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Log in</span>
              </button>
              <Link
                href="/signup"
                className="inline-flex h-9 items-center whitespace-nowrap rounded-lg bg-gradient-to-r from-pink-500 to-indigo-500 px-3 text-xs font-bold text-white"
              >
                <span className="sm:hidden">Join</span>
                <span className="hidden sm:inline">Claim handle</span>
              </Link>
            </>
          )}

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-800 hover:text-white lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="platform-nav-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuPath(mobileOpen ? null : pathname)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="platform-nav-menu" className="w-full border-t border-slate-800 bg-slate-950 lg:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-3 py-3 sm:px-6">
            {currentUser && (
              <p className="px-3 pb-1 text-xs text-slate-400">
                Signed in as{' '}
                <span className="text-slate-200">
                  {currentDisplayName || currentUser}{' '}
                  <span className="font-mono">@{currentUser}</span>
                </span>
              </p>
            )}
            <Link
              href={currentUser ? `/editor?user=${currentUser}` : '/editor?user=glitterqueen99'}
              onClick={closeMenu}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              <Palette className="h-4 w-4" />
              Theme Studio
            </Link>
            <Link
              href={`/user/${currentUsername}`}
              onClick={closeMenu}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              <User className="h-4 w-4" />
              Member Profiles
            </Link>
            {isAdmin && (
              <Link
                href="/technology"
                onClick={closeMenu}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                <ShieldCheck className="h-4 w-4" />
                Tech & Security
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={closeMenu}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                <KeyRound className="h-4 w-4" />
                Admin
              </Link>
            )}
            {currentUser && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            )}
            {onSelectUser && (
              <label className="mt-2 block px-3">
                <span className="text-xs text-slate-400">Preview profile</span>
                <select
                  value={currentUsername}
                  onChange={(e) => onSelectUser(e.target.value)}
                  aria-label="Switch User Profile"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                >
                  {PREVIEW_PROFILES.map((profile) => (
                    <option key={profile.value} value={profile.value}>
                      {profile.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>
      )}

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
                    placeholder="glitterqueen99"
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
                  href="/signup"
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
