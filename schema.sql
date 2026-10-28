-- Cloudflare D1 Schema for Teramee

CREATE TABLE IF NOT EXISTS profiles (
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
);

CREATE TABLE IF NOT EXISTS guestbook_entries (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  author TEXT NOT NULL,
  author_username TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  timestamp TEXT NOT NULL,
  content_html TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_guestbook_username ON guestbook_entries(username, created_at DESC);

CREATE TABLE IF NOT EXISTS direct_messages (
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
);

CREATE INDEX IF NOT EXISTS idx_messages_to_user ON direct_messages(to_username, created_at DESC);

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  actor_username TEXT NOT NULL,
  target_username TEXT,
  action_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  metadata_json TEXT DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_actor ON activities(actor_username, created_at DESC);

CREATE TABLE IF NOT EXISTS profile_views (
  id TEXT PRIMARY KEY,
  profile_username TEXT NOT NULL,
  viewer_username TEXT NOT NULL,
  viewer_avatar_url TEXT DEFAULT '',
  viewed_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profile_views_lookup ON profile_views(profile_username, viewed_at DESC);

