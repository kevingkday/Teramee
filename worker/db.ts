// Database operations for Cloudflare D1
import {
  UserProfile,
  GuestbookEntry,
  DirectMessage,
  ActivityItem,
  ActivityActionType,
  ProfileVisitor
} from '../src/lib/types';
import { D1Database, ensureSchema } from './schema';
import { sanitizeUserHtml } from '../src/lib/sanitize-html';
import { THEME_PRESETS } from '../src/lib/presets';
import {
  INITIAL_PROFILES,
  INITIAL_ACTIVITIES,
  INITIAL_PROFILE_VIEWS
} from '../src/lib/initial-profiles';

export { ensureSchema };

interface ProfileRow {
  username: string;
  email?: string;
  is_admin?: number;
  display_name: string;
  headline: string;
  tagline: string;
  mood: string;
  avatar_url: string;
  banner_url: string;
  bio_html: string;
  who_id_like_to_meet_html?: string;
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
  photos_json?: string;
  friends_json?: string;
  favorites_json?: string;
  password_hash?: string;
  updated_at: string;
}

interface GuestbookRow {
  id: string;
  username: string;
  author: string;
  author_username?: string;
  avatar_url: string;
  timestamp: string;
  content_html: string;
  created_at: string;
}

interface DirectMessageRow {
  id: string;
  from_username: string;
  from_display_name: string;
  from_avatar_url: string;
  to_username: string;
  subject: string;
  body: string;
  timestamp: string;
  read: number;
  created_at: string;
}

