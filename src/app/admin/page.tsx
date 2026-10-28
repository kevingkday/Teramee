'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PlatformNavbar } from '@/components/PlatformNavbar';
import {
  ShieldCheck,
  Users,
  MessageSquare,
  Activity,
  Eye,
  Mail,
  Search,
  KeyRound,
  Trash2,
  ExternalLink,
  Palette,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Edit3,
  X,
  Star,
  Camera,
  Music
} from 'lucide-react';

interface AdminUserSummary {
  username: string;
  displayName: string;
  email: string;
  isAdmin: boolean;
  avatarUrl: string;
  mood: string;
  songTitle: string;
  songArtist: string;
  photoCount: number;
  friendCount: number;
  guestbookCount: number;
  hasPassword: boolean;
  isSeeded: boolean;
  updatedAt: string;
}

interface AdminGuestbookItem {
  id: string;
  profileUsername: string;
  author: string;
  authorUsername?: string;
  avatarUrl: string;
  timestamp: string;
  contentHtml: string;
  createdAt: string;
}

interface AdminActivityItem {
  id: string;
  actorUsername: string;
  actorDisplayName?: string;
  actorAvatarUrl?: string;
  targetUsername?: string | null;
  actionType: string;
  summary: string;
  createdAt: string;
}

interface AdminDashboardData {
  adminUser: string;
  stats: {
    totalUsers: number;
    customUsers: number;
    totalComments: number;
    totalActivities: number;
    totalViews: number;
    totalMessages: number;
  };
  users: AdminUserSummary[];
  recentComments: AdminGuestbookItem[];
  recentActivities: AdminActivityItem[];
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Admin Login Gate State
  const [loginUsername, setLoginUsername] = useState('kevin');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Tab & Filters
  const [activeTab, setActiveTab] = useState<'users' | 'comments' | 'activities'>('users');
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'custom' | 'admins' | 'no-email'>('all');
  const [commentSearch, setCommentSearch] = useState('');

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<AdminUserSummary | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editNewPassword, setEditNewPassword] = useState('');
  const [savingUser, setSavingUser] = useState(false);

  const showToastMessage = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin');
      if (res.status === 401 || res.status === 403) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to load admin dashboard.');
      }
      const data = (await res.json()) as AdminDashboardData;
      setDashboard(data);
      setAuthorized(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword) return;
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername.trim().toLowerCase(),
          password: loginPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Invalid credentials.');
        setLoginLoading(false);
        return;
      }
      setLoginPassword('');
      await fetchDashboard();
    } catch {
      setLoginError('Network error during login.');
    } finally {
      setLoginLoading(false);
    }
  };

  const openEditUserModal = (user: AdminUserSummary) => {
    setEditingUser(user);
    setEditEmail(user.email || '');
    setEditDisplayName(user.displayName || user.username);
    setEditIsAdmin(user.isAdmin);
    setEditNewPassword('');
  };

  const handleSaveUserChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingUser(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editingUser.username,
          email: editEmail.trim().toLowerCase(),
          displayName: editDisplayName.trim(),
          isAdmin: editIsAdmin,
          newPassword: editNewPassword.trim() || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update user.');
        setSavingUser(false);
        return;
      }
      showToastMessage(`Updated account settings for @${editingUser.username}`);
      setEditingUser(null);
      await fetchDashboard();
    } catch {
      alert('Network error updating user.');
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (username.toLowerCase() === 'kevin') {
      alert('Primary platform admin @kevin cannot be deleted.');
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to permanently delete @${username} and all their guestbook entries?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/admin?type=user&username=${encodeURIComponent(username)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete user.');
        return;
      }
      showToastMessage(`Deleted profile @${username}`);
      await fetchDashboard();
    } catch {
      alert('Network error deleting user.');
    }
  };

  const handleDeleteComment = async (profileUsername: string, commentId: string) => {
    try {
      const res = await fetch(
        `/api/admin?type=comment&username=${encodeURIComponent(profileUsername)}&id=${encodeURIComponent(commentId)}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        showToastMessage(`Deleted guestbook comment on @${profileUsername}`);
        await fetchDashboard();
      }
    } catch {
      alert('Failed to delete comment.');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      const res = await fetch(
        `/api/admin?type=activity&id=${encodeURIComponent(activityId)}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        showToastMessage('Removed activity feed entry');
        await fetchDashboard();
      }
    } catch {
      alert('Failed to delete activity.');
    }
  };

  const filteredUsers = (dashboard?.users || []).filter((u) => {
    const q = userSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.username.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (userFilter === 'custom') return !u.isSeeded;
    if (userFilter === 'admins') return u.isAdmin;
    if (userFilter === 'no-email') return !u.email;
    return true;
  });

  const filteredComments = (dashboard?.recentComments || []).filter((c) => {
    const q = commentSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      c.author.toLowerCase().includes(q) ||
      c.profileUsername.toLowerCase().includes(q) ||
      c.contentHtml.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <PlatformNavbar currentUsername="kevin" />

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && !dashboard ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-400">
              Verifying platform administrator credentials...
            </p>
          </div>
        ) : !authorized ? (
          /* ADMIN AUTHENTICATION GATE */
          <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  Restricted Area
                </span>
                <h1 className="text-xl font-black text-white mt-1">
                  Teramee Admin Console
                </h1>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Sign in with your administrator account (<code className="text-amber-300 font-mono">@kevin</code> / <code className="text-cyan-300 font-mono">kevingkday@gmail.com</code>) to manage registered handles, member emails, passwords, and guestbook moderation.
            </p>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Admin Handle
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading || !loginPassword}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Unlock className="w-4 h-4" />
                <span>{loginLoading ? 'Authenticating...' : 'Unlock Admin Dashboard'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* MAIN ADMIN DASHBOARD */
          <div className="space-y-8">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>PLATFORM ADMINISTRATOR: @{dashboard?.adminUser}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Teramee Control Center
                </h1>
                <p className="text-xs text-slate-400">
                  Manage registered members, email addresses, passwords, guestbook blurbs, and global activity.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={fetchDashboard}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
                  <span>Refresh</span>
                </button>
                <Link
                  href="/technology"
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Tech &amp; Sandbox Docs</span>
                </Link>
                <Link
                  href="/editor?user=kevin"
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>@kevin Studio</span>
                </Link>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Total Profiles</span>
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-black text-white">
                  {dashboard?.stats.totalUsers ?? 0}
                </div>
                <div className="text-[11px] text-emerald-400 font-mono">
                  {dashboard?.stats.customUsers ?? 0} custom claimed
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Guestbook Blurbs</span>
                  <MessageSquare className="w-4 h-4 text-pink-400" />
                </div>
                <div className="text-2xl font-black text-white">
                  {dashboard?.stats.totalComments ?? 0}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Across all walls
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Activity Events</span>
                  <Activity className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white">
                  {dashboard?.stats.totalActivities ?? 0}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  The Retro Wall
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Profile Views</span>
                  <Eye className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white">
                  {dashboard?.stats.totalViews ?? 0}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Visitor tracks
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Direct Messages</span>
                  <Mail className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-black text-white">
                  {dashboard?.stats.totalMessages ?? 0}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Inbox messages
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Members &amp; Emails ({dashboard?.users.length ?? 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('comments')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                  activeTab === 'comments'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Guestbook Moderation ({dashboard?.recentComments.length ?? 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('activities')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                  activeTab === 'activities'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Activity Log ({dashboard?.recentActivities.length ?? 0})</span>
              </button>
            </div>

            {/* TAB 1: MEMBERS & ACCOUNTS */}
            {activeTab === 'users' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {/* Search & Filter Bar */}
                <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search by @handle, display name, or email..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {(
                      [
                        { id: 'all', label: 'All Members' },
                        { id: 'custom', label: 'Custom Claimed' },
                        { id: 'admins', label: 'Admins' },
                        { id: 'no-email', label: 'No Email Set' }
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setUserFilter(f.id)}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                          userFilter === f.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Members Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono uppercase text-slate-400">
                        <th className="py-3 px-4">Member</th>
                        <th className="py-3 px-4">Email Address</th>
                        <th className="py-3 px-4">Role &amp; Auth</th>
                        <th className="py-3 px-4">Profile Stats</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 text-xs">
                      {filteredUsers.map((u) => (
                        <tr key={u.username} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={
                                  u.avatarUrl ||
                                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                                }
                                alt={u.displayName}
                                className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{u.displayName}</span>
                                  {!u.isSeeded && (
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[9px] font-mono">
                                      CLAIMED
                                    </span>
                                  )}
                                </div>
                                <Link
                                  href={`/user/${u.username}`}
                                  className="text-cyan-400 hover:underline font-mono text-[11px]"
                                >
                                  @{u.username}
                                </Link>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono">
                            {u.email ? (
                              <span className="text-slate-200">{u.email}</span>
                            ) : (
                              <span className="text-slate-500 italic">Not set</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {u.isAdmin ? (
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold">
                                  ★ ADMIN
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-mono">
                                  MEMBER
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 ${
                                  u.hasPassword
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}
                              >
                                <Lock className="w-2.5 h-2.5" />
                                {u.hasPassword ? 'Custom PW' : 'Demo PW'}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                              <span title="Polaroid Photos" className="flex items-center gap-1">
                                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                                {u.photoCount}
                              </span>
                              <span title="Guestbook Comments" className="flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
                                {u.guestbookCount}
                              </span>
                              {u.songTitle && (
                                <span
                                  title={`${u.songTitle} - ${u.songArtist}`}
                                  className="hidden md:flex items-center gap-1 text-slate-300 truncate max-w-[160px]"
                                >
                                  <Music className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                  <span className="truncate">{u.songTitle}</span>
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditUserModal(u)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Edit Email, Role, or Reset Password"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                                <span>Manage</span>
                              </button>

                              <Link
                                href={`/editor?user=${u.username}`}
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
                                title="Open in Theme Studio (Admin Override)"
                              >
                                <Palette className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Studio</span>
                              </Link>

                              {u.username.toLowerCase() !== 'kevin' && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u.username)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/25 text-rose-400 transition-colors cursor-pointer"
                                  title={`Delete @${u.username}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: GUESTBOOK MODERATION */}
            {activeTab === 'comments' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      Global Guestbook Wall Moderation
                    </h2>
                    <p className="text-xs text-slate-400">
                      Review and remove spam or unwanted blurbs across any member profile.
                    </p>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={commentSearch}
                      onChange={(e) => setCommentSearch(e.target.value)}
                      placeholder="Filter comments..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="divide-y divide-slate-800">
                  {filteredComments.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-500">
                      No guestbook comments match your filter.
                    </div>
                  ) : (
                    filteredComments.map((c) => (
                      <div
                        key={c.id}
                        className="py-3.5 flex items-start justify-between gap-4"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              c.avatarUrl ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                            }
                            alt={c.author}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0 mt-0.5"
                          />
                          <div className="min-w-0 space-y-1">
                            <div className="text-xs flex flex-wrap items-center gap-1.5">
                              <span className="font-bold text-white">{c.author}</span>
                              <span className="text-slate-500">posted on</span>
                              <Link
                                href={`/user/${c.profileUsername}`}
                                className="font-mono text-cyan-400 hover:underline font-semibold"
                              >
                                @{c.profileUsername}
                              </Link>
                              <span className="text-[10px] font-mono text-slate-500">
                                • {c.timestamp}
                              </span>
                            </div>
                            <div
                              className="text-xs text-slate-300 break-words"
                              dangerouslySetInnerHTML={{ __html: c.contentHtml }}
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c.profileUsername, c.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ACTIVITY LOG */}
            {activeTab === 'activities' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-5">
                <div>
                  <h2 className="text-sm font-bold text-white">
                    Global Retro Wall Activity Stream
                  </h2>
                  <p className="text-xs text-slate-400">
                    Manage recent activity events shown on the home and profile feeds.
                  </p>
                </div>

                <div className="divide-y divide-slate-800">
                  {(dashboard?.recentActivities || []).map((act) => (
                    <div
                      key={act.id}
                      className="py-3 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-cyan-300 shrink-0">
                          {act.actionType}
                        </span>
                        <div className="truncate">
                          <Link
                            href={`/user/${act.actorUsername}`}
                            className="font-bold text-white hover:text-cyan-300 font-mono"
                          >
                            @{act.actorUsername}
                          </Link>{' '}
                          <span className="text-slate-300">{act.summary}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteActivity(act.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 shrink-0 transition-colors cursor-pointer"
                        title="Remove activity from feed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={editingUser.avatarUrl}
                  alt={editingUser.displayName}
                  className="w-9 h-9 rounded-lg object-cover border border-slate-700"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Manage @{editingUser.username}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Account Email, Role &amp; Password Reset
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUserChanges} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Account Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Reset Owner Password (Optional)
                </label>
                <input
                  type="password"
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  placeholder="Leave blank to keep existing password"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {editingUser.username.toLowerCase() !== 'kevin' && (
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsAdmin}
                    onChange={(e) => setEditIsAdmin(e.target.checked)}
                    className="rounded border-slate-700"
                  />
                  <div>
                    <div className="text-xs font-bold text-amber-300">
                      Grant Platform Admin Role
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Allows @{editingUser.username} to access /admin and moderate content.
                    </div>
                  </div>
                </label>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {savingUser ? 'Saving...' : 'Save Account Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

