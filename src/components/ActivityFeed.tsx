'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ActivityItem, ActivityActionType } from '@/lib/types';
import { INITIAL_ACTIVITIES } from '@/lib/initial-profiles';
import {
  Music,
  MessageSquare,
  Sparkles,
  Palette,
  Users,
  Camera,
  RefreshCw,
  Radio,
  ArrowUpRight
} from 'lucide-react';

export function formatRelativeTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const nowMs = Date.now();
  const diffMs = nowMs - date.getTime();
  if (Number.isNaN(diffMs) || diffMs < 45_000) return 'Just now';

  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return date.toLocaleDateString();
}

function getActionBadge(actionType: ActivityActionType) {
  switch (actionType) {
    case 'SONG_CHANGED':
      return {
        label: 'Track Changed',
        icon: Music,
        badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
      };
    case 'GUESTBOOK_SIGNED':
      return {
        label: 'Wall Blurb',
        icon: MessageSquare,
        badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      };
    case 'MOOD_UPDATED':
      return {
        label: 'Mood Update',
        icon: Sparkles,
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      };
    case 'TOP_FRIENDS_CHANGED':
      return {
        label: 'Top 8 Shakeup',
        icon: Users,
        badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
      };
    case 'PHOTO_ADDED':
      return {
        label: 'New Polaroid',
        icon: Camera,
        badgeClass: 'bg-pink-500/15 text-pink-300 border-pink-500/30'
      };
    case 'PROFILE_UPDATED':
    default:
      return {
        label: 'Theme Remix',
        icon: Palette,
        badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
      };
  }
}

interface ActivityFeedProps {
  username?: string;
  limit?: number;
}

export function ActivityFeed({ username, limit = 8 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>(() =>
    username
      ? INITIAL_ACTIVITIES.filter(
          (a) => a.actorUsername.toLowerCase() === username.toLowerCase()
        ).slice(0, limit)
      : INITIAL_ACTIVITIES.slice(0, limit)
  );
  const [filter, setFilter] = useState<'ALL' | 'MUSIC' | 'WALL' | 'THEME'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchFeed = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const params = new URLSearchParams({ limit: String(limit) });
      if (username) params.set('username', username);
      const res = await fetch(`/api/feed?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.activities) && data.activities.length > 0) {
          setActivities(data.activities);
        }
      }
    } catch {
      // Fallback to seeded activities if offline
    } finally {
      setIsRefreshing(false);
    }
  }, [username, limit]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const filteredActivities = activities.filter((item) => {
    if (filter === 'ALL') return true;
    if (filter === 'MUSIC') return item.actionType === 'SONG_CHANGED';
    if (filter === 'WALL') return item.actionType === 'GUESTBOOK_SIGNED';
    if (filter === 'THEME') {
      return (
        item.actionType === 'PROFILE_UPDATED' ||
        item.actionType === 'PHOTO_ADDED' ||
        item.actionType === 'TOP_FRIENDS_CHANGED' ||
        item.actionType === 'MOOD_UPDATED'
      );
    }
    return true;
  });

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl overflow-hidden">
      {/* Retro Terminal / Bulletin Titlebar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white">
                The Retro Wall &amp; Live Activity Log
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time soundtrack swaps, CSS layout remixes, Top 8 shakeups &amp; guestbook blurbs
            </p>
          </div>
        </div>

        {/* Filter Pills & Refresh */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'ALL', label: 'All Activity' },
              { id: 'MUSIC', label: '♫ Tracks' },
              { id: 'WALL', label: '✎ Wall Blurbs' },
              { id: 'THEME', label: '★ Themes & Pics' }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                filter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            type="button"
            onClick={fetchFeed}
            disabled={isRefreshing}
            title="Refresh Activity Feed"
            className="p-1.5 rounded-lg bg-slate-950/70 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Activity Feed List */}
      <div className="divide-y divide-slate-800/80">
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">
            No recent activity matching this filter yet.
          </div>
        ) : (
          filteredActivities.map((item) => {
            const badge = getActionBadge(item.actionType);
            const BadgeIcon = badge.icon;
            const snippet =
              typeof item.metadata?.snippet === 'string' ? item.metadata.snippet : null;

            return (
              <div
                key={item.id}
                className="px-5 py-3.5 hover:bg-slate-800/40 transition-colors flex items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  {/* Actor Avatar */}
                  <Link
                    href={`/user/${item.actorUsername}`}
                    className="relative shrink-0 group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        item.actorAvatarUrl ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                      }
                      alt={item.actorDisplayName || item.actorUsername}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700 group-hover:border-pink-500 transition-colors"
                    />
                  </Link>

                  {/* Summary & Metadata */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
                      <Link
                        href={`/user/${item.actorUsername}`}
                        className="font-bold text-white hover:text-pink-400 transition-colors truncate"
                      >
                        {item.actorDisplayName || item.actorUsername}
                      </Link>
                      <span className="text-[11px] font-mono text-slate-500">
                        (@{item.actorUsername})
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${badge.badgeClass}`}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      <span>{item.summary}</span>
                      {item.targetUsername && (
                        <>
                          {' — '}
                          <Link
                            href={`/user/${item.targetUsername}`}
                            className="font-mono font-semibold text-cyan-400 hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>Visit @{item.targetUsername}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </>
                      )}
                    </p>

                    {snippet && (
                      <p className="text-[11px] italic text-slate-400 bg-slate-950/70 border border-slate-800/90 rounded-lg px-2.5 py-1.5 truncate max-w-xl">
                        &ldquo;{snippet}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Relative Timestamp */}
                <div className="text-[11px] font-mono text-slate-500 whitespace-nowrap shrink-0">
                  {formatRelativeTime(item.createdAt)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

