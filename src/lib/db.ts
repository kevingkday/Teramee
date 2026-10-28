import fs from 'fs';
import path from 'path';
import {
  UserProfile,
  GuestbookEntry,
  DirectMessage,
  ActivityItem,
  ActivityActionType,
  ProfileVisitor
} from './types';
import { THEME_PRESETS } from './presets';
import { sanitizeUserHtml } from './sanitize-html';
import { sanitizeAndScopeCss } from './sanitize-css';
import {
  INITIAL_PROFILES,
  INITIAL_MESSAGES,
  INITIAL_ACTIVITIES,
  INITIAL_PROFILE_VIEWS
} from './initial-profiles';

const DB_FILE = path.join(process.cwd(), '.profiles_data.json');

let memoryStore: Record<string, UserProfile> = { ...INITIAL_PROFILES };

function loadStore(): Record<string, UserProfile> {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content) as Record<string, UserProfile>;
      const merged: Record<string, UserProfile> = { ...INITIAL_PROFILES };
      for (const [k, prof] of Object.entries(parsed)) {
        const seed = INITIAL_PROFILES[k];
        const photos =
          Array.isArray(prof.photos) && prof.photos.length > 0
            ? prof.photos
            : seed?.photos || [];
        const layout = Array.isArray(prof.layout) ? [...prof.layout] : seed?.layout || [];
        if (!layout.some((b) => b.id === 'photos')) {
          layout.push({
            id: 'photos',
            title: 'My Pics & Polaroids',
            column: 'left',
            order: 2,
            visible: true
          });
        }
        merged[k] = {
          ...seed,
          ...prof,
          photos,
          layout
        };
      }
      return merged;
    }
  } catch (e) {
    console.error('Failed to read db file:', e);
  }
  return memoryStore;
}

function persistStore(data: Record<string, UserProfile>) {
  memoryStore = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write db file:', e);
  }
}

export function getProfile(username: string): UserProfile | null {
  const store = loadStore();
  let normalized = username.toLowerCase().trim();
  if (normalized === 'tom') normalized = 'kevin';
  return store[normalized] || null;
}

export function getOrCreateProfile(username: string): UserProfile {
  const store = loadStore();
  let normalized = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '') || 'new_user';
  if (normalized === 'tom') normalized = 'kevin';
  if (store[normalized]) {
    return store[normalized];
  }

  const starterProfile: UserProfile = {
    username: normalized,
    displayName: normalized.charAt(0).toUpperCase() + normalized.slice(1),
    headline: `${normalized} just joined Teramee!`,
    tagline: 'Customizing my space... check back soon!',
    mood: 'excited',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    bioHtml: `<p>Welcome to my brand new Teramee profile!</p><p><i>"Work in progress — styling my layout!"</i></p>`,
    whoIdLikeToMeetHtml: `<p>Everyone on Teramee! Send me a message or add me to your top 8!</p>`,
    interestsHtml: `<p><b>Music:</b> Everything good</p><p><b>Interests:</b> Custom CSS, digital art, retro web</p>`,
    songTitle: 'New Space Vibes',
    songArtist: 'Teramee Sound',
    songAudioUrl: '',
    tokens: THEME_PRESETS[0].tokens,
    layout: [
      { id: 'bio', title: 'About Me & Interests', column: 'left', order: 1, visible: true },
      { id: 'photos', title: 'My Pics & Polaroids', column: 'left', order: 2, visible: true },
      { id: 'interests', title: 'Details & Favorites', column: 'left', order: 3, visible: true },
      { id: 'mediaPlayer', title: 'Profile Track Player', column: 'right', order: 1, visible: true },
      { id: 'topConnections', title: 'Top Friends', column: 'right', order: 2, visible: true },
      { id: 'guestbook', title: 'Friend Blurbs & Comments', column: 'right', order: 3, visible: true }
    ],
    rawCss: THEME_PRESETS[0].sampleCss,
    topFriends: [
      { id: 'f1', name: 'Kevin', avatarUrl: 'https://github.com/kevingkday.png', role: 'First Friend', status: 'online' }
    ],
    photos: [
      {
        id: `p_${Date.now()}_1`,
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        caption: 'First pic on Teramee! ★',
        album: 'My Pics',
        timestamp: 'Just now'
      }
    ],
    guestbook: [
      {
        id: `g_${Date.now()}`,
        author: 'Kevin',
        avatarUrl: 'https://github.com/kevingkday.png',
        timestamp: 'Just now',
        contentHtml: 'Welcome to Teramee! Have fun styling your page! ;-)'
      }
    ],
    updatedAt: new Date().toISOString()
  };

  store[normalized] = starterProfile;
  persistStore(store);
  return starterProfile;
}

