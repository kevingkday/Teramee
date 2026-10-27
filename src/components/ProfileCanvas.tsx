'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
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
  Sparkles,
  Check,
  Trash2,
  Lock,
  Loader2
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

  // User session state
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentDisplayName, setCurrentDisplayName] = useState<string>('');
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>('');

  // Social interactions state
  const [isFriend, setIsFriend] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFriend, setIsTogglingFriend] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Send Direct Message modal state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [msgSubject, setMsgSubject] = useState(`Hey ${profile.displayName}!`);
  const [msgBody, setMsgBody] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [mounted, setMounted] = useState(false);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  // Check auth and initial friendship/favorite status
  useEffect(() => {
    setMounted(true);
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user.username);
          setCurrentDisplayName(data.user.displayName || data.user.username);
          setCurrentAvatarUrl(data.user.avatarUrl || '');
          setCommentAuthor(data.user.displayName || data.user.username);
        }
      })
      .catch(() => {});

    fetch(`/api/profiles/${profile.username}/friend`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.isFriend === 'boolean') {
          setIsFriend(data.isFriend);
        }
      })
      .catch(() => {});

    fetch(`/api/profiles/${profile.username}/favorite`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.isFavorite === 'boolean') {
          setIsFavorite(data.isFavorite);
        }
      })
      .catch(() => {});
  }, [profile.username]);

  const handleToggleFriend = async () => {
    if (!currentUser) {
      showToast('Please log in or claim a profile to add friends!', 'info');
      return;
    }
    if (currentUser.toLowerCase() === profile.username.toLowerCase()) {
      showToast('You are looking at your own profile :-)', 'info');
      return;
    }

    setIsTogglingFriend(true);
    try {
      const res = await fetch(`/api/profiles/${profile.username}/friend`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setIsFriend(data.isFriend);
        showToast(
          data.isFriend
            ? `Added @${profile.username} as a friend! ★`
            : `Removed @${profile.username} from friends.`
        );
      } else {
        showToast(data.error || 'Failed to update friendship.', 'error');
      }
    } catch {
      showToast('Network error updating friend status.', 'error');
    } finally {
      setIsTogglingFriend(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      showToast('Please log in or claim a profile to save favorites!', 'info');
      return;
    }

    setIsTogglingFavorite(true);
    try {
      const res = await fetch(`/api/profiles/${profile.username}/favorite`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setIsFavorite(data.isFavorite);
        showToast(
          data.isFavorite
            ? `Added @${profile.username} to your favorites! ♥`
            : `Removed @${profile.username} from favorites.`
        );
      } else {
        showToast(data.error || 'Failed to update favorites.', 'error');
      }
    } catch {
      showToast('Network error updating favorites.', 'error');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Please log in to send private messages.', 'info');
      return;
    }
    if (!msgBody.trim()) return;

    setIsSendingMsg(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUsername: profile.username,
          subject: msgSubject,
          body: msgBody
        })
      });
      if (res.ok) {
        setShowMessageModal(false);
        setMsgBody('');
        showToast(`Private message delivered to @${profile.username}! ✉`);
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to send message.', 'error');
      }
    } catch {
      showToast('Network error sending message.', 'error');
    } finally {
      setIsSendingMsg(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      const res = await fetch(`/api/profiles/${profile.username}/guestbook`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId })
      });
      if (res.ok) {
        setLocalComments((prev) => prev.filter((c) => c.id !== commentId));
        showToast('Comment removed.');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to delete comment.', 'error');
      }
    } catch {
      showToast('Network error deleting comment.', 'error');
    }
  };

  const handleForward = () => {
    const url = `https://teramee.com/user/${profile.username}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
      showToast(`Copied ${url} to clipboard!`);
    } else {
      showToast(`Share URL: ${url}`, 'info');
    }
  };

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
      const author = commentAuthor.trim() || currentDisplayName || 'Anonymous Visitor';
      const avatarUrl = currentAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';

      if (onAddComment) {
        await onAddComment(author, commentText);
      } else {
        const res = await fetch(`/api/profiles/${profile.username}/guestbook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            author,
            content: commentText,
            avatarUrl,
            username: currentUser || undefined
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.entry) {
            setLocalComments([data.entry, ...localComments]);
            showToast('Comment posted! ★');
          }
        }
      }
      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment', err);
      showToast('Failed to post comment.', 'error');
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
                https://teramee.com/user/{profile.username}
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
                {/* 1. Add / Friends Button */}
                <button
                  type="button"
                  onClick={handleToggleFriend}
                  disabled={isTogglingFriend}
                  className={`profile-btn flex items-center justify-center gap-1.5 px-3 py-1.5 rounded transition-all shadow-sm active:scale-95 cursor-pointer ${
                    isFriend
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'text-white bg-blue-600 hover:bg-blue-700'
                  }`}
                  style={!isFriend ? { backgroundColor: 'var(--accent-color)' } : undefined}
                >
                  {isFriend ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Friends ✓</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{isTogglingFriend ? 'Adding...' : 'Add Friend'}</span>
                    </>
                  )}
                </button>

                {/* 2. Message Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) {
                      showToast('Please log in to send private messages!', 'info');
                    } else {
                      setShowMessageModal(true);
                    }
                  }}
                  className="profile-btn flex items-center justify-center gap-1.5 px-3 py-1.5 rounded transition-all border border-black/20 hover:bg-black/5 active:scale-95 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>

                {/* 3. Add Favorites Button */}
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  disabled={isTogglingFavorite}
                  className={`profile-btn flex items-center justify-center gap-1.5 px-3 py-1.5 rounded transition-all border border-black/20 hover:bg-black/5 active:scale-95 cursor-pointer ${
                    isFavorite ? 'text-pink-600 font-bold bg-pink-50 border-pink-300' : ''
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-pink-600 text-pink-600' : ''}`} />
                  <span>{isFavorite ? 'Favorited ♥' : 'Add Favorites'}</span>
                </button>

                {/* 4. Forward / Share Button */}
                <button
                  type="button"
                  onClick={handleForward}
                  className="profile-btn flex items-center justify-center gap-1.5 px-3 py-1.5 rounded transition-all border border-black/20 hover:bg-black/5 active:scale-95 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Forward</span>
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
                      {profile.displayName}&apos;s Blurbs
                    </h2>
                    <div className="space-y-4 text-sm leading-relaxed">
                      <div>
                        <p
                          className="font-bold text-xs uppercase tracking-wider mb-1"
                          style={{ color: 'var(--header-color)' }}
                        >
                          About me:
                        </p>
                        <div
                          className="profile-bio-content space-y-2"
                          dangerouslySetInnerHTML={{ __html: profile.bioHtml }}
                        />
                      </div>

                      {profile.whoIdLikeToMeetHtml && (
                        <div
                          className="pt-3 border-t"
                          style={{ borderColor: 'var(--border-color)' }}
                        >
                          <p
                            className="font-bold text-xs uppercase tracking-wider mb-1"
                            style={{ color: 'var(--header-color)' }}
                          >
                            Who I&apos;d like to meet:
                          </p>
                          <div
                            className="space-y-2"
                            dangerouslySetInnerHTML={{ __html: profile.whoIdLikeToMeetHtml }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t text-xs opacity-80" style={{ borderColor: 'var(--border-color)' }}>
                      <p className="font-semibold mb-1">Teramee URL:</p>
                      <p className="font-mono break-all text-blue-600 underline">
                        https://teramee.com/user/{profile.username}
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
                      {(profile.topFriends || []).slice(0, 8).map((friend, idx) => {
                        const friendHandle = friend.username || friend.name.toLowerCase().replace(/[^a-z0-9_]/g, '');
                        return (
                          <Link
                            key={friend.id || idx}
                            href={`/user/${friendHandle}`}
                            className="friend-card flex flex-col items-center text-center group cursor-pointer"
                            title={`Visit ${friend.name}'s profile (@${friendHandle})`}
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
                              className="text-xs font-bold truncate max-w-full group-hover:underline"
                              style={{ color: 'var(--accent-color)' }}
                            >
                              {friend.name}
                            </span>
                            <span className="text-[10px] opacity-70 truncate max-w-full">
                              {friend.role}
                            </span>
                          </Link>
                        );
                      })}
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
                          <Link
                            href={`/user/${comment.username || comment.author.toLowerCase().replace(/[^a-z0-9_]/g, '')}`}
                            className="flex-shrink-0"
                            title={`Visit ${comment.author}'s profile`}
                          >
                            <img
                              src={comment.avatarUrl}
                              alt={comment.author}
                              className="w-10 h-10 rounded object-cover border hover:opacity-80 transition-opacity"
                              style={{ borderColor: 'var(--border-color)' }}
                            />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <Link
                                href={`/user/${comment.username || comment.author.toLowerCase().replace(/[^a-z0-9_]/g, '')}`}
                                className="font-bold hover:underline cursor-pointer"
                                style={{ color: 'var(--accent-color)' }}
                                title={`Visit ${comment.author}'s profile`}
                              >
                                {comment.author}
                              </Link>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] opacity-60">
                                  {comment.timestamp}
                                </span>
                                {(currentUser && (
                                  currentUser.toLowerCase() === profile.username.toLowerCase() ||
                                  comment.author.toLowerCase() === (currentDisplayName || currentUser).toLowerCase()
                                )) && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="text-red-500 hover:text-red-700 opacity-70 hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                                    title="Delete this comment"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
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

      {/* Send Private Message Modal */}
      {showMessageModal && mounted && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMessageModal(false);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
        >
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-scale my-auto">
            {/* Titlebar */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-700 to-indigo-800 text-white select-none">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-200" />
                <span className="font-bold text-sm">Send Private Message</span>
              </div>
              <button
                type="button"
                onClick={() => setShowMessageModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="p-5 space-y-4">
              {/* Recipient summary */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                />
                <div>
                  <div className="text-xs text-slate-400">Recipient</div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{profile.displayName}</span>
                    <span className="text-xs font-mono text-indigo-400">(@{profile.username})</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Subject</label>
                <input
                  type="text"
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Message Body</label>
                <textarea
                  rows={5}
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  placeholder={`Say something nice to ${profile.displayName}...`}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingMsg || !msgBody.trim()}
                  className="px-5 py-2 text-xs font-bold text-white rounded-xl bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSendingMsg ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Delivering...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Retro Toast Notification */}
      {toast && mounted && createPortal(
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold backdrop-blur border animate-bounce-subtle bg-slate-900/95 text-white border-slate-700">
          {toast.type === 'success' && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
          {toast.type === 'info' && <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
          {toast.type === 'error' && <Trash2 className="w-4 h-4 text-rose-400 flex-shrink-0" />}
          <span>{toast.message}</span>
        </div>,
        document.body
      )}
    </div>
  );
}
