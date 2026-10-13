import fs from 'fs';
import path from 'path';
import { UserProfile, GuestbookEntry } from './types';
import { THEME_PRESETS } from './presets';
import { sanitizeUserHtml } from './sanitize-html';
import { sanitizeAndScopeCss } from './sanitize-css';

const DB_FILE = path.join(process.cwd(), '.profiles_data.json');

const INITIAL_PROFILES: Record<string, UserProfile> = {
  tom: {
    username: 'tom',
    displayName: 'Tom',
    headline: "Tom is in your extended network! ;-)",
    tagline: "Building the friendly web since 2003. Let's connect!",
    mood: 'nostalgic',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    bioHtml: `<p><b>Hi! I'm Tom.</b></p><p>Welcome to my profile! I enjoy surf sessions, digital photography, and building open platforms where everyone has their own space on the internet.</p><p><i>"Don't take life too seriously, nobody gets out alive anyway!"</i></p>`,
    interestsHtml: `<p><b>General:</b> Web architecture, retro gaming, vinyl records, film cameras</p><p><b>Music:</b> The Postal Service, Jimmy Eat World, Daft Punk, Modest Mouse</p><p><b>Movies:</b> The Matrix, Eternal Sunshine, Donnie Darko</p>`,
    songTitle: 'Such Great Heights',
    songArtist: 'The Postal Service',
    songAudioUrl: '',
    tokens: THEME_PRESETS[0].tokens,
    layout: [
      { id: 'bio', title: 'About Me & Interests', column: 'left', order: 1, visible: true },
      { id: 'interests', title: 'Details & Favorites', column: 'left', order: 2, visible: true },
      { id: 'mediaPlayer', title: 'Profile Track Player', column: 'right', order: 1, visible: true },
      { id: 'topConnections', title: "Tom's Top 8 Friends", column: 'right', order: 2, visible: true },
      { id: 'guestbook', title: 'Friend Blurbs & Comments', column: 'right', order: 3, visible: true }
    ],
    rawCss: THEME_PRESETS[0].sampleCss,
    topFriends: [
      { id: 'f1', name: 'Sarah', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', role: 'Best Friend', status: 'online' },
      { id: 'f2', name: 'Alex', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', role: 'Bassist', status: 'away' },
      { id: 'f3', name: 'Maya', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80', role: 'Designer', status: 'online' },
      { id: 'f4', name: 'Jordan', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', role: 'DJ', status: 'offline' },
      { id: 'f5', name: 'Chloe', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80', role: 'Artist', status: 'online' },
      { id: 'f6', name: 'Liam', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80', role: 'Skater', status: 'away' },
      { id: 'f7', name: 'Zoe', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80', role: 'Vocalist', status: 'offline' },
      { id: 'f8', name: 'Marcus', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80', role: 'Gamer', status: 'online' }
    ],
    guestbook: [
      {
        id: 'g1',
        author: 'Sarah',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        timestamp: 'Today at 2:14 PM',
        contentHtml: 'Thanks for the add Tom!! Love your new profile background! PC4PC? <3'
      },
      {
        id: 'g2',
        author: 'Alex',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        timestamp: 'Yesterday at 9:40 PM',
        contentHtml: 'Awesome song choice bro! Are we practicing this Saturday at the studio?'
      }
    ],
    updatedAt: new Date().toISOString()
  },
  glitterqueen99: {
    username: 'glitterqueen99',
    displayName: 'xX_Glitter_Star_Xx',
    headline: 'Rawr means I love you in dinosaur!! xD',
    tagline: 'Scene kids never die, they just dye their hair neon again~',
    mood: 'ecstatic',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80',
    bioHtml: `<p><marquee scrollamount="4">★ Welcome 2 My Sparkly Nightmare ★</marquee></p><p>Stargazer, side-bang enthusiast, and hot-topic loyalty club member. Leave a comment or get deleted from my top 8!</p>`,
    interestsHtml: `<p><b>Music:</b> Paramore, Fall Out Boy, My Chemical Romance, Cobra Starship</p><p><b>Hobbies:</b> Taking mirror selfies with a digital Olympus cam, designing sparkly layouts</p>`,
    songTitle: 'Misery Business',
    songArtist: 'Paramore',
    songAudioUrl: '',
    tokens: THEME_PRESETS[1].tokens,
    layout: [
      { id: 'bio', title: 'About Me & Status', column: 'left', order: 1, visible: true },
      { id: 'interests', title: 'Scene Life & Music', column: 'left', order: 2, visible: true },
      { id: 'mediaPlayer', title: 'My Jams Player', column: 'right', order: 1, visible: true },
      { id: 'topConnections', title: 'Top 8 Scene Squad', column: 'right', order: 2, visible: true },
      { id: 'guestbook', title: 'Blurbs & Comments', column: 'right', order: 3, visible: true }
    ],
    rawCss: THEME_PRESETS[1].sampleCss,
    topFriends: [
      { id: 'f1', name: 'VampireKitten', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80', role: 'BFFL', status: 'online' },
      { id: 'f2', name: 'CyberGoth', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', role: 'Emo King', status: 'online' },
      { id: 'f3', name: 'NeonSkater', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', role: 'Homie', status: 'away' },
      { id: 'f4', name: 'PixelDoll', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', role: 'Bestie', status: 'online' }
    ],
    guestbook: [
      {
        id: 'g1',
        author: 'PixelDoll',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        timestamp: '3 hours ago',
        contentHtml: 'OMG your layout is SO PRETTY!! Teach me how you did the glowing border!! <3<3'
      }
    ],
    updatedAt: new Date().toISOString()
  }
};

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