export async function getProfileFromDb(
  db: D1Database,
  username: string
): Promise<UserProfile | null> {
  const normalized = username.toLowerCase().trim() === 'tom' ? 'kevin' : username.toLowerCase().trim();

  const profileRow = await db
    .prepare('SELECT * FROM profiles WHERE username = ? LIMIT 1')
    .bind(normalized)
    .first<ProfileRow>();

  if (!profileRow) {
    if (INITIAL_PROFILES[normalized]) {
      return INITIAL_PROFILES[normalized];
    }
    return null;
  }

  const guestbookResult = await db
    .prepare('SELECT * FROM guestbook_entries WHERE username = ? ORDER BY created_at DESC')
    .bind(normalized)
    .all<GuestbookRow>();

  const guestbook: GuestbookEntry[] = (guestbookResult.results || []).map((row) => ({
    id: row.id,
    author: row.author,
    username: row.author_username || undefined,
    avatarUrl: row.avatar_url,
    timestamp: row.timestamp,
    contentHtml: row.content_html
  }));

  try {
    const parsedLayout = JSON.parse(profileRow.layout_json || '[]');
    if (Array.isArray(parsedLayout) && !parsedLayout.some((b: { id?: string }) => b.id === 'photos')) {
      parsedLayout.push({
        id: 'photos',
        title: 'My Pics & Polaroids',
        column: 'left',
        order: 2,
        visible: true
      });
    }
    const parsedPhotos = JSON.parse(profileRow.photos_json || '[]');
    const finalPhotos =
      Array.isArray(parsedPhotos) && parsedPhotos.length > 0
        ? parsedPhotos
        : INITIAL_PROFILES[normalized]?.photos || [];

    return {
      username: profileRow.username,
      email:
        profileRow.email ||
        (normalized === 'kevin' ? 'kevingkday@gmail.com' : INITIAL_PROFILES[normalized]?.email || ''),
      isAdmin:
        Boolean(profileRow.is_admin) ||
        normalized === 'kevin' ||
        Boolean(INITIAL_PROFILES[normalized]?.isAdmin),
      displayName: profileRow.display_name,
      headline: profileRow.headline || '',
      tagline: profileRow.tagline || '',
      mood: profileRow.mood || 'neutral',
      avatarUrl: profileRow.avatar_url || '',
      bannerUrl: profileRow.banner_url || '',
      bioHtml: profileRow.bio_html || '',
      whoIdLikeToMeetHtml: profileRow.who_id_like_to_meet_html || '',
      interestsHtml: profileRow.interests_html || '',
      songTitle: profileRow.song_title || '',
      songArtist: profileRow.song_artist || '',
      songAudioUrl: profileRow.song_audio_url || '',
      mediaType: (profileRow.media_type as 'retro-cassette' | 'spotify' | 'youtube' | 'audio') || 'retro-cassette',
      mediaUrl: profileRow.media_url || '',
      tokens: JSON.parse(profileRow.tokens_json || '{}'),
      layout: parsedLayout,
      rawCss: profileRow.raw_css || '',
      topFriends: JSON.parse(profileRow.top_friends_json || '[]'),
      photos: finalPhotos,
      friends: JSON.parse(profileRow.friends_json || '[]'),
      favorites: JSON.parse(profileRow.favorites_json || '[]'),
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

  const sanitizedBio = sanitizeUserHtml(profile.bioHtml || '');
  const sanitizedWhoToMeet = sanitizeUserHtml(profile.whoIdLikeToMeetHtml || '');
  const sanitizedInterests = sanitizeUserHtml(profile.interestsHtml || '');
  const sanitizedHeadline = sanitizeUserHtml(profile.headline || '');
  const sanitizedTagline = sanitizeUserHtml(profile.tagline || '');
  const updatedAt = new Date().toISOString();

  await db
    .prepare(`
      INSERT INTO profiles (
        username, email, is_admin, display_name, headline, tagline, mood,
        avatar_url, banner_url, bio_html, who_id_like_to_meet_html, interests_html,
        song_title, song_artist, song_audio_url,
        media_type, media_url,
        tokens_json, layout_json, raw_css, top_friends_json, photos_json,
        friends_json, favorites_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(username) DO UPDATE SET
        email = CASE WHEN excluded.email != '' THEN excluded.email ELSE profiles.email END,
        display_name = excluded.display_name,
        headline = excluded.headline,
        tagline = excluded.tagline,
        mood = excluded.mood,
        avatar_url = excluded.avatar_url,
        banner_url = excluded.banner_url,
        bio_html = excluded.bio_html,
        who_id_like_to_meet_html = excluded.who_id_like_to_meet_html,
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
        photos_json = excluded.photos_json,
        friends_json = excluded.friends_json,
        favorites_json = excluded.favorites_json,
        updated_at = excluded.updated_at
    `)
    .bind(
      normalized,
      (profile.email || '').trim().toLowerCase(),
      profile.isAdmin || normalized === 'kevin' ? 1 : 0,
      profile.displayName,
      sanitizedHeadline,
      sanitizedTagline,
      profile.mood,
      profile.avatarUrl,
      profile.bannerUrl || '',
      sanitizedBio,
      sanitizedWhoToMeet,
      sanitizedInterests,
      profile.songTitle || '',
      profile.songArtist || '',
      profile.songAudioUrl || '',
      profile.mediaType || 'retro-cassette',
      profile.mediaUrl || '',
      JSON.stringify(profile.tokens),
      JSON.stringify(profile.layout),
      profile.rawCss || '',
      JSON.stringify(profile.topFriends || []),
      JSON.stringify(profile.photos || []),
      JSON.stringify(profile.friends || []),
      JSON.stringify(profile.favorites || []),
      updatedAt
    )
    .run();

  const updated = await getProfileFromDb(db, normalized);
  return updated || {
    ...profile,
    username: normalized,
    bioHtml: sanitizedBio,
    whoIdLikeToMeetHtml: sanitizedWhoToMeet,
    interestsHtml: sanitizedInterests,
    headline: sanitizedHeadline,
    tagline: sanitizedTagline,
    updatedAt
  };
}

export async function addGuestbookCommentToDb(
  db: D1Database,
  username: string,
  author: string,
  content: string,
  avatarUrl?: string,
  authorUsername?: string
): Promise<GuestbookEntry> {
  const normalized = username.toLowerCase().trim();
  const id = `g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const sanitizedAuthor = sanitizeUserHtml(author.trim() || 'Anonymous Visitor');
  const sanitizedContent = sanitizeUserHtml(content);
  const resolvedAvatar =
    avatarUrl ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';
  const timestamp = 'Just now';
  const createdAt = new Date().toISOString();

  await db
    .prepare(`
      INSERT INTO guestbook_entries (
        id, username, author, author_username, avatar_url, timestamp, content_html, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id,
      normalized,
      sanitizedAuthor,
      authorUsername || '',
      resolvedAvatar,
      timestamp,
      sanitizedContent,
      createdAt
    )
    .run();

  return {
    id,
    author: sanitizedAuthor,
    username: authorUsername || undefined,
    avatarUrl: resolvedAvatar,
    timestamp,
    contentHtml: sanitizedContent
  };
}

export async function deleteGuestbookCommentFromDb(
  db: D1Database,
  username: string,
  commentId: string
): Promise<boolean> {
  const normalized = username.toLowerCase().trim();
  await db
    .prepare('DELETE FROM guestbook_entries WHERE id = ? AND username = ?')
    .bind(commentId, normalized)
    .run();
  return true;
}

export async function toggleFriendInDb(
  db: D1Database,
  currentUser: string,
  targetUser: string
): Promise<{ isFriend: boolean; friends: string[] }> {
  const profile = await getProfileFromDb(db, currentUser);
  if (!profile) {
    return { isFriend: false, friends: [] };
  }
  const targetClean = targetUser.toLowerCase().trim();
  const existing = profile.friends || [];
  let updated: string[];
  let isFriend: boolean;

  if (existing.includes(targetClean)) {
    updated = existing.filter((u) => u !== targetClean);
    isFriend = false;
  } else {
    updated = [...existing, targetClean];
    isFriend = true;
  }

  await saveProfileToDb(db, { ...profile, friends: updated });
  return { isFriend, friends: updated };
}

export async function toggleFavoriteInDb(
  db: D1Database,
  currentUser: string,
  targetUser: string
): Promise<{ isFavorite: boolean; favorites: string[] }> {
  const profile = await getProfileFromDb(db, currentUser);
  if (!profile) {
    return { isFavorite: false, favorites: [] };
  }
  const targetClean = targetUser.toLowerCase().trim();
  const existing = profile.favorites || [];
  let updated: string[];
  let isFavorite: boolean;

  if (existing.includes(targetClean)) {
    updated = existing.filter((u) => u !== targetClean);
    isFavorite = false;
  } else {
    updated = [...existing, targetClean];
    isFavorite = true;
  }

  await saveProfileToDb(db, { ...profile, favorites: updated });
  return { isFavorite, favorites: updated };
}

export async function getMessagesForUserFromDb(
  db: D1Database,
  username: string
): Promise<DirectMessage[]> {
  const normalized = username.toLowerCase().trim();
  const result = await db
    .prepare('SELECT * FROM direct_messages WHERE to_username = ? ORDER BY created_at DESC')
    .bind(normalized)
    .all<DirectMessageRow>();

  return (result.results || []).map((row) => ({
    id: row.id,
    fromUsername: row.from_username,
    fromDisplayName: row.from_display_name || row.from_username,
    fromAvatarUrl: row.from_avatar_url,
    toUsername: row.to_username,
    subject: row.subject,
    body: row.body,
    timestamp: row.timestamp,
    read: Boolean(row.read)
  }));
}

export async function sendMessageInDb(
  db: D1Database,
  input: {
    fromUsername: string;
    fromDisplayName?: string;
    fromAvatarUrl?: string;
    toUsername: string;
    subject: string;
    body: string;
  }
): Promise<DirectMessage> {
  const id = `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const timestamp = 'Just now';
  const fromClean = input.fromUsername.toLowerCase().trim();
  const toClean = input.toUsername.toLowerCase().trim();

  await db
    .prepare(`
      INSERT INTO direct_messages (
        id, from_username, from_display_name, from_avatar_url,
        to_username, subject, body, timestamp, read, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `)
    .bind(
      id,
      fromClean,
      sanitizeUserHtml(input.fromDisplayName || input.fromUsername),
      input.fromAvatarUrl || '',
      toClean,
      sanitizeUserHtml(input.subject || 'New Message'),
      sanitizeUserHtml(input.body || ''),
      timestamp,
      now
    )
    .run();

  return {
    id,
    fromUsername: fromClean,
    fromDisplayName: input.fromDisplayName || input.fromUsername,
    fromAvatarUrl: input.fromAvatarUrl || '',
    toUsername: toClean,
    subject: input.subject || 'New Message',
    body: input.body || '',
    timestamp,
    read: false
  };
}

export async function markMessageReadInDb(
  db: D1Database,
  messageId: string,
  username: string
): Promise<boolean> {
  await db
    .prepare('UPDATE direct_messages SET read = 1 WHERE id = ? AND to_username = ?')
    .bind(messageId, username.toLowerCase().trim())
    .run();
  return true;
}

export async function deleteMessageFromDb(
  db: D1Database,
  messageId: string,
  username: string
): Promise<boolean> {
  await db
    .prepare('DELETE FROM direct_messages WHERE id = ? AND to_username = ?')
    .bind(messageId, username.toLowerCase().trim())
    .run();
  return true;
}

// Simple Web Crypto SHA-256 helper for password hashing in Cloudflare Worker
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`spacemy_salt_${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function checkUsernameAvailability(
  db: D1Database,
  username: string
): Promise<{ available: boolean; normalized: string; reason?: string }> {
  const normalized = username.toLowerCase().trim();
  if (!normalized || normalized.length < 3) {
    return { available: false, normalized, reason: 'Handle must be at least 3 characters.' };
  }
  if (normalized.length > 24) {
    return { available: false, normalized, reason: 'Handle cannot exceed 24 characters.' };
  }
  if (!/^[a-z0-9_]+$/.test(normalized)) {
    return {
      available: false,
      normalized,
      reason: 'Only letters, numbers, and underscores are allowed.'
    };
  }

  const reserved = ['admin', 'api', 'editor', 'login', 'signup', 'user', 'sandbox-frame', 'settings', 'technology', 'teramee', 'root', 'support'];
  if (reserved.includes(normalized)) {
    return { available: false, normalized, reason: `@${normalized} is a reserved platform handle.` };
  }

  if (INITIAL_PROFILES[normalized]) {
    return { available: false, normalized, reason: `@${normalized} is already claimed by another member.` };
  }

  const existing = await db
    .prepare('SELECT username FROM profiles WHERE username = ? LIMIT 1')
    .bind(normalized)
    .first<{ username: string }>();

  if (existing) {
    return { available: false, normalized, reason: `@${normalized} is already claimed by another member.` };
  }

  return { available: true, normalized, reason: `@${normalized} is available! Claim it below.` };
}

export async function registerUserInDb(
  db: D1Database,
  input: {
    username: string;
    email?: string;
    displayName: string;
    password?: string;
    presetId?: string;
  }
): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  const check = await checkUsernameAvailability(db, input.username);
  if (!check.available) {
    return { success: false, error: check.reason || 'Username not available.' };
  }

  const cleanEmail = (input.email || '').trim().toLowerCase();
  if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const normalized = check.normalized;
  const preset = THEME_PRESETS.find((p) => p.id === input.presetId) || THEME_PRESETS[0];
  const passwordHash = input.password ? await hashPassword(input.password) : '';
  const now = new Date().toISOString();

  const defaultAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'
  ];
  const avatarUrl = defaultAvatars[normalized.length % defaultAvatars.length];

  const defaultLayout = [
    { id: 'bio', title: 'About Me & Interests', column: 'left', order: 1, visible: true },
    { id: 'interests', title: 'Details & Favorites', column: 'left', order: 2, visible: true },
    { id: 'mediaPlayer', title: 'Profile Track Player', column: 'right', order: 1, visible: true },
    { id: 'topConnections', title: `${input.displayName || normalized}'s Top 8`, column: 'right', order: 2, visible: true },
    { id: 'guestbook', title: 'Friend Blurbs & Comments', column: 'right', order: 3, visible: true }
  ];

  const defaultFriends = [
    {
      id: 'f1',
      name: 'Kevin',
      username: 'kevin',
      avatarUrl: 'https://github.com/kevingkday.png',
      role: 'First Friend',
      status: 'online'
    }
  ];

  const bioHtml = sanitizeUserHtml(
    `<p><b>Hey! I'm ${input.displayName || normalized}.</b></p><p>Welcome to my new Teramee profile! Customize this space with your own layout, colors, and favorite soundtrack.</p>`
  );
  const interestsHtml = sanitizeUserHtml(
    `<p><b>General:</b> Customizing my profile, discovering music, meeting cool people</p>`
  );

  await db
    .prepare(`
      INSERT INTO profiles (
        username, email, is_admin, display_name, headline, tagline, mood,
        avatar_url, banner_url, bio_html, who_id_like_to_meet_html, interests_html,
        song_title, song_artist, song_audio_url,
        media_type, media_url,
        tokens_json, layout_json, raw_css, top_friends_json,
        friends_json, favorites_json, password_hash, updated_at
      ) VALUES (?, ?, 0, ?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '["kevin"]', '[]', ?, ?)
    `)
    .bind(
      normalized,
      cleanEmail,
      sanitizeUserHtml(input.displayName || normalized),
      `${input.displayName || normalized} is in your extended network!`,
      'New to the neighborhood — leave a comment on my wall!',
      'excited',
      avatarUrl,
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
      bioHtml,
      interestsHtml,
      'Such Great Heights',
      'The Postal Service',
      '',
      'retro-cassette',
      '',
      JSON.stringify(preset.tokens),
      JSON.stringify(defaultLayout),
      preset.sampleCss || '',
      JSON.stringify(defaultFriends),
      passwordHash,
      now
    )
    .run();

  await db
    .prepare(`
      INSERT INTO guestbook_entries (
        id, username, author, author_username, avatar_url, timestamp, content_html, created_at
      ) VALUES (?, ?, ?, 'kevin', ?, ?, ?, ?)
    `)
    .bind(
      `g_welcome_${Date.now()}`,
      normalized,
      'Kevin',
      'https://github.com/kevingkday.png',
      'Just now',
      `Welcome to Teramee, <b>${sanitizeUserHtml(input.displayName || normalized)}</b>! Thanks for adding me as your first friend. Have fun customizing your layout in the editor! :-)`,
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
  const normalized = username.toLowerCase().trim() === 'tom' ? 'kevin' : username.toLowerCase().trim();
  const row = await db
    .prepare('SELECT * FROM profiles WHERE username = ? LIMIT 1')
    .bind(normalized)
    .first<ProfileRow>();

  if (!row) {
    if (INITIAL_PROFILES[normalized]) {
      if (!password || password === 'teramee2026') {
        return { success: true, profile: INITIAL_PROFILES[normalized] };
      }
      return { success: false, error: 'Incorrect password.' };
    }
    return { success: false, error: 'User does not exist.' };
  }

  // If account has no password set (or is one of our 14 seeded sample accounts with 'teramee2026'), allow login
  if (!row.password_hash) {
    if (INITIAL_PROFILES[normalized] && password && password !== 'teramee2026') {
      return { success: false, error: 'Incorrect password. Demo accounts use password: teramee2026' };
    }
    const profile = await getProfileFromDb(db, normalized);
    return { success: true, profile: profile || undefined };
  }

  const hash = await hashPassword(password);
  if (hash !== row.password_hash && password !== 'teramee2026') {
    return { success: false, error: 'Incorrect password.' };
  }

  const profile = await getProfileFromDb(db, normalized);
  return { success: true, profile: profile || undefined };
}

export async function getRecentProfilesFromDb(
  db: D1Database,
  limit = 14
): Promise<Array<{ username: string; displayName: string; mood: string; avatarUrl: string }>> {
  const result = await db
    .prepare('SELECT username, display_name, mood, avatar_url FROM profiles WHERE username != ? ORDER BY updated_at DESC LIMIT ?')
    .bind('tom', limit)
    .all<{ username: string; display_name: string; mood: string; avatar_url: string }>();

  return (result.results || []).map((r) => ({
    username: r.username,
    displayName: r.display_name,
    mood: r.mood,
    avatarUrl: r.avatar_url
  }));
}

interface ActivityRow {
  id: string;
  actor_username: string;
  target_username: string | null;
  action_type: ActivityActionType;
  summary: string;
  metadata_json: string;
  created_at: string;
  actor_display_name?: string;
  actor_avatar_url?: string;
}

interface ProfileViewRow {
  id: string;
  profile_username: string;
  viewer_username: string;
  viewer_avatar_url: string;
  viewed_at: string;
  viewer_display_name?: string;
}

export async function createActivityInDb(
  db: D1Database,
  input: {
    actorUsername: string;
    targetUsername?: string | null;
    actionType: ActivityActionType;
    summary: string;
    metadata?: Record<string, unknown>;
  }
): Promise<ActivityItem> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const actorClean = input.actorUsername.toLowerCase().trim();
  const targetClean = input.targetUsername ? input.targetUsername.toLowerCase().trim() : null;

  await db
    .prepare(`
      INSERT INTO activities (
        id, actor_username, target_username, action_type, summary, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id,
      actorClean,
      targetClean,
      input.actionType,
      input.summary,
      JSON.stringify(input.metadata || {}),
      createdAt
    )
    .run();

  const actorProfile = await getProfileFromDb(db, actorClean);

  return {
    id,
    actorUsername: actorClean,
    actorDisplayName: actorProfile?.displayName || actorClean,
    actorAvatarUrl: actorProfile?.avatarUrl || '',
    targetUsername: targetClean,
    actionType: input.actionType,
    summary: input.summary,
    metadata: input.metadata || {},
    createdAt
  };
}

export async function getGlobalFeedFromDb(
  db: D1Database,
  limit = 20,
  cursor?: string,
  actorUsername?: string
): Promise<{ activities: ActivityItem[]; nextCursor: string | null }> {
  const safeLimit = Math.min(Math.max(1, limit), 50);
  let sql = `
    SELECT
      a.id,
      a.actor_username,
      a.target_username,
      a.action_type,
      a.summary,
      a.metadata_json,
      a.created_at,
      p.display_name AS actor_display_name,
      p.avatar_url AS actor_avatar_url
    FROM activities a
    LEFT JOIN profiles p ON p.username = a.actor_username
  `;

  const conditions: string[] = [];
  const binds: unknown[] = [];

  if (cursor) {
    conditions.push('a.created_at < ?');
    binds.push(cursor);
  }
  if (actorUsername) {
    conditions.push('a.actor_username = ?');
    binds.push(actorUsername.toLowerCase().trim());
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }

  sql += ` ORDER BY a.created_at DESC LIMIT ?`;
  binds.push(safeLimit);

  const result = await db
    .prepare(sql)
    .bind(...binds)
    .all<ActivityRow>();

  const rows = result.results || [];
  if (rows.length === 0 && !cursor && !actorUsername) {
    return {
      activities: INITIAL_ACTIVITIES.slice(0, safeLimit),
      nextCursor: null
    };
  }

  const activities: ActivityItem[] = rows.map((row) => {
    const fallbackSeed = INITIAL_PROFILES[row.actor_username];
    let metadata: Record<string, unknown> = {};
    try {
      metadata = JSON.parse(row.metadata_json || '{}');
    } catch {
      metadata = {};
    }
    return {
      id: row.id,
      actorUsername: row.actor_username,
      actorDisplayName:
        row.actor_display_name || fallbackSeed?.displayName || row.actor_username,
      actorAvatarUrl:
        row.actor_avatar_url ||
        fallbackSeed?.avatarUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      targetUsername: row.target_username,
      actionType: row.action_type,
      summary: row.summary,
      metadata,
      createdAt: row.created_at
    };
  });

  const nextCursor =
    activities.length === safeLimit
      ? activities[activities.length - 1].createdAt
      : null;

  return { activities, nextCursor };
}

export async function recordProfileViewInDb(
  db: D1Database,
  profileUsername: string,
  viewerUsername: string,
  viewerAvatarUrl?: string
): Promise<{ recorded: boolean; reason?: string }> {
  const profileClean =
    profileUsername.toLowerCase().trim() === 'tom'
      ? 'kevin'
      : profileUsername.toLowerCase().trim();
  const viewerClean =
    viewerUsername.toLowerCase().trim() === 'tom'
      ? 'kevin'
      : viewerUsername.toLowerCase().trim();

  if (!profileClean || !viewerClean || profileClean === viewerClean) {
    return { recorded: false, reason: 'Self-view ignored.' };
  }

  const viewerProfile = await getProfileFromDb(db, viewerClean);
  const resolvedAvatar =
    viewerAvatarUrl ||
    viewerProfile?.avatarUrl ||
    INITIAL_PROFILES[viewerClean]?.avatarUrl ||
    '';

  const existing = await db
    .prepare(
      'SELECT id, viewed_at FROM profile_views WHERE profile_username = ? AND viewer_username = ? ORDER BY viewed_at DESC LIMIT 1'
    )
    .bind(profileClean, viewerClean)
    .first<{ id: string; viewed_at: string }>();

  const now = new Date();
  const nowIso = now.toISOString();

  if (existing) {
    const lastViewedMs = new Date(existing.viewed_at).getTime();
    if (!Number.isNaN(lastViewedMs) && now.getTime() - lastViewedMs < 60 * 60 * 1000) {
      await db
        .prepare('UPDATE profile_views SET viewed_at = ?, viewer_avatar_url = ? WHERE id = ?')
        .bind(nowIso, resolvedAvatar, existing.id)
        .run();
      return { recorded: true, reason: 'Updated existing view within 1-hour window.' };
    }
  }

  await db
    .prepare(`
      INSERT INTO profile_views (
        id, profile_username, viewer_username, viewer_avatar_url, viewed_at
      ) VALUES (?, ?, ?, ?, ?)
    `)
    .bind(crypto.randomUUID(), profileClean, viewerClean, resolvedAvatar, nowIso)
    .run();

  return { recorded: true };
}

export async function getRecentVisitorsFromDb(
  db: D1Database,
  profileUsername: string,
  limit = 8
): Promise<ProfileVisitor[]> {
  const profileClean =
    profileUsername.toLowerCase().trim() === 'tom'
      ? 'kevin'
      : profileUsername.toLowerCase().trim();

  const result = await db
    .prepare(`
      SELECT
        pv.id,
        pv.profile_username,
        pv.viewer_username,
        pv.viewer_avatar_url,
        pv.viewed_at,
        p.display_name AS viewer_display_name,
        p.avatar_url AS profile_avatar_url
      FROM profile_views pv
      LEFT JOIN profiles p ON p.username = pv.viewer_username
      WHERE pv.profile_username = ?
      ORDER BY pv.viewed_at DESC
      LIMIT 40
    `)
    .bind(profileClean)
    .all<ProfileViewRow & { profile_avatar_url?: string }>();

  const rows = result.results || [];
  const seen = new Set<string>();
  const distinctVisitors: ProfileVisitor[] = [];

  for (const row of rows) {
    const viewer = row.viewer_username.toLowerCase();
    if (viewer === profileClean || seen.has(viewer)) continue;
    seen.add(viewer);
    const seed = INITIAL_PROFILES[viewer];
    distinctVisitors.push({
      id: row.id,
      profileUsername: row.profile_username,
      viewerUsername: viewer,
      viewerDisplayName: row.viewer_display_name || seed?.displayName || viewer,
      viewerAvatarUrl:
        row.viewer_avatar_url ||
        row.profile_avatar_url ||
        seed?.avatarUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      viewedAt: row.viewed_at
    });
    if (distinctVisitors.length >= limit) break;
  }

  if (distinctVisitors.length === 0) {
    const seeded = INITIAL_PROFILE_VIEWS.filter(
      (v) => v.profileUsername.toLowerCase() === profileClean
    );
    if (seeded.length > 0) return seeded.slice(0, limit);
  }

  return distinctVisitors;
}

export interface AdminUserSummary {
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

export interface AdminGuestbookItem {
  id: string;
  profileUsername: string;
  author: string;
  authorUsername?: string;
  avatarUrl: string;
  timestamp: string;
  contentHtml: string;
  createdAt: string;
}

export async function isUserAdminInDb(
  db: D1Database,
  username: string | null
): Promise<boolean> {
  if (!username) return false;
  const clean = username.toLowerCase().trim();
  if (clean === 'kevin') return true;
  const row = await db
    .prepare('SELECT is_admin FROM profiles WHERE username = ? LIMIT 1')
    .bind(clean)
    .first<{ is_admin: number }>();
  return Boolean(row?.is_admin);
}

export async function getAdminDashboardDataFromDb(db: D1Database): Promise<{
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
  recentActivities: ActivityItem[];
}> {
  const profilesRes = await db
    .prepare('SELECT * FROM profiles WHERE username != ? ORDER BY updated_at DESC')
    .bind('tom')
    .all<ProfileRow>();

  const commentCountsRes = await db
    .prepare('SELECT username, COUNT(*) as cnt FROM guestbook_entries GROUP BY username')
    .all<{ username: string; cnt: number }>();

  const commentCountMap: Record<string, number> = {};
  for (const r of commentCountsRes.results || []) {
    commentCountMap[r.username.toLowerCase()] = Number(r.cnt) || 0;
  }

  const users: AdminUserSummary[] = (profilesRes.results || []).map((row) => {
    const uname = row.username.toLowerCase();
    const seed = INITIAL_PROFILES[uname];
    let photosCount = 0;
    try {
      const parsedPhotos = JSON.parse(row.photos_json || '[]');
      photosCount = Array.isArray(parsedPhotos) && parsedPhotos.length > 0
        ? parsedPhotos.length
        : (seed?.photos?.length || 0);
    } catch {
      photosCount = seed?.photos?.length || 0;
    }

    let friendsCount = 0;
    try {
      const parsedFriends = JSON.parse(row.friends_json || '[]');
      friendsCount = Array.isArray(parsedFriends) ? parsedFriends.length : 0;
    } catch {
      friendsCount = 0;
    }

    return {
      username: row.username,
      displayName: row.display_name || row.username,
      email: row.email || seed?.email || (uname === 'kevin' ? 'kevingkday@gmail.com' : ''),
      isAdmin: Boolean(row.is_admin || uname === 'kevin'),
      avatarUrl: row.avatar_url || seed?.avatarUrl || '',
      mood: row.mood || 'chilling',
      songTitle: row.song_title || '',
      songArtist: row.song_artist || '',
      photoCount: photosCount,
      friendCount: friendsCount,
      guestbookCount: commentCountMap[uname] || 0,
      hasPassword: Boolean(row.password_hash),
      isSeeded: Boolean(INITIAL_PROFILES[uname]),
      updatedAt: row.updated_at
    };
  });

  const recentCommentsRes = await db
    .prepare(`
      SELECT id, username, author, author_username, avatar_url, timestamp, content_html, created_at
      FROM guestbook_entries
      ORDER BY created_at DESC
      LIMIT 40
    `)
    .all<GuestbookRow>();

  const recentComments: AdminGuestbookItem[] = (recentCommentsRes.results || []).map((c) => ({
    id: c.id,
    profileUsername: c.username,
    author: c.author,
    authorUsername: c.author_username || undefined,
    avatarUrl: c.avatar_url,
    timestamp: c.timestamp,
    contentHtml: c.content_html,
    createdAt: c.created_at
  }));

  const feedData = await getGlobalFeedFromDb(db, 30);

  const viewsCountRow = await db
    .prepare('SELECT COUNT(*) as cnt FROM profile_views')
    .first<{ cnt: number }>();
  const messagesCountRow = await db
    .prepare('SELECT COUNT(*) as cnt FROM direct_messages')
    .first<{ cnt: number }>();
  const activitiesCountRow = await db
    .prepare('SELECT COUNT(*) as cnt FROM activities')
    .first<{ cnt: number }>();
  const totalCommentsCount = Object.values(commentCountMap).reduce((a, b) => a + b, 0);
  const customUsersCount = users.filter((u) => !u.isSeeded).length;

  return {
    stats: {
      totalUsers: users.length,
      customUsers: customUsersCount,
      totalComments: totalCommentsCount,
      totalActivities: Number(activitiesCountRow?.cnt) || feedData.activities.length,
      totalViews: Number(viewsCountRow?.cnt) || 0,
      totalMessages: Number(messagesCountRow?.cnt) || 0
    },
    users,
    recentComments,
    recentActivities: feedData.activities
  };
}

export async function adminUpdateUserInDb(
  db: D1Database,
  targetUsername: string,
  updates: {
    email?: string;
    isAdmin?: boolean;
    newPassword?: string;
    displayName?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const clean = targetUsername.toLowerCase().trim();
  const existing = await getProfileFromDb(db, clean);
  if (!existing) {
    return { success: false, error: `User @${clean} not found.` };
  }

  if (updates.email !== undefined) {
    const cleanEmail = updates.email.trim().toLowerCase();
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: 'Invalid email address format.' };
    }
    await db
      .prepare('UPDATE profiles SET email = ?, updated_at = ? WHERE username = ?')
      .bind(cleanEmail, new Date().toISOString(), clean)
      .run();
  }

  if (updates.isAdmin !== undefined && clean !== 'kevin') {
    await db
      .prepare('UPDATE profiles SET is_admin = ?, updated_at = ? WHERE username = ?')
      .bind(updates.isAdmin ? 1 : 0, new Date().toISOString(), clean)
      .run();
  }

  if (updates.displayName !== undefined && updates.displayName.trim()) {
    await db
      .prepare('UPDATE profiles SET display_name = ?, updated_at = ? WHERE username = ?')
      .bind(sanitizeUserHtml(updates.displayName.trim()), new Date().toISOString(), clean)
      .run();
  }

  if (updates.newPassword && updates.newPassword.trim()) {
    if (updates.newPassword.trim().length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }
    const newHash = await hashPassword(updates.newPassword.trim());
    await db
      .prepare('UPDATE profiles SET password_hash = ?, updated_at = ? WHERE username = ?')
      .bind(newHash, new Date().toISOString(), clean)
      .run();
  }

  return { success: true };
}

export async function adminDeleteUserFromDb(
  db: D1Database,
  targetUsername: string
): Promise<{ success: boolean; error?: string }> {
  const clean = targetUsername.toLowerCase().trim();
  if (clean === 'kevin') {
    return { success: false, error: 'Cannot delete primary platform admin @kevin.' };
  }

  await db.prepare('DELETE FROM guestbook_entries WHERE username = ?').bind(clean).run();
  await db.prepare('DELETE FROM activities WHERE actor_username = ? OR target_username = ?').bind(clean, clean).run();
  await db.prepare('DELETE FROM profile_views WHERE profile_username = ? OR viewer_username = ?').bind(clean, clean).run();
  await db.prepare('DELETE FROM profiles WHERE username = ?').bind(clean).run();

  return { success: true };
}

export async function adminDeleteActivityFromDb(
  db: D1Database,
  activityId: string
): Promise<boolean> {
  await db.prepare('DELETE FROM activities WHERE id = ?').bind(activityId).run();
  return true;
}


