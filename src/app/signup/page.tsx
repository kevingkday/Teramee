'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Heart
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState('classic-blue');

  const [availability, setAvailability] = useState<{
    checking: boolean;
    available?: boolean;
    reason?: string;
  }>({ checking: false });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      setAvailability({
        checking: false,
        available: false,
        reason: 'Letters, numbers, and underscores only.'
      });
      return;
    }

    const timer = setTimeout(() => {
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
    }, 350);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.toLowerCase().trim();

    if (!cleanUsername) {
      setError('Please choose a username.');
      return;
    }
    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (availability.available === false) {
      setError(availability.reason || 'Username is not available.');
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
          password,
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

      // Redirect immediately to the theme customizer studio!
      router.push(`/editor?user=${cleanUsername}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  const selectedPreset =
    THEME_PRESETS.find((p) => p.id === selectedPresetId) || THEME_PRESETS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <PlatformNavbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl">
          {/* Retro Header Card */}
          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join the 2006 Retro Web Revolution</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Create Your Space
            </h1>
            <p className="text-sm text-slate-400">
              Claim your unique profile handle, pick your starting vibe, and start customizing.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Profile Handle (Username) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <span className="font-mono text-sm">@</span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    placeholder="yourname"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition-colors"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {availability.checking ? (
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    ) : availability.available === true ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : availability.available === false ? (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    ) : null}
                  </div>
                </div>
                {availability.reason && (
                  <p
                    className={`text-[11px] font-mono ${
                      availability.available ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {availability.reason}
                  </p>
                )}
                <p className="text-[11px] text-slate-500">
                  Your profile URL will be:{' '}
                  <code className="text-blue-400 font-mono">
                    /user/{username || 'yourname'}
                  </code>
                </p>
              </div>

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
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password (to protect profile edits)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Used to verify your identity when you want to customize your profile later.
                </p>
              </div>

              {/* Theme Preset Picker */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-blue-400" />
                    <span>Choose Starting Aesthetic</span>
                  </label>
                  <span className="text-[11px] text-slate-500">Changeable anytime</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        type="button"
                        key={preset.id}
                        onClick={() => setSelectedPresetId(preset.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500 shadow-md'
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

              {/* Tom Nostalgia Notice Banner */}
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs flex items-center gap-3 text-blue-200">
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-blue-400/30">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Tom"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-white flex items-center gap-1">
                    <span>Tom is waiting for you!</span>
                    <Heart className="w-3 h-3 text-pink-400 inline" />
                  </p>
                  <p className="text-[11px] text-blue-300">
                    He&apos;s already set as your #1 friend and will post your first guestbook comment.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || availability.available === false}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Provisioning Space in Cloudflare D1...</span>
                  </>
                ) : (
                  <>
                    <span>Create My Space & Launch Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Existing User Login Link */}
            <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
              Already have a profile?{' '}
              <Link href="/login" className="text-blue-400 hover:underline font-semibold">
                Log in here
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
