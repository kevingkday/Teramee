// Cloudflare D1 Database Auto-Schema & Seeding
import {
  INITIAL_PROFILES,
  INITIAL_MESSAGES,
  INITIAL_ACTIVITIES,
  INITIAL_PROFILE_VIEWS
} from '../src/lib/initial-profiles';

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

export const INITIAL_PROFILES_SEED = INITIAL_PROFILES;

let schemaInitialized = false;

export async function ensureSchema(db: D1Database): Promise<void> {
  if (schemaInitialized) return;

  const statements = [
    `CREATE TABLE IF NOT EXISTS profiles (
      username TEXT PRIMARY KEY,
      email TEXT DEFAULT '',
      is_admin INTEGER DEFAULT 0,
      display_name TEXT NOT NULL,
      headline TEXT DEFAULT '',
      tagline TEXT DEFAULT '',
      mood TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      banner_url TEXT DEFAULT '',
      bio_html TEXT DEFAULT '',
      who_id_like_to_meet_html TEXT DEFAULT '',
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
      photos_json TEXT DEFAULT '[]',
      friends_json TEXT DEFAULT '[]',
      favorites_json TEXT DEFAULT '[]',
      password_hash TEXT DEFAULT '',
      updated_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS guestbook_entries (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      author TEXT NOT NULL,
      author_username TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      timestamp TEXT NOT NULL,
      content_html TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_guestbook_username ON guestbook_entries(username, created_at DESC)`,
    `CREATE TABLE IF NOT EXISTS direct_messages (
      id TEXT PRIMARY KEY,
      from_username TEXT NOT NULL,
      from_display_name TEXT DEFAULT '',
      from_avatar_url TEXT DEFAULT '',
      to_username TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_messages_to_user ON direct_messages(to_username, created_at DESC)`,
    `CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      actor_username TEXT NOT NULL,
      target_username TEXT,
      action_type TEXT NOT NULL,
      summary TEXT NOT NULL,
      metadata_json TEXT DEFAULT '{}',
      created_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_activities_actor ON activities(actor_username, created_at DESC)`,
    `CREATE TABLE IF NOT EXISTS profile_views (
      id TEXT PRIMARY KEY,
      profile_username TEXT NOT NULL,
      viewer_username TEXT NOT NULL,
      viewer_avatar_url TEXT DEFAULT '',
      viewed_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_profile_views_lookup ON profile_views(profile_username, viewed_at DESC)`,
    `CREATE TABLE IF NOT EXISTS profile_widgets (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      widget_type TEXT NOT NULL,
      title TEXT NOT NULL,
      config_json TEXT NOT NULL,
      cached_data_json TEXT DEFAULT '{}',
      last_synced_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (username) REFERENCES profiles(username)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_widgets_username ON profile_widgets(username)`
  ];

  for (const sql of statements) {
    try {
      await db.prepare(sql).run();
    } catch (err) {
      console.error('Error executing schema statement:', err);
    }
  }

  // Gracefully add new columns if upgrading from an older table version
  const alterStatements = [
    "ALTER TABLE profiles ADD COLUMN password_hash TEXT DEFAULT ''",
    "ALTER TABLE profiles ADD COLUMN media_type TEXT DEFAULT 'retro-cassette'",
    "ALTER TABLE profiles ADD COLUMN media_url TEXT DEFAULT ''",
    "ALTER TABLE profiles ADD COLUMN who_id_like_to_meet_html TEXT DEFAULT ''",
    "ALTER TABLE profiles ADD COLUMN friends_json TEXT DEFAULT '[]'",
    "ALTER TABLE profiles ADD COLUMN favorites_json TEXT DEFAULT '[]'",
    "ALTER TABLE profiles ADD COLUMN photos_json TEXT DEFAULT '[]'",
    "ALTER TABLE profiles ADD COLUMN email TEXT DEFAULT ''",
    "ALTER TABLE profiles ADD COLUMN is_admin INTEGER DEFAULT 0",
    "ALTER TABLE guestbook_entries ADD COLUMN author_username TEXT DEFAULT ''"
  ];
  for (const sql of alterStatements) {
    try {
      await db.prepare(sql).run();
    } catch {
      // Column already exists, safe to ignore
    }
  }

  // Ensure all 14 sample accounts exist in D1
  try {
    const existingKevin = await db
      .prepare('SELECT username FROM profiles WHERE username = ? LIMIT 1')
      .bind('kevin')
      .first<{ username: string }>();

    if (!existingKevin) {
      for (const [key, profile] of Object.entries(INITIAL_PROFILES)) {
        const handle = key.toLowerCase();
        await db
          .prepare(`
            INSERT OR REPLACE INTO profiles (
              username, email, is_admin, display_name, headline, tagline, mood,
              avatar_url, banner_url, bio_html, who_id_like_to_meet_html, interests_html,
              song_title, song_artist, song_audio_url, media_type, media_url,
              tokens_json, layout_json, raw_css, top_friends_json, photos_json,
              friends_json, favorites_json, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            handle,
            profile.email || '',
            profile.isAdmin ? 1 : 0,
            profile.displayName,
            profile.headline || '',
            profile.tagline || '',
            profile.mood || '',
            profile.avatarUrl || '',
            profile.bannerUrl || '',
            profile.bioHtml || '',
            profile.whoIdLikeToMeetHtml || '',
            profile.interestsHtml || '',
            profile.songTitle || '',
            profile.songArtist || '',
            profile.songAudioUrl || '',
            profile.mediaType || 'retro-cassette',
            profile.mediaUrl || '',
            JSON.stringify(profile.tokens || {}),
            JSON.stringify(profile.layout || []),
            profile.rawCss || '',
            JSON.stringify(profile.topFriends || []),
            JSON.stringify(profile.photos || []),
            JSON.stringify(profile.friends || []),
            JSON.stringify(profile.favorites || []),
            profile.updatedAt || new Date().toISOString()
          )
          .run();

        for (const entry of profile.guestbook || []) {
          await db
            .prepare(`
              INSERT OR IGNORE INTO guestbook_entries (
                id, username, author, author_username, avatar_url, timestamp, content_html, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
              `${handle}_${entry.id}`,
              handle,
              entry.author,
              entry.username || '',
              entry.avatarUrl || '',
              entry.timestamp || 'Recently',
              entry.contentHtml || '',
              new Date().toISOString()
            )
            .run();
        }
      }

      // Seed initial direct messages
      for (const msg of INITIAL_MESSAGES) {
        await db
          .prepare(`
            INSERT OR IGNORE INTO direct_messages (
              id, from_username, from_display_name, from_avatar_url,
              to_username, subject, body, timestamp, read, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            msg.id,
            msg.fromUsername.toLowerCase(),
            msg.fromDisplayName || msg.fromUsername,
            msg.fromAvatarUrl || '',
            msg.toUsername.toLowerCase(),
            msg.subject,
            msg.body,
            msg.timestamp,
            msg.read ? 1 : 0,
            new Date().toISOString()
          )
          .run();
      }
    }

    // Ensure @kevin has kevingkday@gmail.com and is_admin = 1 in existing D1 databases
    await db
      .prepare("UPDATE profiles SET email = 'kevingkday@gmail.com', is_admin = 1 WHERE username = 'kevin'")
      .run();

    // Seed initial activities and profile views if none exist yet
    const existingActivity = await db
      .prepare('SELECT id FROM activities LIMIT 1')
      .first<{ id: string }>();

    if (!existingActivity) {
      for (const act of INITIAL_ACTIVITIES) {
        await db
          .prepare(`
            INSERT OR IGNORE INTO activities (
              id, actor_username, target_username, action_type, summary, metadata_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            act.id,
            act.actorUsername.toLowerCase(),
            act.targetUsername || null,
            act.actionType,
            act.summary,
            JSON.stringify(act.metadata || {}),
            act.createdAt
          )
          .run();
      }

      for (const view of INITIAL_PROFILE_VIEWS) {
        await db
          .prepare(`
            INSERT OR IGNORE INTO profile_views (
              id, profile_username, viewer_username, viewer_avatar_url, viewed_at
            ) VALUES (?, ?, ?, ?, ?)
          `)
          .bind(
            view.id,
            view.profileUsername.toLowerCase(),
            view.viewerUsername.toLowerCase(),
            view.viewerAvatarUrl || '',
            view.viewedAt
          )
          .run();
      }
    }
  } catch (err) {
    console.error('Error during D1 seeding:', err);
  }

  schemaInitialized = true;
}
