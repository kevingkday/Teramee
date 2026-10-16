-- Cloudflare D1 Database Schema for Teramee
-- Run manually if needed: npx wrangler d1 execute teramee-db --file=./schema.sql

CREATE TABLE IF NOT EXISTS profiles (
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
);

CREATE TABLE IF NOT EXISTS guestbook_entries (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  author TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  timestamp TEXT NOT NULL,
  content_html TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_guestbook_username ON guestbook_entries(username, created_at DESC);
