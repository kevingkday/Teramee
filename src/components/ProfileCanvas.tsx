'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/lib/types';
import {
  Play,
  Pause,
  Volume2,
  Heart,
  MessageSquare,
  UserPlus,
  Share2,
  Mail,
  Disc,
  Send,
  Sparkles
} from 'lucide-react';

interface ProfileCanvasProps {
  profile: UserProfile;
  sanitizedCss?: string;
  isInsideIframe?: boolean;
  onAddComment?: (author: string, content: string) => Promise<void>;
}

export function ProfileCanvas({
  profile,
  sanitizedCss = '',
  isInsideIframe = false,
  onAddComment
}: ProfileCanvasProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState(profile.guestbook || []);

  const tokens = profile.tokens;

  // Background pattern CSS styles
  const getBackgroundPatternStyle = (): React.CSSProperties => {
    switch (tokens.backgroundPattern) {
      case 'stars':
        return {
          backgroundImage: `radial-gradient(2px 2px at 20px 30px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 40px 70px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 90px 40px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 160px 120px, #ffffff, rgba(0,0,0,0))`
        };
      case 'scanlines':
        return {
          backgroundImage: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))`
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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      if (onAddComment) {
        await onAddComment(commentAuthor || 'Anonymous Visitor', commentText);
      } else {
        // Direct local or API add
        const res = await fetch(`/api/profiles/${profile.username}/guestbook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            author: commentAuthor || 'Guest Visitor',
            content: commentText
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.entry) {
            setLocalComments([data.entry, ...localComments]);
          }
        }
      }
      setCommentText('');
      setCommentAuthor('');
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert tokens into CSS variable style object
  const cssVariables = {
    '--bg-color': tokens.backgroundColor || '#f0f4f8',
    '--card-bg': tokens.cardColor || '#ffffff',
    '--card-opacity': String(tokens.cardOpacity ?? 1),
    '--text-color': tokens.textColor || '#1f2937',
    '--header-color': tokens.headerColor || '#003366',
    '--accent-color': tokens.accentColor || '#0055aa',
    '--link-hover': tokens.linkHoverColor || '#cc0000',
    '--font-family': tokens.fontFamily || 'Trebuchet MS, sans-serif',
    '--border-radius': tokens.borderRadius || '4px',
    '--border-style': tokens.borderStyle || 'solid',
    '--border-color': tokens.borderColor || '#99b3cc',
    '--border-width': tokens.borderWidth || '1px'
  } as React.CSSProperties;

  // Separate layout blocks by column
  const leftBlocks = (profile.layout || [])
    .filter((b) => b.column === 'left' && b.visible)
    .sort((a, b) => a.order - b.order);

  const rightBlocks = (profile.layout || [])
    .filter((b) => b.column === 'right' && b.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      id="profile-canvas-root"
      className="profile-canvas w-full min-h-screen transition-colors duration-200"
      style={{
        ...cssVariables,
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
        fontFamily: 'var(--font-family)',
        ...getBackgroundPatternStyle()
      }}
    >
      {/* User Scoped CSS injected strictly inside this canvas */}
      {sanitizedCss && (
        <style
          id="user-scoped-custom-css"
          dangerouslySetInnerHTML={{ __html: sanitizedCss }}
        />
      )}

      {/* Main Canvas Container */}
      <div className="max-w-5xl mx-auto px-3 py-6 sm:px-6">
        {/* Profile Masthead / Header Box */}
        <section className="profile-card profile-header mb-6 p-5 transition-all">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            {/* Avatar & Identifiers */}
            <div className="flex gap-4 items-center">
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg object-cover border-2 shadow-md"
                  style={{
                    borderColor: 'var(--border-color)',
                    borderRadius: 'var(--border-radius)'
                  }}
                />
                <span className="profile-badge absolute -bottom-2 -right-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  Online
                </span>
              </div>

              <div>
                <h1
                  className="text-2xl sm:text-3xl font-black tracking-tight"
                  style={{ color: 'var(--header-color)' }}
                >
                  {profile.displayName}
                </h1>
                <p className="text-sm font-semibold italic opacity-90 mt-0.5">
                  &ldquo;{profile.headline}&rdquo;
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs opacity-75">
                  <span className="px-2 py-0.5 rounded bg-black/10 font-mono">
                    Mood: {profile.mood || 'nostalgic'}
                  </span>
                  <span>|</span>
                  <span>Last Active: Today</span>
                  <span>|</span>
                  <span className="font-mono">Extended Network (Level 2)</span>
                </div>
              </div>
            </div>

            {/* Retro Action Bar */}
            <div className="w-full md:w-auto flex flex-col gap-2">
              <div className="text-[11px] px-3 py-1.5 rounded font-mono bg-black/5 border border-black/10 select-all truncate max-w-xs">
                https://myspace.com/{profile.username}
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
                <button
                  type="button"
                  className="profile-btn flex items-center gap-1.5 px-3 py-1.5 rounded transition-all text-white bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-sm"
                  style={{ backgroundColor: 'var(--accent-color)' }}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add Friend
                </button>
                <button
                  type="button"
                  className="profile-btn flex items-center gap-1.5 px-3 py-1.5 rounded transition-all border border-black/20 hover:bg-black/5 active:scale-95"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Message
                </button>
                <button
                  type="button"
                  className="profile-btn flex items-center gap-1.5 px-3 py-1.5 rounded transition-all border border-black/20 hover:bg-black/5 active:scale-95"
                >
                  <Heart className="w-3.5 h-3.5" />
                  Add Favorites
                </button>
                <button
                  type="button"
                  className="profile-btn flex items-center gap-1.5 px-3 py-1.5 rounded transition-all border border-black/20 hover:bg-black/5 active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Forward
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Modular Profile Two-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="md:col-span-5 space-y-6">
            {leftBlocks.map((block) => (
              <div key={block.id} className="profile-card p-5 transition-all">
                {block.id === 'bio' && (
                  <>
                    <h2
                      className="text-lg font-bold pb-2 mb-3 border-b flex items-center gap-2"
                      style={{
                        color: 'var(--header-color)',
                        borderColor: 'var(--border-color)'
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      About Me
                    </h2>
                    <div
                      className="profile-bio-content text-sm leading-relaxed space-y-2"
                      dangerouslySetInnerHTML={{ __html: profile.bioHtml }}
                    />
                    <div className="mt-4 pt-3 border-t text-xs opacity-80" style={{ borderColor: 'var(--border-color)' }}>
                      <p className="font-semibold mb-1">SpaceMy URL:</p>
                      <p className="font-mono break-all text-blue-600 underline">
                        http://www.myspace.com/{profile.username}
                      </p>
                    </div>
                  </>
                )}

                {block.id === 'interests' && (
                  <>
                    <h2
                      className="text-lg font-bold pb-2 mb-3 border-b"
                      style={{
                        color: 'var(--header-color)',
                        borderColor: 'var(--border-color)'
                      }}
                    >
                      Interests & Details
                    </h2>
                    <div
                      className="profile-interests-content text-xs leading-relaxed space-y-2"
                      dangerouslySetInnerHTML={{ __html: profile.interestsHtml }}
                    />
                  </>
                )}

                {block.id === 'statusBlurb' && (
                  <>
                    <h2
                      className="text-lg font-bold pb-2 mb-3 border-b"
                      style={{
                        color: 'var(--header-color)',
                        borderColor: 'var(--border-color)'
                      }}
                    >
                      Latest Status & Mood
                    </h2>
                    <p className="text-sm italic">{profile.tagline}</p>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="md:col-span-7 space-y-6">
            {rightBlocks.map((block) => (
              <div key={block.id} className="profile-card p-5 transition-all">
                {/* Media / Audio Player Block */}
                {block.id === 'mediaPlayer' && (
                  <div className="player-cassette rounded-lg p-4 border bg-black/5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Disc
                          className={`w-5 h-5 text-indigo-500 ${
                            isPlaying ? 'animate-spin' : ''
                          }`}
                        />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                          Profile Jukebox 2.0
                        </span>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] rounded font-mono bg-emerald-500/20 text-emerald-600 font-bold">
                        {isPlaying ? 'PLAYING' : 'READY'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setIsPlaying(!isPlaying)}
                        aria-label={isPlaying ? "Pause Track" : "Play Track"}
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md transition-transform hover:scale-105 active:scale-95"
                        style={{ backgroundColor: 'var(--accent-color)' }}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">
                          {profile.songTitle || 'Such Great Heights'}
                        </p>
                        <p className="text-xs opacity-75 truncate">
                          {profile.songArtist || 'The Postal Service'}
                        </p>

                        {/* Animated Equalizer Waveform */}
                        <div className="flex items-end gap-1 h-4 mt-2">
                          {[40, 80, 55, 95, 30, 70, 85, 50, 100, 65, 45, 90].map((h, i) => (
                            <div
                              key={i}
                              className="w-1.5 rounded-t bg-blue-500/80 transition-all duration-300"
                              style={{
                                height: isPlaying ? `${h}%` : '20%',
                                backgroundColor: 'var(--accent-color)'
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-1.5 opacity-60">
                        <Volume2 className="w-4 h-4" />
                        <div className="w-12 h-1.5 rounded-full bg-black/20 overflow-hidden">
                          <div className="w-3/4 h-full bg-current"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Top Connections / Top 8 Block */}
                {block.id === 'topConnections' && (
                  <>
                    <div className="flex items-center justify-between pb-2 mb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <h2
                        className="text-lg font-bold"
                        style={{ color: 'var(--header-color)' }}
                      >
                        {profile.displayName}&apos;s Top 8 Connections
                      </h2>
                      <span className="text-xs font-mono opacity-75">
                        [8 of 422 friends]
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {(profile.topFriends || []).slice(0, 8).map((friend, idx) => (
                        <div
                          key={friend.id || idx}
                          className="friend-card flex flex-col items-center text-center group"
                        >
                          <div className="relative mb-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={friend.avatarUrl}
                              alt={friend.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded object-cover border transition-transform group-hover:scale-105 shadow-sm"
                              style={{
                                borderColor: 'var(--border-color)',
                                borderRadius: 'var(--border-radius)'
                              }}
                            />
                            <span
                              className="absolute top-1 left-1 px-1.5 py-0.2 rounded text-[9px] font-bold text-white shadow-sm"
                              style={{ backgroundColor: 'var(--accent-color)' }}
                            >
                              #{idx + 1}
                            </span>
                          </div>
                          <span
                            className="text-xs font-bold truncate max-w-full hover:underline cursor-pointer"
                            style={{ color: 'var(--accent-color)' }}
                          >
                            {friend.name}
                          </span>
                          <span className="text-[10px] opacity-70 truncate max-w-full">
                            {friend.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Visitor Guestbook & Comments */}
                {block.id === 'guestbook' && (
                  <>
                    <div className="flex items-center justify-between pb-2 mb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <h2
                        className="text-lg font-bold flex items-center gap-2"
                        style={{ color: 'var(--header-color)' }}
                      >
                        <MessageSquare className="w-4 h-4" />
                        Friend Comments & Blurbs
                      </h2>
                      <span className="text-xs font-mono opacity-75">
                        Showing {localComments.length} comments
                      </span>
                    </div>

                    {/* Interactive Comment Form */}
                    <form
                      onSubmit={handleCommentSubmit}
                      className="mb-5 p-3 rounded-lg border bg-black/5"
                      style={{
                        borderColor: 'var(--border-color)',
                        borderRadius: 'var(--border-radius)'
                      }}
                    >
                      <p className="text-xs font-semibold mb-2 flex items-center gap-1 opacity-90">
                        Leave a comment on {profile.displayName}&apos;s profile:
                        <span className="text-[10px] font-normal opacity-60">
                          (Safe HTML tags allowed)
                        </span>
                      </p>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={commentAuthor}
                          onChange={(e) => setCommentAuthor(e.target.value)}
                          placeholder="Your Name (e.g., Sarah)"
                          className="w-full text-xs px-2.5 py-1.5 rounded border bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <textarea
                          rows={2}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write a message... (You can use <b>bold</b> or <i>italics</i>!)"
                          required
                          className="w-full text-xs px-2.5 py-1.5 rounded border bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="profile-btn flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded text-white shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                            style={{ backgroundColor: 'var(--accent-color)' }}
                          >
                            <Send className="w-3 h-3" />
                            {isSubmitting ? 'Posting...' : 'Post Comment'}
                          </button>
                        </div>
                      </div>
                    </form>

                    {/* Comments Feed */}
                    <div className="space-y-3">
                      {localComments.map((comment) => (
                        <div
                          key={comment.id}
                          className="comment-bubble p-3 rounded border text-xs flex gap-3 bg-black/5 transition-all"
                          style={{
                            borderColor: 'var(--border-color)',
                            borderRadius: 'var(--border-radius)'
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={comment.avatarUrl}
                            alt={comment.author}
                            className="w-10 h-10 rounded object-cover border flex-shrink-0"
                            style={{ borderColor: 'var(--border-color)' }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className="font-bold hover:underline cursor-pointer"
                                style={{ color: 'var(--accent-color)' }}
                              >
                                {comment.author}
                              </span>
                              <span className="text-[10px] opacity-60">
                                {comment.timestamp}
                              </span>
                            </div>
                            <div
                              className="leading-relaxed break-words"
                              dangerouslySetInnerHTML={{ __html: comment.contentHtml }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
