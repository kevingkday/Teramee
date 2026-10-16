// Database operations for Cloudflare D1
import { UserProfile, GuestbookEntry } from '../src/lib/types';
import { D1Database } from './schema';
import { sanitizeAndScopeCss } from '../src/lib/sanitize-css';
import { sanitizeUserHtml } from '../src/lib/sanitize-html';

import { THEME_PRESETS } from '../src/lib/presets';

interface ProfileRow {
  username: string;
  display_name: string;
  headline: string;
  tagline: string;
  mood: string;
  avatar_url: string;
  banner_url: string;
  bio_html: string;
  interests_html: string;
  song_title: string;
  song_artist: string;
  song_audio_url: string;
  media_type?: string;
  media_url?: string;
  tokens_json: string;
  layout_json: string;
  raw_css: string;
  top_friends_json: string;
  password_hash?: string;
  updated_at: string;
}

interface GuestbookRow {
  id: string;
  username: string;
  author: string;
  avatar_url: string;
  timestamp: string;
  content_html: string;
  created_at: string;
}

export async function getProfileFromDb(
  db: D1Database,
  username: string
): Promise<UserProfile | null> {
  const normalized = username.toLowerCase().trim();

  // 1. Fetch profile record
  const profileRow = await db
    .prepare('SELECT * FROM profiles WHERE username = ? LIMIT 1')
    .bind(normalized)
    .first<ProfileRow>();

  if (!profileRow) return null;

  // 2. Fetch guestbook entries
  const guestbookResult = await db
    .prepare('SELECT * FROM guestbook_entries WHERE username = ? ORDER BY created_at DESC')
    .bind(normalized)
    .all<GuestbookRow>();

  const guestbook: GuestbookEntry[] = (guestbookResult.results || []).map((row) => ({
    id: row.id,
    author: row.author,
    avatarUrl: row.avatar_url,
    timestamp: row.timestamp,
    contentHtml: row.content_html
  }));

  // 3. Assemble and parse JSON columns
  try {
    return {
      username: profileRow.username,
      displayName: profileRow.display_name,
      headline: profileRow.headline || '',
      tagline: profileRow.tagline || '',
      mood: profileRow.mood || 'neutral',
      avatarUrl: profileRow.avatar_url || '',
      bannerUrl: profileRow.banner_url || '',
      bioHtml: profileRow.bio_html || '',
      interestsHtml: profileRow.interests_html || '',
      songTitle: profileRow.song_title || '',
      songArtist: profileRow.song_artist || '',
      songAudioUrl: profileRow.song_audio_url || '',
      mediaType: (profileRow.media_type as 'retro-cassette' | 'spotify' | 'youtube' | 'audio') || 'retro-cassette',
      mediaUrl: profileRow.media_url || '',
      tokens: JSON.parse(profileRow.tokens_json || '{}'),
      layout: JSON.parse(profileRow.layout_json || '[]'),
      rawCss: profileRow.raw_css || '',
      topFriends: JSON.parse(profileRow.top_friends_json || '[]'),
      guestbook,
      updatedAt: profileRow.updated_at
    };
  } catch (err) {
    console.error('Error parsing profile JSON fields:', err);
    return null;
  }
}