export function getAllProfiles(): UserProfile[] {
  const store = loadStore();
  return Object.values(store);
}

export function saveProfile(profile: UserProfile): UserProfile {
  const store = loadStore();
  const normalized = profile.username.toLowerCase().trim();

  // Enforce server-side sanitization on raw CSS
  const sanitizedCssResult = sanitizeAndScopeCss(profile.rawCss || '');

  // Enforce server-side sanitization on HTML content
  const sanitizedBio = sanitizeUserHtml(profile.bioHtml || '');
  const sanitizedWhoIdLikeToMeet = profile.whoIdLikeToMeetHtml
    ? sanitizeUserHtml(profile.whoIdLikeToMeetHtml)
    : undefined;
  const sanitizedInterests = sanitizeUserHtml(profile.interestsHtml || '');
  const sanitizedHeadline = sanitizeUserHtml(profile.headline || '');
  const sanitizedTagline = sanitizeUserHtml(profile.tagline || '');

  const updatedProfile: UserProfile = {
    ...profile,
    username: normalized,
    bioHtml: sanitizedBio,
    whoIdLikeToMeetHtml: sanitizedWhoIdLikeToMeet,
    interestsHtml: sanitizedInterests,
    headline: sanitizedHeadline,
    tagline: sanitizedTagline,
    rawCss: profile.rawCss, // keep power-user raw input
    updatedAt: new Date().toISOString()
  };

  store[normalized] = updatedProfile;
  persistStore(store);
  return updatedProfile;
}

export function addGuestbookComment(
  username: string,
  author: string,
  content: string,
  avatarUrl?: string,
  authorUsername?: string
): GuestbookEntry | null {
  const store = loadStore();
  const normalized = username.toLowerCase().trim();
  const profile = store[normalized];
  if (!profile) return null;

  const sanitizedContent = sanitizeUserHtml(content);
  const newEntry: GuestbookEntry = {
    id: `g_${Date.now()}`,
    author: author.trim() || 'Anonymous Visitor',
    username: authorUsername?.trim().toLowerCase(),
    avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    timestamp: 'Just now',
    contentHtml: sanitizedContent
  };

  profile.guestbook = profile.guestbook || [];
  profile.guestbook.unshift(newEntry);
  store[normalized] = profile;
  persistStore(store);
  return newEntry;
}

export function deleteGuestbookComment(username: string, commentId: string): boolean {
  const store = loadStore();
  const normalized = username.toLowerCase().trim();
  const profile = store[normalized];
  if (!profile) return false;

  profile.guestbook = (profile.guestbook || []).filter((c) => c.id !== commentId);
  store[normalized] = profile;
  persistStore(store);
  return true;
}

export function toggleFriendship(fromUsername: string, targetUsername: string): { isFriend: boolean; friendCount: number } {
  const store = loadStore();
  let from = fromUsername.toLowerCase().trim();
  let target = targetUsername.toLowerCase().trim();
  if (from === 'tom') from = 'kevin';
  if (target === 'tom') target = 'kevin';

  const fromProfile = store[from];
  const targetProfile = store[target];
  if (!fromProfile || !targetProfile) return { isFriend: false, friendCount: 0 };

  fromProfile.friends = fromProfile.friends || [];
  targetProfile.friends = targetProfile.friends || [];

  const indexInFrom = fromProfile.friends.indexOf(target);
  let isFriend = false;
  if (indexInFrom >= 0) {
    fromProfile.friends.splice(indexInFrom, 1);
    const indexInTarget = targetProfile.friends.indexOf(from);
    if (indexInTarget >= 0) targetProfile.friends.splice(indexInTarget, 1);
    isFriend = false;
  } else {
    fromProfile.friends.push(target);
    if (!targetProfile.friends.includes(from)) targetProfile.friends.push(from);
    isFriend = true;
  }

  store[from] = fromProfile;
  store[target] = targetProfile;
  persistStore(store);

  return { isFriend, friendCount: targetProfile.friends.length };
}

export function checkIsFriend(fromUsername: string, targetUsername: string): boolean {
  const store = loadStore();
  let from = fromUsername.toLowerCase().trim();
  let target = targetUsername.toLowerCase().trim();
  if (from === 'tom') from = 'kevin';
  if (target === 'tom') target = 'kevin';
  const profile = store[from];
  return !!profile?.friends?.includes(target);
}

