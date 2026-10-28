'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlatformNavbar } from '@/components/PlatformNavbar';
import { ActivityFeed } from '@/components/ActivityFeed';
import {
  Sparkles,
  Music,
  Heart,
  Palette,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Play,
  Pause,
  Disc,
  Users,
  MessageSquare,
  Star,
  Flame,
  Volume2,
  CheckCircle2,
  Sliders,
  Code2,
  ChevronRight,
  LogIn,
  LogOut
} from 'lucide-react';

interface PreviewTheme {
  id: string;
  name: string;
  tagline: string;
  songTitle: string;
  songArtist: string;
  mood: string;
  accentColor: string;
  headerColor: string;
  bgColor: string;
  cardBg: string;
  borderColor: string;
  borderStyle: string;
  fontFamily: string;
  pattern: 'stars' | 'glitter' | 'scanlines' | 'retro-grid' | 'none';
  avatarUrl: string;
  bannerUrl: string;
  quote: string;
  topFriends: { name: string; role: string; avatarUrl: string }[];
}

const PREVIEW_THEMES: PreviewTheme[] = [
  {
    id: 'classic-blue',
    name: 'Classic 2006 Blue',
    tagline: 'The timeless MySpace aesthetic: crisp blue borders, clean fonts, pure nostalgia.',
    songTitle: 'Such Great Heights',
    songArtist: 'The Postal Service',
    mood: 'nostalgic (⌐■_■)',
    accentColor: '#0055aa',
    headerColor: '#003366',
    bgColor: '#e6edf5',
    cardBg: '#ffffff',
    borderColor: '#99b3cc',
    borderStyle: 'solid',
    fontFamily: 'Trebuchet MS, sans-serif',
    pattern: 'none',
    avatarUrl: 'https://github.com/kevingkday.png',
    bannerUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    quote: "Building the friendly web since 2003. Let's connect!",
    topFriends: [
      { name: 'Sarah', role: 'BFFL', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
      { name: 'Alex', role: 'Bassist', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
      { name: 'Maya', role: 'Designer', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80' },
      { name: 'Jordan', role: 'DJ', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'scene-queen',
    name: 'Scene Queen 2007',
    tagline: 'Hot pink glitter, neon cyan badges, and rawr xD side-bangs energy.',
    songTitle: 'Misery Business',
    songArtist: 'Paramore',
    mood: 'ecstatic ★_★',
    accentColor: '#00f0ff',
    headerColor: '#ff007f',
    bgColor: '#0a0a0f',
    cardBg: '#120f18',
    borderColor: '#ff007f',
    borderStyle: 'dashed',
    fontFamily: '"Comic Sans MS", cursive, sans-serif',
    pattern: 'glitter',
    avatarUrl: '/avatars/glitterqueen.jpg',
    bannerUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80',
    quote: 'Rawr means I love you in dinosaur!! PC4PC? <3',
    topFriends: [
      { name: 'VampireKitten', role: 'Bestie', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80' },
      { name: 'CyberGoth', role: 'Emo King', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
      { name: 'PixelDoll', role: 'BFF', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
      { name: 'NeonSkater', role: 'Homie', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'cyberpunk-matrix',
    name: 'Cyberpunk Matrix',
    tagline: 'Deep terminal black, phosphor neon green, scanline CRT monitor vibe.',
    songTitle: 'Clubbed to Death',
    songArtist: 'Rob Dougan',
    mood: 'terminal connected',
    accentColor: '#10b981',
    headerColor: '#4ade80',
    bgColor: '#030804',
    cardBg: '#061309',
    borderColor: '#22c55e',
    borderStyle: 'solid',
    fontFamily: '"Courier New", Courier, monospace',
    pattern: 'scanlines',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    quote: 'Wake up, Neo... The web is whatever you code it to be.',
    topFriends: [
      { name: 'Trinity', role: 'Operator', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80' },
      { name: 'Morpheus', role: 'Captain', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
      { name: 'Cypher', role: 'Rebel', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80' },
      { name: 'Tank', role: 'Engineer', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'vaporwave-pastel',
    name: 'Vaporwave 1995',
    tagline: 'Pastel lilac, mint teal, retro grid horizon, 90s aesthetic paradise.',
    songTitle: 'Resonance',
    songArtist: 'HOME',
    mood: 'vibing in 1995',
    accentColor: '#38bdf8',
    headerColor: '#f472b6',
    bgColor: '#1a102f',
    cardBg: '#261b44',
    borderColor: '#c084fc',
    borderStyle: 'solid',
    fontFamily: 'sans-serif',
    pattern: 'retro-grid',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    quote: 'Aesthetic horizons & 90s digital mall dreams.',
    topFriends: [
      { name: 'MacintoshPlus', role: 'Synthesizer', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80' },
      { name: 'FloralShoppe', role: 'Producer', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
      { name: 'SaintPepsi', role: 'FutureFunk', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
      { name: 'BlankBanshee', role: 'Vaporwave', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' }
    ]
  }
];

export default function HomePage() {
  const router = useRouter();
  const [activeThemeIndex, setActiveThemeIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);
  const [handleInput, setHandleInput] = useState('');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentDisplayName, setCurrentDisplayName] = useState<string>('');
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user.username);
          setCurrentDisplayName(data.user.displayName || data.user.username);
          setCurrentAvatarUrl(data.user.avatarUrl || '');
        } else {
          setCurrentUser(null);
          setCurrentDisplayName('');
          setCurrentAvatarUrl('');
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      setCurrentDisplayName('');
      setCurrentAvatarUrl('');
      window.location.reload();
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const currentTheme = PREVIEW_THEMES[activeThemeIndex];

  const handleClaimProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = handleInput.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanHandle) {
      router.push(`/signup?handle=${encodeURIComponent(cleanHandle)}`);
    } else {
      router.push('/signup');
    }
  };

  const getPatternStyle = (pattern: string) => {
    switch (pattern) {
      case 'stars':
        return {
          backgroundImage: `radial-gradient(2px 2px at 20px 30px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 40px 70px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 90px 40px, #ffffff, rgba(0,0,0,0))`
        };
      case 'scanlines':
        return {
          backgroundImage: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 255, 0, 0.03))`
        };
      case 'retro-grid':
        return {
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px)`
        };
      case 'glitter':
        return {
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255, 0, 128, 0.15), transparent 70%),
            radial-gradient(circle at 20% 80%, rgba(0, 240, 255, 0.15), transparent 70%)`
        };
      default:
        return {};
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-pink-500 selection:text-white">
      <PlatformNavbar currentUsername="kevin" />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800">
        {/* Ambient Glow & Starry Backing */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 -z-10" />
        <div
          className="absolute inset-0 opacity-20 pointer-events-none -z-10"
          style={{
            backgroundImage: `radial-gradient(2px 2px at 30px 40px, #fff, transparent), radial-gradient(1.5px 1.5px at 120px 80px, #ff007f, transparent), radial-gradient(2px 2px at 200px 180px, #00f0ff, transparent)`,
            backgroundSize: '250px 250px'
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Main Hook & Pitch */}
          <div className="text-center space-y-5 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold shadow-sm shadow-pink-500/10 animate-fade-in">
              <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
              <span className="tracking-wide uppercase font-mono text-[11px]">
                ★ The Expressive Web is Back ★
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-none">
              Your Space. Your Sound. <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Your Rules.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Remember when your online profile actually felt like <i>your room</i>?
              Pick your wallpaper, choose the track that greets visitors, rank your real Top 8,
              and write custom CSS without corporate algorithms crushing your vibe.
            </p>

            {/* Auth-Aware Hero CTA: Logged In Card OR Claim Handle & Login Link */}
            <div className="pt-4 max-w-xl mx-auto">
              {currentUser ? (
                /* Authenticated User Hero Banner */
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/50 to-pink-900/60 border border-indigo-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
                  <div className="flex items-center gap-3.5 w-full sm:w-auto">
                    <div className="relative flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                        alt={currentDisplayName || currentUser}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-400 shadow-md bg-slate-900"
                      />
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
                    </div>
                    <div className="text-left">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Logged in as
                      </div>
                      <div className="text-base font-bold text-white flex items-center gap-1.5">
                        <span>{currentDisplayName || currentUser}</span>
                        <span className="text-xs font-mono text-indigo-300 font-normal">(@{currentUser})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Link
                      href={`/user/${currentUser}`}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md active:scale-95 whitespace-nowrap"
                    >
                      My Profile
                    </Link>
                    <Link
                      href={`/editor?user=${currentUser}`}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white transition-all shadow-md active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>Customize</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800/80 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-800/60 transition-colors cursor-pointer flex items-center gap-1"
                      title="Log Out"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Log Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Unauthenticated Reservation Bar & Quick Login Link */
                <div className="space-y-3">
                  <form
                    onSubmit={handleClaimProfile}
                    className="p-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl shadow-indigo-500/10 flex flex-col sm:flex-row items-center gap-2 backdrop-blur-md"
                  >
                    <div className="flex items-center pl-3 pr-2 w-full sm:w-auto flex-1 text-slate-400 font-mono text-sm">
                      <span className="text-pink-400 font-bold select-none">teramee.com/@</span>
                      <input
                        type="text"
                        value={handleInput}
                        onChange={(e) => setHandleInput(e.target.value)}
                        placeholder="yourhandle"
                        aria-label="Reserve your handle"
                        className="w-full bg-transparent px-2 py-2 text-white placeholder-slate-500 focus:outline-none font-sans font-semibold text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      <span>Claim Handle</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <span>Already have a Teramee profile?</span>
                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new CustomEvent('open-login-modal'))}
                      className="text-pink-400 hover:text-pink-300 font-bold underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Log In to your space &rarr;</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      100% Free Forever
                    </span>
                    <span className="text-slate-700">&bull;</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      No Algorithmic Feeds
                    </span>
                    <span className="text-slate-700">&bull;</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Real Scoped CSS & Tokens
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live Interactive Profile Studio Preview (Hero Centerpiece) */}
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 px-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  Try a Theme Preset Live:
                </span>
              </div>

              {/* Theme Switcher Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {PREVIEW_THEMES.map((theme, idx) => (
                  <button
                    key={theme.id}
                    onClick={() => setActiveThemeIndex(idx)}
                    type="button"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeThemeIndex === idx
                        ? 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white shadow-md shadow-pink-500/20 scale-105'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>

            {/* The Morphing Profile Card Frame */}
            <div
              className="rounded-2xl border border-slate-700/60 p-4 sm:p-6 shadow-2xl transition-all duration-500 relative overflow-hidden"
              style={{
                backgroundColor: currentTheme.bgColor,
                color: currentTheme.accentColor,
                fontFamily: currentTheme.fontFamily,
                ...getPatternStyle(currentTheme.pattern)
              }}
            >
              {/* Profile Card Header Banner */}
              <div className="relative rounded-xl overflow-hidden mb-6 h-36 sm:h-44 border border-black/20 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentTheme.bannerUrl}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-black/60 text-white backdrop-blur-sm border border-white/20">
                        {currentTheme.name}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 uppercase">
                      ● Online Now
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Grid: Left Info & Right Content */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Column: Avatar, Mood, Bio Blurb */}
                <div
                  className="md:col-span-5 rounded-xl p-4 transition-all"
                  style={{
                    backgroundColor: currentTheme.cardBg,
                    borderColor: currentTheme.borderColor,
                    borderStyle: currentTheme.borderStyle,
                    borderWidth: '2px'
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentTheme.avatarUrl}
                      alt="Avatar"
                      className="w-20 h-20 rounded-lg object-cover border-2 shadow-md transition-transform hover:scale-105"
                      style={{ borderColor: currentTheme.accentColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-lg font-black truncate"
                        style={{ color: currentTheme.headerColor }}
                      >
                        {currentTheme.name}
                      </h3>
                      <p className="text-xs opacity-75 font-mono">@teramee_member</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-black/10 border border-black/10">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span>Mood: {currentTheme.mood}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/10 text-xs leading-relaxed opacity-90 space-y-2">
                    <p className="font-semibold italic">&ldquo;{currentTheme.quote}&rdquo;</p>
                    <p className="text-[11px] opacity-75">
                      <b>Interests:</b> Custom CSS, digital nostalgia, mixtapes, retro gaming.
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/editor?user=glitterqueen99&theme=${currentTheme.id}`}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-bold text-center text-white shadow-sm flex items-center justify-center gap-1 transition-transform hover:scale-105"
                      style={{ backgroundColor: currentTheme.headerColor }}
                    >
                      <Palette className="w-3.5 h-3.5" />
                      Remix in Studio
                    </Link>
                    <Link
                      href="/user/kevin"
                      className="py-2 px-3 rounded-lg text-xs font-bold text-center border transition-opacity hover:opacity-80"
                      style={{ borderColor: currentTheme.borderColor }}
                    >
                      View Live
                    </Link>
                  </div>
                </div>

                {/* Right Column: Audio Cassette + Top Friends */}
                <div className="md:col-span-7 space-y-4">
                  {/* Cassette Music Player Component */}
                  <div
                    className="rounded-xl p-4 border transition-all"
                    style={{
                      backgroundColor: currentTheme.cardBg,
                      borderColor: currentTheme.borderColor,
                      borderStyle: currentTheme.borderStyle,
                      borderWidth: '2px'
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Disc
                          className={`w-5 h-5 ${isPlayingAudio ? 'animate-spin' : ''}`}
                          style={{ color: currentTheme.headerColor }}
                        />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider opacity-75">
                          ♫ Profile Soundtrack
                        </span>
                      </div>
                      <span
                        className="px-2 py-0.5 text-[10px] rounded font-mono font-bold"
                        style={{
                          backgroundColor: `${currentTheme.accentColor}25`,
                          color: currentTheme.accentColor
                        }}
                      >
                        {isPlayingAudio ? 'PLAYING' : 'PAUSED'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        aria-label={isPlayingAudio ? 'Pause profile music' : 'Play profile music'}
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer flex-shrink-0"
                        style={{ backgroundColor: currentTheme.headerColor }}
                      >
                        {isPlayingAudio ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: currentTheme.headerColor }}>
                          {currentTheme.songTitle}
                        </p>
                        <p className="text-xs opacity-75 truncate">
                          {currentTheme.songArtist}
                        </p>

                        {/* Equalizer Waveform */}
                        <div className="flex items-end gap-1 h-3 mt-2">
                          {[30, 85, 45, 95, 20, 75, 90, 40, 100, 60, 50, 80, 65, 35].map((h, i) => (
                            <div
                              key={i}
                              className="w-1 rounded-t transition-all duration-300"
                              style={{
                                height: isPlayingAudio ? `${h}%` : '20%',
                                backgroundColor: currentTheme.accentColor
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-1.5 opacity-60">
                        <Volume2 className="w-4 h-4" />
                        <div className="w-10 h-1 rounded-full bg-black/20 overflow-hidden">
                          <div
                            className="w-3/4 h-full"
                            style={{ backgroundColor: currentTheme.accentColor }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top 4 Friends Strip */}
                  <div
                    className="rounded-xl p-4 border transition-all"
                    style={{
                      backgroundColor: currentTheme.cardBg,
                      borderColor: currentTheme.borderColor,
                      borderStyle: currentTheme.borderStyle,
                      borderWidth: '2px'
                    }}
                  >
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-black/10">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: currentTheme.headerColor }}>
                        ★ Top Connections ★
                      </span>
                      <span className="text-[10px] font-mono opacity-70">
                        [Handpicked Inner Circle]
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {currentTheme.topFriends.map((friend, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center group cursor-pointer">
                          <div className="relative mb-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={friend.avatarUrl}
                              alt={friend.name}
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border transition-transform group-hover:scale-105 shadow-sm"
                              style={{ borderColor: currentTheme.accentColor }}
                            />
                            <span
                              className="absolute -top-1 -left-1 px-1 py-0.2 rounded text-[8px] font-bold text-white shadow"
                              style={{ backgroundColor: currentTheme.headerColor }}
                            >
                              #{idx + 1}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold truncate max-w-full" style={{ color: currentTheme.headerColor }}>
                            {friend.name}
                          </span>
                          <span className="text-[9px] opacity-70 truncate max-w-full">
                            {friend.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Modern Problem vs. Teramee (Why We Exist) */}
      <section className="py-20 border-b border-slate-800 bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Why Corporate Social Media Sucks
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Every modern platform turned the internet into a sterile office park. Teramee is your neon living room.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Sterile Web */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-lg">
                  ✕
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">The Corporate Feed</h3>
                  <p className="text-xs text-slate-400">Standardized, sterile, engagement-trapped</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><b>Zero Customization:</b> Everyone has the exact same boring white or grey rectangle layout.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><b>Algorithmic Rage Bait:</b> Black-box algorithms choose what you see based on what makes you angry.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><b>No Music, No Soul:</b> Your musical taste and personality are squashed into a 150-character bio.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><b>Disposable Content:</b> Stories disappear in 24 hours to fuel constant compulsive checking.</span>
                </li>
              </ul>
            </div>

            {/* The Teramee Vision */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-5 shadow-xl shadow-indigo-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 font-bold text-lg">
                  ★
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    The Teramee Web
                    <span className="px-2 py-0.5 rounded text-[10px] bg-pink-500/20 text-pink-300 font-mono">
                      FREEDOM
                    </span>
                  </h3>
                  <p className="text-xs text-indigo-300">Hyper-expressive, music-driven, genuinely social</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
                  <span><b>Hyper-Personalized Styling:</b> Pick retro glitter patterns, custom borders, Google fonts, or write raw CSS.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Music className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span><b>Profile Soundtrack:</b> A custom track greets visitors automatically with animated cassette reels.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span><b>The Iconic Top 8:</b> You celebrate your real inner circle — no vanity metrics or follower counts.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MessageSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><b>Wall Blurbs & Guestbooks:</b> Permanent comments, PC4PC, and digital stickers from real visitors.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features: Nostalgia Meets Modern Web Standards */}
      <section className="py-20 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <Star className="w-3.5 h-3.5" />
              <span>Features That Matter</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Everything You Loved, Supercharged
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Built on Next.js 16 and modern CSS standards so your custom layouts look stunning on desktop and mobile alike.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Raw CSS & Visual Studio */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Dual Customizer Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tweak colors, card opacities, font pairings, and borders with our intuitive visual token picker — or switch to the code tab to write unrestricted raw CSS.
              </p>
            </div>

            {/* Feature 2: Profile Jukebox */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Music className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Profile Jukebox</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Set the vibe before visitors even read a word. Embed tracks with interactive spinning reels, animated equalizers, and audio controls.
              </p>
            </div>

            {/* Feature 3: Drag & Drop Blocks */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">The Sacred Top 8</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Remember negotiating with your friends for the #1 spot? Hand-pick your top connections, assign roles, and celebrate the people who matter.
              </p>
            </div>

            {/* Feature 4: Retro Patterns */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Vintage Patterns & Glows</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Starfields, glitter particles, retro horizons, CRT scanlines, and bevel borders. Every aesthetic from 1999 to 2008 is just one click away.
              </p>
            </div>

            {/* Feature 5: Real Guestbook */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Friend Blurbs & Comments</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A permanent visitor wall for your digital home. Receive messages, compliments on your layout, and &ldquo;Thanks for the add!&rdquo; greetings.
              </p>
            </div>

            {/* Feature 6: Zero Bleed CSS Sandboxing */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-950/40 to-slate-900 border border-blue-500/30 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                Zero CSS Bleed Sandbox
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Powered by an AST CSS sanitizer and iframe isolation. Write whatever wild CSS you want without breaking the site or compromising security.
              </p>
              <Link
                href="/technology"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 pt-1"
              >
                Read our Security Architecture &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Community Member Profiles & Live Retro Wall */}
      <section className="py-20 border-b border-slate-800 bg-slate-950/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Global Activity Feed ("The Retro Wall / Activity Log") */}
          <ActivityFeed limit={6} />

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-pink-400 font-bold">
                Community Showcase
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Explore What People Are Building
              </h2>
            </div>
            <Link
              href="/editor?user=glitterqueen99"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              Open Theme Studio &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tom / Kevin */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 hover:border-blue-500/50 transition-all flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://github.com/kevingkday.png"
                alt="Kevin"
                className="w-20 h-20 rounded-xl object-cover border-2 border-blue-500 shadow-lg flex-shrink-0"
              />
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="font-black text-white text-base">Kevin</h4>
                  <span className="text-xs font-mono text-slate-400">@kevin</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                    Classic 2006 Blue
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  &ldquo;Building the friendly web since 2003. Everyone&apos;s first friend!&rdquo;
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <Link
                    href="/user/kevin"
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
                  >
                    View Profile
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    Claim Your Handle
                  </Link>
                </div>
              </div>
            </div>

            {/* Glitter Queen */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 hover:border-pink-500/50 transition-all flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/avatars/glitterqueen.jpg"
                alt="glitterqueen99"
                className="w-20 h-20 rounded-xl object-cover border-2 border-pink-500 shadow-lg flex-shrink-0"
              />
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="font-black text-white text-base">xX_Glitter_Star_Xx</h4>
                  <span className="text-xs font-mono text-slate-400">@glitterqueen99</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-mono">
                    Scene Queen 2007
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  &ldquo;Rawr means I love you in dinosaur!! xD Leave a comment or get deleted from my top 8!&rdquo;
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <Link
                    href="/user/glitterqueen99"
                    className="px-3.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-colors"
                  >
                    View Profile
                  </Link>
                  <Link
                    href="/editor?user=glitterqueen99"
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    Remix Theme
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/30 via-slate-950 to-pink-950/20 -z-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>Claim Your Spot in the Expressive Web</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Stop Scrolling Boring Feeds. <br />
            <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              Start Designing Your Space.
            </span>
          </h2>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Reserve your handle in seconds. Pick your favorite background pattern, add your profile track, and invite your friends.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-pink-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <span>Build Your Profile Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/technology"
              className="px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm border border-slate-700 transition-colors flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>How Sandbox Security Works</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-pink-500 flex items-center justify-center shadow-md shadow-pink-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-black text-white text-base tracking-tight">Teramee</span>
              <span className="text-xs text-slate-500 block font-mono">teramee.com &bull; The Expressive Web</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/editor" className="hover:text-white transition-colors">Theme Studio</Link>
            <Link href="/user/kevin" className="hover:text-white transition-colors">Demo Profiles</Link>
            <Link href="/technology" className="hover:text-white transition-colors">Security & AST Sandbox</Link>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-500 font-mono">
            <p>You are visitor <span className="text-pink-400 font-bold">#0048192</span></p>
            <p className="mt-0.5">&ldquo;Don&apos;t take life too seriously, nobody gets out alive anyway!&rdquo;</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
