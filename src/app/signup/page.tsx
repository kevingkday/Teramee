'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PlatformNavbar } from '@/components/PlatformNavbar';
import { THEME_PRESETS } from '@/lib/presets';
import {
  Sparkles,
  User,
  Lock,
  CheckCircle2,
  AlertCircle,
  Palette,
  ArrowRight,
  ShieldCheck,
  Heart,
  Globe,
  Search,
  Music
} from 'lucide-react';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialHandleParam = searchParams.get('handle') || '';
  const initialThemeParam = searchParams.get('theme') || '';

  const [username, setUsername] = useState(() =>
    initialHandleParam.toLowerCase().replace(/[^a-z0-9_]/g, '')
  );
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState(() => {
    if (initialThemeParam && THEME_PRESETS.some((p) => p.id === initialThemeParam)) {
      return initialThemeParam;
    }
    return 'classic-blue';
  });

  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const [availability, setAvailability] = useState<{
    checking: boolean;
    available?: boolean;
    reason?: string;
  }>({ checking: false });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data?.user?.username) {
          setCurrentUser(data.user.username);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialHandleParam) {
      const cleaned = initialHandleParam.toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (cleaned) setUsername(cleaned);
    }
  }, [initialHandleParam]);

  const runAvailabilityCheck = (handleToCheck: string) => {
    const trimmed = handleToCheck.toLowerCase().trim();
    if (!trimmed) {
      setAvailability({ checking: false });
      return;
    }

    if (trimmed.length < 3) {
      setAvailability({
        checking: false,
        available: false,
        reason: 'At least 3 characters required.'
      });
      return;
    }

    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      setAvailability({
        checking: false,
        available: false,
        reason: 'Letters, numbers, and underscores only.'
      });
      return;
    }

    setAvailability({ checking: true });
    fetch(`/api/auth/check-username?username=${encodeURIComponent(trimmed)}`)
      .then((res) => res.json())
      .then((data) => {
        setAvailability({
          checking: false,
          available: !!data.available,
          reason: data.reason
        });
      })
      .catch(() => {
        setAvailability({ checking: false });
      });
  };

  // Debounced username availability check
  useEffect(() => {
    const trimmed = username.toLowerCase().trim();
    if (!trimmed) {
      setAvailability({ checking: false });
      return;
    }

    if (trimmed.length < 3) {
      setAvailability({
        checking: false,
        available: false,
        reason: 'At least 3 characters required.'
      });
      return;
    }

    const timer = setTimeout(() => {
      runAvailabilityCheck(trimmed);
    }, 250);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.toLowerCase().trim();

    if (!cleanUsername) {
      setError('Please choose a handle.');
      return;
    }
    if (cleanUsername.length < 3) {
      setError('Handle must be at least 3 characters.');
      return;
    }
    if (availability.available === false) {
      setError(availability.reason || 'Handle is not available.');
      return;
    }
    if (!password || password.trim().length < 4) {
      setError('Please set a password of at least 4 characters to protect your profile.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          displayName: displayName.trim() || cleanUsername,
          password: password.trim(),
          presetId: selectedPresetId
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed.');
      }

      // Store local session
      if (typeof window !== 'undefined') {
        localStorage.setItem('teramee_current_user', cleanUsername);
        if (data.sessionToken) {
          localStorage.setItem('teramee_session_token', data.sessionToken);
        }
      }

      // Redirect immediately to their own theme customizer studio!
      router.push(`/editor?user=${cleanUsername}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  const trimmedUsername = username.toLowerCase().trim();
  const suggestedHandles =
    trimmedUsername.length >= 3 && availability.available === false
      ? [
          `${trimmedUsername}_2006`,
          `xx_${trimmedUsername}_xx`,
          `${trimmedUsername}_fm`,
          `real_${trimmedUsername}`
        ].filter((h) => h.length <= 20)
      : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <PlatformNavbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-3xl space-y-8">
          {/* Header & Value Proposition */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Claim Your Personal Corner of the Web</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Claim Your Teramee Handle
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
              Your handle reserves your permanent retro profile URL, unlocks your personal Theme Studio, and gives you full creative control over your space.
            </p>
          </div>

          {/* What is a Teramee Handle? Explainer Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Globe className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                1. Permanent URL
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Get your own <code className="text-cyan-300 font-mono">teramee.com/user/@you</code> link. Share your digital room with friends — zero algorithmic feeds.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <Music className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                2. Custom CSS &amp; Sound
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pick a preset theme or write raw CSS, embed your profile soundtrack, curate your Top 8, and collect guestbook blurbs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                3. Owner Protected
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your handle is locked with your password. Visitors can view and sign your guestbook, but only you can edit your profile.
              </p>
            </div>
          </div>

          {currentUser && (
            <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-300">
                You are currently signed in as <strong className="text-emerald-400 font-mono">@{currentUser}</strong>. You can jump straight to your Theme Studio or claim a new handle below.
              </div>
              <Link
                href={`/editor?user=${currentUser}`}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold whitespace-nowrap transition-colors"
              >
                Edit @{currentUser} Studio &rarr;
              </Link>
            </div>
          )}

          {/* Main Claim & Availability Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Check Handle Availability */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label htmlFor="claim-handle-input" className="block text-xs font-bold uppercase tracking-wider text-pink-400">
                    Step 1: Check Handle Availability <span className="text-red-400">*</span>
                  </label>
                  {availability.checking ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <span className="w-2.5 h-2.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      Checking...
                    </span>
                  ) : availability.available === true ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Available!
                    </span>
                  ) : availability.available === false ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Unavailable
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-mono">
                      3–20 chars (letters, numbers, _)
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <span className="font-mono text-sm text-pink-400 font-bold">teramee.com/@</span>
                    </div>
                    <input
                      id="claim-handle-input"
                      type="text"
                      required
                      maxLength={20}
                      placeholder="yourhandle"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                      }
                      className={`w-full pl-32 pr-10 py-3 bg-slate-900 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none font-mono transition-colors ${
                        availability.available === true
                          ? 'border-emerald-500/60 focus:border-emerald-400'
                          : availability.available === false
                          ? 'border-rose-500/60 focus:border-rose-400'
                          : 'border-slate-700 focus:border-blue-500'
                      }`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => runAvailabilityCheck(username)}
                    disabled={!username.trim() || availability.checking}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    <Search className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Check Availability</span>
                  </button>
                </div>

                {availability.reason && (
                  <div
                    className={`p-2.5 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                      availability.available
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {availability.available ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{availability.reason}</span>
                  </div>
                )}

                {suggestedHandles.length > 0 && (
                  <div className="pt-1 space-y-1.5">
                    <span className="text-[11px] text-slate-400">
                      Try one of these available retro handles instead:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedHandles.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => setUsername(sug)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-indigo-950/80 border border-slate-700 hover:border-indigo-500/50 text-xs font-mono text-cyan-300 transition-colors cursor-pointer"
                        >
                          @{sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-slate-500">
                  Your public profile address will be:{' '}
                  <code className="text-blue-400 font-mono">
                    teramee.com/user/{username || 'yourhandle'}
                  </code>
                </p>
              </div>

              {/* Step 2: Profile Identity & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Display Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Display Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      maxLength={40}
                      placeholder="e.g. xX_Alex_Rawr_Xx or Alex D."
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Shown at the top of your profile header.
                  </p>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Owner Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={4}
                      placeholder="At least 4 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Protects your Theme Studio so only you can edit your profile.
                  </p>
                </div>
              </div>

              {/* Step 3: Theme Preset Picker */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-pink-400" />
                    <span>Step 2: Choose Your Starting Aesthetic</span>
                  </label>
                  <span className="text-[11px] text-slate-500">Fully customizable in Studio</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        type="button"
                        key={preset.id}
                        onClick={() => setSelectedPresetId(preset.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500 shadow-md'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">
                            {preset.name}
                          </span>
                          <span
                            className="w-3 h-3 rounded-full border border-white/20"
                            style={{ backgroundColor: preset.tokens.accentColor }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {preset.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* First Friend Notice Banner */}
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs flex items-center gap-3 text-blue-200">
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-blue-400/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://github.com/kevingkday.png"
                    alt="Kevin"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-white flex items-center gap-1">
                    <span>Kevin (@kevin) is your first friend!</span>
                    <Heart className="w-3 h-3 text-pink-400 inline" />
                  </p>
                  <p className="text-[11px] text-blue-300">
                    He&apos;s automatically added to your Top 8 and will leave the first welcome note on your guestbook wall.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !username.trim() || availability.available === false}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Claiming @{username} &amp; Building Space...</span>
                  </>
                ) : (
                  <>
                    <span>Claim @{username || 'yourhandle'} &amp; Launch Theme Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Links: Login or Try Demo Studio */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-800 text-xs text-slate-400">
              <div>
                Already claimed a handle?{' '}
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-login-modal'))}
                  className="text-pink-400 hover:text-pink-300 font-bold underline cursor-pointer"
                >
                  Log in here
                </button>
              </div>
              <div>
                Just exploring?{' '}
                <Link
                  href="/editor?user=glitterqueen99"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold underline"
                >
                  Preview Demo Studio (@glitterqueen99) &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <div className="space-y-2 text-center">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono">Loading Handle Reservation...</p>
          </div>
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