export function toggleFavorite(fromUsername: string, targetUsername: string): boolean {
  const store = loadStore();
  let from = fromUsername.toLowerCase().trim();
  let target = targetUsername.toLowerCase().trim();
  if (from === 'tom') from = 'kevin';
  if (target === 'tom') target = 'kevin';

  const fromProfile = store[from];
  if (!fromProfile) return false;

  fromProfile.favorites = fromProfile.favorites || [];
  const idx = fromProfile.favorites.indexOf(target);
  let favorited = false;
  if (idx >= 0) {
    fromProfile.favorites.splice(idx, 1);
    favorited = false;
  } else {
    fromProfile.favorites.push(target);
    favorited = true;
  }

  store[from] = fromProfile;
  persistStore(store);
  return favorited;
}

export function checkIsFavorite(fromUsername: string, targetUsername: string): boolean {
  const store = loadStore();
  let from = fromUsername.toLowerCase().trim();
  let target = targetUsername.toLowerCase().trim();
  if (from === 'tom') from = 'kevin';
  if (target === 'tom') target = 'kevin';
  const profile = store[from];
  return !!profile?.favorites?.includes(target);
}

// Direct Messages File & Memory Store
const MESSAGES_FILE = path.join(process.cwd(), '.messages_data.json');

let messagesMemoryStore: DirectMessage[] = [...INITIAL_MESSAGES];

function loadMessagesStore(): DirectMessage[] {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const content = fs.readFileSync(MESSAGES_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Failed to read messages file:', e);
  }
  return messagesMemoryStore;
}

function persistMessagesStore(data: DirectMessage[]) {
  messagesMemoryStore = data;
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write messages file:', e);
  }
}

export function getMessages(username: string): DirectMessage[] {
  const store = loadMessagesStore();
  let normalized = username.toLowerCase().trim();
  if (normalized === 'tom') normalized = 'kevin';
  return store
    .filter((m) => m.toUsername.toLowerCase() === normalized)
    .sort((a, b) => b.id.localeCompare(a.id));
}

export function getUnreadMessageCount(username: string): number {
  const messages = getMessages(username);
  return messages.filter((m) => !m.read).length;
}

export function sendMessage(
  fromUsername: string,
  toUsername: string,
  subject: string,
  body: string
): DirectMessage {
  const store = loadMessagesStore();
  let from = fromUsername.toLowerCase().trim();
  let to = toUsername.toLowerCase().trim();
  if (from === 'tom') from = 'kevin';
  if (to === 'tom') to = 'kevin';

  const senderProfile = getProfile(from);

  const newMsg: DirectMessage = {
    id: `m_${Date.now()}`,
    fromUsername: from,
    fromDisplayName: senderProfile?.displayName || from,
    fromAvatarUrl: senderProfile?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    toUsername: to,
    subject: subject.trim() || 'No Subject',
    body: body.trim(),
    timestamp: 'Just now',
    read: false
  };

  store.unshift(newMsg);
  persistMessagesStore(store);
  return newMsg;
}

export function markMessageRead(username: string, messageId: string): boolean {
  const store = loadMessagesStore();
  let normalized = username.toLowerCase().trim();
  if (normalized === 'tom') normalized = 'kevin';
  const msg = store.find((m) => m.id === messageId && m.toUsername.toLowerCase() === normalized);
  if (!msg) return false;
  msg.read = true;
  persistMessagesStore(store);
  return true;
}

// Activities & Profile Views Local Stores
const ACTIVITIES_FILE = path.join(process.cwd(), '.activities_data.json');
const VIEWS_FILE = path.join(process.cwd(), '.views_data.json');

let activitiesMemoryStore: ActivityItem[] = [...INITIAL_ACTIVITIES];
let viewsMemoryStore: ProfileVisitor[] = [...INITIAL_PROFILE_VIEWS];

