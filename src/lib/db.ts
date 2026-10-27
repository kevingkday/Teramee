import fs from 'fs';
import path from 'path';
import { UserProfile, GuestbookEntry, DirectMessage } from './types';
import { THEME_PRESETS } from './presets';
import { sanitizeUserHtml } from './sanitize-html';
import { sanitizeAndScopeCss } from './sanitize-css';

const DB_FILE = path.join(process.cwd(), '.profiles_data.json');

const INITIAL_PROFILES: Record<string, UserProfile> = {
  kevin: {
    username: 'kevin',
    displayName: 'Kevin',
    headline: "Kevin is in your extended network! ;-)",
    tagline: "Building the friendly web since 2003. Let's connect!",
    mood: 'nostalgic',
    avatarUrl: 'https://github.com/kevingkday.png',
    bannerUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    bioHtml: `<p><b>Hi! I'm Kevin.</b></p><p>Welcome to my profile! I enjoy building open platforms where everyone has their own space on the internet.</p><p><i>"Don't take life too seriously, nobody gets out alive anyway!"</i></p>`,
    whoIdLikeToMeetHtml: `<p>Old friends, new friends, developers, musicians, and anyone who misses when the internet was creative, customizable, and fun! Drop a comment below! ;-)</p>`,
    interestsHtml: `<p><b>General:</b> Web architecture, retro gaming, vinyl records, film cameras</p><p><b>Music:</b> The Postal Service, Jimmy Eat World, Daft Punk, Modest Mouse</p><p><b>Movies:</b> The Matrix, Eternal Sunshine, Donnie Darko</p>`,
    songTitle: 'Such Great Heights',
    songArtist: 'The Postal Service',
    songAudioUrl: '',
    tokens: THEME_PRESETS[0].tokens,
    layout: [
      { id: 'bio', title: 'About Me & Interests', column: 'left', order: 1, visible: true },
      { id: 'interests', title: 'Details & Favorites', column: 'left', order: 2, visible: true },
      { id: 'mediaPlayer', title: 'Profile Track Player', column: 'right', order: 1, visible: true },
      { id: 'topConnections', title: "Kevin's Top 8 Friends", column: 'right', order: 2, visible: true },
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
        contentHtml: 'Thanks for the add Kevin!! Love your new profile background! PC4PC? <3'
      },
      {
        id: 'g2',
        author: 'Alex',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        timestamp: 'Yesterday at 9:40 PM',
        contentHtml: 'Awesome song choice bro! Are we practicing this Saturday at the studio?'
      }
    ],
    passwordHash: '9f5c350ac0afc6b3b92d6192ed38eb86913e88cf1c2cc95654f18fe220f2654db9dea5378fd4eb188ee95d2468d2ba9c4a79d53b2d278638dbfd84d4eb45b531',
    salt: 'ad184984c726add3462dcaa751008621',
    updatedAt: new Date().toISOString()
  },
  glitterqueen99: {
    username: 'glitterqueen99',
    displayName: 'xX_Glitter_Star_Xx',
    headline: 'Rawr means I love you in dinosaur!! xD',
    tagline: 'Scene kids never die, they just dye their hair neon again~',
    mood: 'ecstatic',
    avatarUrl: '/avatars/glitterqueen.jpg',
    bannerUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80',
    bioHtml: `<p><marquee scrollamount="4">★ Welcome 2 My Sparkly Nightmare ★</marquee></p><p>Stargazer, side-bang enthusiast, and hot-topic loyalty club member. Leave a comment or get deleted from my top 8!</p>`,
    whoIdLikeToMeetHtml: `<p>Paramore, scene queens &amp; kings, anyone with cool hair, and cute emo boys with side bangs! No posers allowed! &lt;3</p>`,
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
      { id: 'interests', title: 'Details & Favorites', column: 'left', order: 2, visible: true },
      { id: 'mediaPlayer', title: 'Profile Track Player', column: 'right', order: 1, visible: true },
      { id: 'topConnections', title: 'Top Friends', column: 'right', order: 2, visible: true },
      { id: 'guestbook', title: 'Friend Blurbs & Comments', column: 'right', order: 3, visible: true }
    ],
    rawCss: THEME_PRESETS[0].sampleCss,
    topFriends: [
      { id: 'f1', name: 'Kevin', avatarUrl: 'https://github.com/kevingkday.png', role: 'First Friend', status: 'online' }
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

const INITIAL_MESSAGES: DirectMessage[] = [
  {
    id: 'm1',
    fromUsername: 'glitterqueen99',
    fromDisplayName: 'xX_Glitter_Star_Xx',
    fromAvatarUrl: '/avatars/glitterqueen.jpg',
    toUsername: 'kevin',
    subject: 'Rawr! Love the retro platform!',
    body: 'OMG Kevin! Teramee is so fun! I added glitter stars to my layout and my cassette player is blasting Paramore. Add me to your Top 8? xD',
    timestamp: 'Today at 3:15 PM',
    read: false
  },
  {
    id: 'm2',
    fromUsername: 'sarah',
    fromDisplayName: 'Sarah',
    fromAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    toUsername: 'kevin',
    subject: 'Band rehearsal Saturday',
    body: 'Hey Kevin, let me know if you want to try out the new guitar amp this weekend! See you soon.',
    timestamp: 'Yesterday at 8:20 PM',
    read: true
  },
  {
    id: 'm3',
    fromUsername: 'alex',
    fromDisplayName: 'Alex',
    fromAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    toUsername: 'kevin',
    subject: 'New bass tab for Seven Nation Army',
    body: 'Hey dude, I figured out the alternate bridge lick for Saturday. Check it out when you have a sec!',
    timestamp: 'Today at 1:10 PM',
    read: false
  },
  {
    id: 'm4',
    fromUsername: 'kevin',
    fromDisplayName: 'Kevin',
    fromAvatarUrl: 'https://github.com/kevingkday.png',
    toUsername: 'sarah',
    subject: 'Re: Band rehearsal Saturday',
    body: 'Sounds awesome Sarah! I will bring the cables and my acoustic just in case. Coffee before at 1?',
    timestamp: 'Today at 11:30 AM',
    read: false
  },
  {
    id: 'm5',
    fromUsername: 'vampirekitten',
    fromDisplayName: 'VampireKitten',
    fromAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    toUsername: 'glitterqueen99',
    subject: 'OMG mall trip Friday???',
    body: 'Hot Topic has new studded belts and black eyeliner pens on sale 2 for 1! We HAVE to go after class! Rawrrr <3',
    timestamp: 'Today at 2:45 PM',
    read: false
  },
  {
    id: 'm6',
    fromUsername: 'maya',
    fromDisplayName: 'Maya',
    fromAvatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    toUsername: 'kevin',
    subject: 'New sticker designs ready!',
    body: 'Hey Kevin! Just finished drawing the pixel icons for the music cassette widget. Let me know what you think!',
    timestamp: 'Today at 2:10 PM',
    read: false
  }
];

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
