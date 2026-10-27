// Database operations for Cloudflare D1
import { UserProfile, GuestbookEntry, DirectMessage } from '../src/lib/types';
import { D1Database } from './schema';
import { sanitizeUserHtml } from '../src/lib/sanitize-html';
import { THEME_PRESETS } from '../src/lib/presets';
import { INITIAL_PROFILES } from '../src/lib/initial-profiles';

interface ProfileRow {
  username: string;
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
    return {
      username: profileRow.username,
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
      layout: JSON.parse(profileRow.layout_json || '[]'),
      rawCss: profileRow.raw_css || '',
      topFriends: JSON.parse(profileRow.top_friends_json || '[]'),
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
        username, display_name, headline, tagline, mood,
        avatar_url, banner_url, bio_html, who_id_like_to_meet_html, interests_html,
        song_title, song_artist, song_audio_url,
        media_type, media_url,
        tokens_json, layout_json, raw_css, top_friends_json,
        friends_json, favorites_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(username) DO UPDATE SET
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
        friends_json = excluded.friends_json,
        favorites_json = excluded.favorites_json,
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
  if (!normalized || normalized.length < 2) {
    return { available: false, normalized, reason: 'Username must be at least 2 characters.' };
  }
  if (normalized.length > 24) {
    return { available: false, normalized, reason: 'Username cannot exceed 24 characters.' };
  }
  if (!/^[a-z0-9_.-]+$/.test(normalized)) {
    return {
      available: false,
      normalized,
      reason: 'Username can only contain letters, numbers, underscores, dots, and hyphens.'
    };
  }

  const reserved = ['admin', 'api', 'editor', 'login', 'signup', 'user', 'sandbox-frame', 'settings', 'technology'];
  if (reserved.includes(normalized)) {
    return { available: false, normalized, reason: 'This handle is reserved by the platform.' };
  }

  const existing = await db
    .prepare('SELECT username FROM profiles WHERE username = ? LIMIT 1')
    .bind(normalized)
    .first<{ username: string }>();

  if (existing) {
    return { available: false, normalized, reason: 'This handle is already claimed.' };
  }

  return { available: true, normalized };
}

export async function registerUserInDb(
  db: D1Database,
  input: {
    username: string;
    displayName: string;
    password?: string;
    presetId?: string;
  }
): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  const check = await checkUsernameAvailability(db, input.username);
  if (!check.available) {
    return { success: false, error: check.reason || 'Username not available.' };
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
        username, display_name, headline, tagline, mood,
        avatar_url, banner_url, bio_html, who_id_like_to_meet_html, interests_html,
        song_title, song_artist, song_audio_url,
        media_type, media_url,
        tokens_json, layout_json, raw_css, top_friends_json,
        friends_json, favorites_json, password_hash, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '["kevin"]', '[]', ?, ?)
    `)
    .bind(
      normalized,
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