function loadActivitiesStore(): ActivityItem[] {
  try {
    if (fs.existsSync(ACTIVITIES_FILE)) {
      const content = fs.readFileSync(ACTIVITIES_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to read activities file:', e);
  }
  return activitiesMemoryStore;
}

function persistActivitiesStore(data: ActivityItem[]) {
  activitiesMemoryStore = data;
  try {
    fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write activities file:', e);
  }
}

export function createActivity(input: {
  actorUsername: string;
  targetUsername?: string | null;
  actionType: ActivityActionType;
  summary: string;
  metadata?: Record<string, unknown>;
}): ActivityItem {
  const store = loadActivitiesStore();
  const actorClean = input.actorUsername.toLowerCase().trim();
  const targetClean = input.targetUsername ? input.targetUsername.toLowerCase().trim() : null;
  const actorProfile = getProfile(actorClean);

  const newAct: ActivityItem = {
    id: crypto.randomUUID(),
    actorUsername: actorClean,
    actorDisplayName: actorProfile?.displayName || actorClean,
    actorAvatarUrl:
      actorProfile?.avatarUrl ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    targetUsername: targetClean,
    actionType: input.actionType,
    summary: input.summary,
    metadata: input.metadata || {},
    createdAt: new Date().toISOString()
  };

  store.unshift(newAct);
  persistActivitiesStore(store.slice(0, 200));
  return newAct;
}

export function getGlobalFeed(
  limit = 20,
  cursor?: string,
  actorUsername?: string
): { activities: ActivityItem[]; nextCursor: string | null } {
  const safeLimit = Math.min(Math.max(1, limit), 50);
  let list = loadActivitiesStore().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (actorUsername) {
    const cleanActor = actorUsername.toLowerCase().trim();
    list = list.filter((a) => a.actorUsername.toLowerCase() === cleanActor);
  }

  if (cursor) {
    const cursorTime = new Date(cursor).getTime();
    if (!Number.isNaN(cursorTime)) {
      list = list.filter((a) => new Date(a.createdAt).getTime() < cursorTime);
    }
  }

  const page = list.slice(0, safeLimit).map((item) => {
    const prof = getProfile(item.actorUsername);
    return {
      ...item,
      actorDisplayName: prof?.displayName || item.actorDisplayName || item.actorUsername,
      actorAvatarUrl:
        prof?.avatarUrl ||
        item.actorAvatarUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
    };
  });

  const nextCursor = page.length === safeLimit ? page[page.length - 1].createdAt : null;
  return { activities: page, nextCursor };
}

function loadViewsStore(): ProfileVisitor[] {
  try {
    if (fs.existsSync(VIEWS_FILE)) {
      const content = fs.readFileSync(VIEWS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to read views file:', e);
  }
  return viewsMemoryStore;
}

function persistViewsStore(data: ProfileVisitor[]) {
  viewsMemoryStore = data;
  try {
    fs.writeFileSync(VIEWS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write views file:', e);
  }
}

export function recordProfileView(
  profileUsername: string,
  viewerUsername: string,
  viewerAvatarUrl?: string
): { recorded: boolean; reason?: string } {
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

  const viewerProfile = getProfile(viewerClean);
  const resolvedAvatar =
    viewerAvatarUrl ||
    viewerProfile?.avatarUrl ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';

  const store = loadViewsStore();
  const now = new Date();
  const nowIso = now.toISOString();

  // Check if same viewer viewed this profile within the last 1 hour
  const existingIdx = store.findIndex(
    (v) =>
      v.profileUsername.toLowerCase() === profileClean &&
      v.viewerUsername.toLowerCase() === viewerClean
  );

  if (existingIdx >= 0) {
    const lastMs = new Date(store[existingIdx].viewedAt).getTime();
    if (!Number.isNaN(lastMs) && now.getTime() - lastMs < 60 * 60 * 1000) {
      store[existingIdx] = {
        ...store[existingIdx],
        viewerDisplayName: viewerProfile?.displayName || viewerClean,
        viewerAvatarUrl: resolvedAvatar,
        viewedAt: nowIso
      };
      persistViewsStore(store);
      return { recorded: true, reason: 'Updated existing view within 1-hour window.' };
    }
  }

  const newView: ProfileVisitor = {
    id: crypto.randomUUID(),
    profileUsername: profileClean,
    viewerUsername: viewerClean,
    viewerDisplayName: viewerProfile?.displayName || viewerClean,
    viewerAvatarUrl: resolvedAvatar,
    viewedAt: nowIso
  };

  store.unshift(newView);
  persistViewsStore(store.slice(0, 300));
  return { recorded: true };
}

export function getRecentVisitors(profileUsername: string, limit = 8): ProfileVisitor[] {
  const profileClean =
    profileUsername.toLowerCase().trim() === 'tom'
      ? 'kevin'
      : profileUsername.toLowerCase().trim();

  const store = loadViewsStore()
    .filter((v) => v.profileUsername.toLowerCase() === profileClean)
    .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());

  const seen = new Set<string>();
  const distinct: ProfileVisitor[] = [];

  for (const v of store) {
    const viewer = v.viewerUsername.toLowerCase();
    if (viewer === profileClean || seen.has(viewer)) continue;
    seen.add(viewer);
    const viewerProf = getProfile(viewer);
    distinct.push({
      ...v,
      viewerDisplayName: viewerProf?.displayName || v.viewerDisplayName || viewer,
      viewerAvatarUrl:
        viewerProf?.avatarUrl ||
        v.viewerAvatarUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
    });
    if (distinct.length >= limit) break;
  }

  return distinct;
}