export async function saveProfileToDb(
  db: D1Database,
  profile: UserProfile
): Promise<UserProfile> {
  const normalized = profile.username.toLowerCase().trim();

  // Server-side sanitization
  const sanitizedBio = sanitizeUserHtml(profile.bioHtml || '');
  const sanitizedInterests = sanitizeUserHtml(profile.interestsHtml || '');
  const sanitizedHeadline = sanitizeUserHtml(profile.headline || '');
  const sanitizedTagline = sanitizeUserHtml(profile.tagline || '');
  const updatedAt = new Date().toISOString();

  await db
    .prepare(`
      INSERT INTO profiles (
        username, display_name, headline, tagline, mood,
        avatar_url, banner_url, bio_html, interests_html,
        song_title, song_artist, song_audio_url,
        media_type, media_url,
        tokens_json, layout_json, raw_css, top_friends_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(username) DO UPDATE SET
        display_name = excluded.display_name,
        headline = excluded.headline,
        tagline = excluded.tagline,
        mood = excluded.mood,
        avatar_url = excluded.avatar_url,
        banner_url = excluded.banner_url,
        bio_html = excluded.bio_html,
        interests_html = excluded.interests_html,
        song_title = excluded.song_title,
        song_artist = excluded.song_artist,
        song_audio_url = excluded.song_audio_url,
        media_type = excluded.media_type,
        media_url = excluded.media_url,
        tokens_json = excluded.tokens_json,
        layout_json = excluded.layout_json,
        raw_css = excluded.raw_css,
        top_friends_json = excluded.top_friends_json,
        updated_at = excluded.updated_at
    `)
    .bind(
      normalized,
      profile.displayName,
      sanitizedHeadline,
      sanitizedTagline,
      profile.mood,
      profile.avatarUrl,
      profile.bannerUrl || '',
      sanitizedBio,
      sanitizedInterests,
      profile.songTitle || '',
      profile.songArtist || '',
      profile.songAudioUrl || '',
      profile.mediaType || 'retro-cassette',
      profile.mediaUrl || '',
      JSON.stringify(profile.tokens),
      JSON.stringify(profile.layout),
      profile.rawCss || '',
      JSON.stringify(profile.topFriends),
      updatedAt
    )
    .run();

  const refreshed = await getProfileFromDb(db, normalized);
  return refreshed || profile;
}

export async function addGuestbookCommentToDb(
  db: D1Database,
  username: string,
  author: string,
  content: string,
  avatarUrl?: string
): Promise<GuestbookEntry> {
  const normalized = username.toLowerCase().trim();
  const sanitizedContent = sanitizeUserHtml(content);
  const entryId = `g_${Date.now()}`;
  const timestamp = 'Just now';
  const createdAt = new Date().toISOString();
  const authorName = author.trim() || 'Anonymous Visitor';
  const authorAvatar =
    avatarUrl ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';

  await db
    .prepare(`
      INSERT INTO guestbook_entries (
        id, username, author, avatar_url, timestamp, content_html, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      entryId,
      normalized,
      authorName,
      authorAvatar,
      timestamp,
      sanitizedContent,
      createdAt
    )
    .run();

  return {
    id: entryId,
    author: authorName,
    avatarUrl: authorAvatar,
    timestamp,
    contentHtml: sanitizedContent
  };
}

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = 'teramee_retro_salt_2006_';
  const data = enc.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const RESERVED_USERNAMES = new Set([
  'admin',
  'api',
  'editor',
  'user',
  'users',
  'signup',
  'login',
  'logout',
  'auth',
  'profile',
  'profiles',
  'settings',
  'sandbox',
  'help'
]);

export async function checkUsernameAvailability(
  db: D1Database,
  username: string
): Promise<{ available: boolean; reason?: string }> {
  const normalized = username.toLowerCase().trim();

  if (normalized.length < 3) {
    return { available: false, reason: 'Username must be at least 3 characters long.' };
  }
  if (normalized.length > 20) {
    return { available: false, reason: 'Username cannot exceed 20 characters.' };
  }
  if (!/^[a-z0-9_]+$/.test(normalized)) {
    return { available: false, reason: 'Username can only contain letters, numbers, and underscores.' };
  }
  if (RESERVED_USERNAMES.has(normalized)) {
    return { available: false, reason: 'This username is reserved.' };
  }

  const existing = await db
    .prepare('SELECT username FROM profiles WHERE username = ? LIMIT 1')
    .bind(normalized)
    .first<{ username: string }>();

  if (existing) {
    return { available: false, reason: 'Username is already taken. Try another!' };
  }

  return { available: true };
}

export interface RegisterUserParams {
  username: string;
  displayName: string;
  password?: string;
  presetId?: string;
}

export async function registerUserInDb(
  db: D1Database,
  params: RegisterUserParams
): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  const normalized = params.username.toLowerCase().trim();

  // 1. Validate username
  const check = await checkUsernameAvailability(db, normalized);
  if (!check.available) {
    return { success: false, error: check.reason };
  }

  // 2. Validate display name
  const displayName = (params.displayName || normalized).trim();
  if (displayName.length < 1 || displayName.length > 40) {
    return { success: false, error: 'Display name must be between 1 and 40 characters.' };
  }

  // 3. Hash password if provided
  let passwordHash = '';
  if (params.password) {
    if (params.password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }
    passwordHash = await hashPassword(params.password);
  }

  // 4. Resolve starting theme preset (default: classic-blue)
  const preset =
    THEME_PRESETS.find((p) => p.id === params.presetId) || THEME_PRESETS[0];

  const now = new Date().toISOString();

  // 5. Default nostalgic Top Friends with Tom as friend #1!
  const topFriends = [
    {
      id: 'tom',
      name: 'Tom',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      role: 'Platform Guide',
      status: 'online'
    }
  ];

  // 6. Default layout blocks
  const layout = [
    { id: 'bio', title: 'About Me & Interests', column: 'left', order: 1, visible: true },
    { id: 'interests', title: 'Details & Favorites', column: 'left', order: 2, visible: true },
    { id: 'mediaPlayer', title: 'Profile Track Player', column: 'right', order: 1, visible: true },
    { id: 'topConnections', title: `${displayName}'s Top Friends`, column: 'right', order: 2, visible: true },
    { id: 'guestbook', title: 'Friend Blurbs & Comments', column: 'right', order: 3, visible: true }
  ];

  const bioHtml = `<p><b>Hi! I'm ${sanitizeUserHtml(displayName)}.</b></p><p>Welcome to my brand new SpaceMy profile! I'm currently customizing my layout and picking my soundtrack.</p><p><i>"Thanks for stopping by, leave a comment below!"</i></p>`;
  const interestsHtml = `<p><b>General:</b> Retro web aesthetics, good music, discovering cool profiles</p>`;

  // 7. Insert profile into D1
  await db
    .prepare(`
      INSERT INTO profiles (
        username, display_name, headline, tagline, mood,
        avatar_url, banner_url, bio_html, interests_html,
        song_title, song_artist, song_audio_url,
        tokens_json, layout_json, raw_css, top_friends_json,
        password_hash, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      normalized,
      displayName,
      `${displayName} is in your extended network! ;-)`,
      'Welcome to my customized profile!',
      'excited',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
      bioHtml,
      interestsHtml,
      preset.id === 'scene-queen' ? 'Misery Business' : 'Such Great Heights',
      preset.id === 'scene-queen' ? 'Paramore' : 'The Postal Service',
      '',
      JSON.stringify(preset.tokens),
      JSON.stringify(layout),
      preset.sampleCss || '',
      JSON.stringify(topFriends),
      passwordHash,
      now
    )
    .run();

  // 8. Add Tom's welcome comment to the new user's guestbook
  const welcomeCommentId = `g_${Date.now()}`;
  await db
    .prepare(`
      INSERT INTO guestbook_entries (
        id, username, author, avatar_url, timestamp, content_html, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      welcomeCommentId,
      normalized,
      'Tom',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      'Just now',
      `Welcome to SpaceMy, ${displayName}! Thanks for joining. Customize your layout in the editor and don't hesitate to message me if you have any questions! :-)`,
      now
    )
    .run();

  const createdProfile = await getProfileFromDb(db, normalized);
  return { success: true, profile: createdProfile || undefined };
}

