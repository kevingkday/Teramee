'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProfileVisitor } from '@/lib/types';
import { INITIAL_PROFILE_VIEWS } from '@/lib/initial-profiles';
import { formatRelativeTime } from './ActivityFeed';
import { Eye } from 'lucide-react';

interface RecentVisitorsProps {
  username: string;
  title?: string;
}

export function RecentVisitors({ username, title }: RecentVisitorsProps) {
  const normalized =
    username.toLowerCase().trim() === 'tom' ? 'kevin' : username.toLowerCase().trim();

  const [visitors, setVisitors] = useState<ProfileVisitor[]>(() =>
    INITIAL_PROFILE_VIEWS.filter(
      (v) => v.profileUsername.toLowerCase() === normalized
    ).slice(0, 8)
  );

  useEffect(() => {
    let isCancelled = false;
    fetch(`/api/profiles/${encodeURIComponent(normalized)}/visitors`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isCancelled && Array.isArray(data?.visitors)) {
          setVisitors(data.visitors);
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [normalized]);

  return (
    <div className="profile-recent-visitors">
      <div
        className="flex items-center justify-between pb-2 mb-3 border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <h2
          className="text-lg font-bold flex items-center gap-2"
          style={{ color: 'var(--header-color)' }}
        >
          <Eye className="w-4 h-4" />
          <span>{title || 'Recent Visitors'}</span>
        </h2>
        <span className="text-[11px] font-mono opacity-75">
          [Last {visitors.length} footprints]
        </span>
      </div>

      {visitors.length === 0 ? (
        <p className="text-xs italic opacity-75 py-2">
          No logged-in visitors recorded yet. Log in and visit friends to leave your footprint!
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {visitors.slice(0, 8).map((visitor) => (
            <Link
              key={visitor.id || visitor.viewerUsername}
              href={`/user/${visitor.viewerUsername}`}
              title={`${visitor.viewerDisplayName || visitor.viewerUsername} (@${visitor.viewerUsername}) • Viewed ${formatRelativeTime(visitor.viewedAt)}`}
              className="group flex flex-col items-center text-center p-1.5 rounded bg-black/5 hover:bg-black/10 transition-all"
              style={{ borderRadius: 'var(--border-radius)' }}
            >
              <div className="relative mb-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    visitor.viewerAvatarUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                  }
                  alt={visitor.viewerDisplayName || visitor.viewerUsername}
                  className="w-11 h-11 rounded object-cover border transition-transform group-hover:scale-105 shadow-sm"
                  style={{
                    borderColor: 'var(--border-color)',
                    borderRadius: 'var(--border-radius)'
                  }}
                />
                <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
              </div>
              <span
                className="text-[10px] font-bold truncate max-w-full group-hover:underline"
                style={{ color: 'var(--accent-color)' }}
              >
                {visitor.viewerDisplayName || visitor.viewerUsername}
              </span>
              <span className="text-[9px] font-mono opacity-65 truncate max-w-full">
                {formatRelativeTime(visitor.viewedAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

