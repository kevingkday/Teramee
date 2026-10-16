import fs from 'fs';
import path from 'path';
import { UserProfile, GuestbookEntry } from './types';
import { THEME_PRESETS } from './presets';
import { sanitizeUserHtml } from './sanitize-html';
import { sanitizeAndScopeCss } from './sanitize-css';

const DB_FILE = path.join(process.cwd(), '.profiles_data.json');

import { INITIAL_PROFILES } from './initial-profiles';

let memoryStore: Record<string, UserProfile> = { ...INITIAL_PROFILES };

function loadStore(): Record<string, UserProfile> {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return { ...INITIAL_PROFILES, ...parsed };
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
  const normalized = username.toLowerCase().trim();
  return store[normalized] || null;
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
  const sanitizedInterests = sanitizeUserHtml(profile.interestsHtml || '');
  const sanitizedHeadline = sanitizeUserHtml(profile.headline || '');
  const sanitizedTagline = sanitizeUserHtml(profile.tagline || '');

  const updatedProfile: UserProfile = {
    ...profile,
    username: normalized,
    bioHtml: sanitizedBio,
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
  avatarUrl?: string
): GuestbookEntry | null {
  const store = loadStore();
  const normalized = username.toLowerCase().trim();
  const profile = store[normalized];
  if (!profile) return null;

  const sanitizedContent = sanitizeUserHtml(content);
  const newEntry: GuestbookEntry = {
    id: `g_${Date.now()}`,
    author: author.trim() || 'Anonymous Visitor',
    avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    timestamp: 'Just now',
    contentHtml: sanitizedContent
  };

  profile.guestbook.unshift(newEntry);
  store[normalized] = profile;
  persistStore(store);
  return newEntry;
}