export async function verifyUserCredentials(
  db: D1Database,
  username: string,
  password: string
): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  const normalized = username.toLowerCase().trim();
  const row = await db
    .prepare('SELECT * FROM profiles WHERE username = ? LIMIT 1')
    .bind(normalized)
    .first<ProfileRow>();

  if (!row) {
    return { success: false, error: 'User does not exist.' };
  }

  // If account has no password set (demo accounts like tom), allow login
  if (!row.password_hash) {
    const profile = await getProfileFromDb(db, normalized);
    return { success: true, profile: profile || undefined };
  }

  const hash = await hashPassword(password);
  if (hash !== row.password_hash) {
    return { success: false, error: 'Incorrect password.' };
  }

  const profile = await getProfileFromDb(db, normalized);
  return { success: true, profile: profile || undefined };
}

export async function getRecentProfilesFromDb(
  db: D1Database,
  limit = 8
): Promise<Array<{ username: string; displayName: string; mood: string; avatarUrl: string }>> {
  const result = await db
    .prepare('SELECT username, display_name, mood, avatar_url FROM profiles ORDER BY updated_at DESC LIMIT ?')
    .bind(limit)
    .all<{ username: string; display_name: string; mood: string; avatar_url: string }>();

  return (result.results || []).map((r) => ({
    username: r.username,
    displayName: r.display_name,
    mood: r.mood,
    avatarUrl: r.avatar_url
  }));
}
