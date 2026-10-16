// Cloudflare D1 Database Auto-Schema & Seeding
import { UserProfile, GuestbookEntry } from '../src/lib/types';
import { THEME_PRESETS } from '../src/lib/presets';

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  error?: string;
  meta?: unknown;
}

export interface D1ExecResult {
  count: number;
  duration: number;
}

export const INITIAL_PROFILES_SEED: Record<string, UserProfile> = {
  tom: {
    username: 'tom',
    displayName: 'Tom',
    headline: 'Tom is in your extended network! ;-)',
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

let schemaInitialized = false;

export async function ensureSchema(db: D1Database): Promise<void> {
  if (schemaInitialized) return;

  const statements = [
    `CREATE TABLE IF NOT EXISTS profiles (
      username TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      headline TEXT DEFAULT '',
      tagline TEXT DEFAULT '',
      mood TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      banner_url TEXT DEFAULT '',
      bio_html TEXT DEFAULT '',
      interests_html TEXT DEFAULT '',
      song_title TEXT DEFAULT '',
      song_artist TEXT DEFAULT '',
      song_audio_url TEXT DEFAULT '',
      media_type TEXT DEFAULT 'retro-cassette',
      media_url TEXT DEFAULT '',
      tokens_json TEXT NOT NULL,
      layout_json TEXT NOT NULL,
      raw_css TEXT DEFAULT '',
      top_friends_json TEXT NOT NULL,
      password_hash TEXT DEFAULT '',
      updated_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS guestbook_entries (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      author TEXT NOT NULL,
      avatar_url TEXT DEFAULT '',
      timestamp TEXT NOT NULL,
      content_html TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_guestbook_username ON guestbook_entries(username, created_at DESC)`
  ];

  for (const sql of statements) {
    try {
      await db.prepare(sql).run();
    } catch (err) {
      console.error('Error executing schema statement:', err);
    }
  }

  // Gracefully add password_hash, media_type, media_url columns if upgrading from an older table version
  try {
    await db.prepare("ALTER TABLE profiles ADD COLUMN password_hash TEXT DEFAULT ''").run();
  } catch {
    // Column already exists, safe to ignore
  }
  try {
    await db.prepare("ALTER TABLE profiles ADD COLUMN media_type TEXT DEFAULT 'retro-cassette'").run();
  } catch {
    // Column already exists, safe to ignore
  }
  try {
    await db.prepare("ALTER TABLE profiles ADD COLUMN media_url TEXT DEFAULT ''").run();
  } catch {
    // Column already exists, safe to ignore
  }

  // 2. Check if default user 'tom' exists
  try {
    const existing = await db
      .prepare('SELECT username FROM profiles WHERE username = ? LIMIT 1')
      .bind('tom')
      .first<{ username: string }>();

    if (!existing) {
      // Seed default profiles
      for (const profile of Object.values(INITIAL_PROFILES_SEED)) {
        await db
          .prepare(`
            INSERT INTO profiles (
              username, display_name, headline, tagline, mood,
              avatar_url, banner_url, bio_html, interests_html,
              song_title, song_artist, song_audio_url,
              tokens_json, layout_json, raw_css, top_friends_json, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            profile.username.toLowerCase(),
            profile.displayName,
            profile.headline,
            profile.tagline,
            profile.mood,
            profile.avatarUrl,
            profile.bannerUrl || '',
            profile.bioHtml,
            profile.interestsHtml,
            profile.songTitle,
            profile.songArtist,
            profile.songAudioUrl || '',
            JSON.stringify(profile.tokens),
            JSON.stringify(profile.layout),
            profile.rawCss || '',
            JSON.stringify(profile.topFriends),
            profile.updatedAt
          )
          .run();

        // Seed guestbook entries
        for (const entry of profile.guestbook) {
          await db
            .prepare(`
              INSERT OR IGNORE INTO guestbook_entries (
                id, username, author, avatar_url, timestamp, content_html, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
              entry.id,
              profile.username.toLowerCase(),
              entry.author,
              entry.avatarUrl,
              entry.timestamp,
              entry.contentHtml,
              new Date().toISOString()
            )
            .run();
        }
      }
    }
  } catch (err) {
    console.error('Error during D1 seeding:', err);
  }

  schemaInitialized = true;
}
