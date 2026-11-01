'use client';

import React, { useEffect, useState } from 'react';
import { Check, Loader2, Music, Search, X } from 'lucide-react';
import { POPULAR_RETRO_SOUNDTRACKS, parseSpotifyUrl, parseYouTubeUrl } from '@/lib/media-utils';
import type { SelectedSong, SongProvider, SongSearchHit, SongSearchResponse, SongSelectFailure } from '@/lib/types';

interface SongSearchPickerProps {
  mediaType?: 'retro-cassette' | 'spotify' | 'youtube' | 'audio';
  songTitle: string;
  songArtist: string;
  mediaUrl?: string;
  songAudioUrl?: string;
  onSelect: (song: {
    title: string;
    artist: string;
    mediaUrl: string;
    previewUrl: string;
  }) => void;
  onClear: () => void;
}

function providerForMedia(mediaType?: string): SongProvider {
  if (mediaType === 'spotify') return 'spotify';
  if (mediaType === 'youtube') return 'youtube';
  return 'apple';
}

function providerLabel(provider: SongProvider): string {
  if (provider === 'spotify') return 'Spotify';
  if (provider === 'youtube') return 'YouTube';
  return 'Apple Music';
}

function savedFrom(mediaType: string | undefined, mediaUrl?: string, songAudioUrl?: string): string | null {
  if (parseSpotifyUrl(mediaUrl || '').isValid) return 'Spotify';
  if (parseYouTubeUrl(mediaUrl || '').isValid) return 'YouTube';
  if (songAudioUrl && /itunes\.apple\.com|scdn\.co/.test(songAudioUrl)) return 'Apple Music';
  if (mediaType === 'spotify' || mediaType === 'youtube') return null;
  return null;
}

async function callMusicTool<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const response = await fetch('/api/mcp/music', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: `song-${Date.now()}`,
      method: 'tools/call',
      params: { name, arguments: args }
    })
  });
  const payload = (await response.json()) as {
    error?: { message?: string };
    result?: { structuredContent?: T; isError?: boolean; content?: { text?: string }[] };
  };
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message || 'Song search failed.');
  }
  if (!payload.result?.structuredContent) {
    throw new Error(payload.result?.content?.[0]?.text || 'Song search failed.');
  }
  return payload.result.structuredContent;
}

export function SongSearchPicker({
  mediaType,
  songTitle,
  songArtist,
  mediaUrl,
  songAudioUrl,
  onSelect,
  onClear
}: SongSearchPickerProps) {
  const provider = providerForMedia(mediaType);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SongSearchHit[]>([]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [linkDraft, setLinkDraft] = useState('');
  const [artworkByKey, setArtworkByKey] = useState<Record<string, string>>({});

  useEffect(() => {
    if (provider === 'apple') return;
    const url = (mediaUrl || '').trim();
    const valid =
      provider === 'spotify' ? parseSpotifyUrl(url).isValid : parseYouTubeUrl(url).isValid;
    if (!valid) return;

    let cancelled = false;
    callMusicTool<SelectedSong | SongSelectFailure>('select_song', { provider, url })
      .then((selected) => {
        if (cancelled || !selected.ok) return;
        if (selected.artworkUrl) {
          setArtworkByKey((prev) => ({
            ...prev,
            [selected.title + selected.artist]: selected.artworkUrl!
          }));
        }
        if (selected.title !== songTitle || selected.artist !== songArtist || selected.mediaUrl !== url) {
          onSelect({
            title: selected.title,
            artist: selected.artist,
            mediaUrl: selected.mediaUrl,
            previewUrl: selected.previewUrl
          });
        }
      })
      .catch(() => {
        // Keep the saved title if the app cannot be reached.
      });

    return () => {
      cancelled = true;
    };
    // Refresh official metadata when the saved link or player changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, mediaUrl]);

  const source = savedFrom(mediaType, mediaUrl, songAudioUrl);
  const expected = providerLabel(provider);
  const mismatch = Boolean(songTitle) && source !== null && source !== expected && provider !== 'apple';
  const legacyTyped = Boolean(songTitle) && source === null;

  async function runSearch(nextQuery: string) {
    const trimmed = nextQuery.trim();
    setQuery(nextQuery);
    setError('');
    setResults([]);
    setNote('');
    if (trimmed.length < 2) {
      setError('Type at least 2 characters to search.');
      return;
    }
    setSearching(true);
    try {
      const found = await callMusicTool<SongSearchResponse>('search_songs', {
        query: trimmed,
        provider,
        limit: 6
      });
      setResults(found.results || []);
      setNote(found.note || '');
      if (found.error && (found.results || []).length === 0) {
        setError(found.error);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Song search failed.');
    } finally {
      setSearching(false);
    }
  }

  async function choose(hit: SongSearchHit) {
    setSelectingId(hit.id);
    setError('');
    try {
      const selected = await callMusicTool<SelectedSong | SongSelectFailure>('select_song', {
        provider: hit.provider,
        isrc: hit.isrc,
        spotifyId: hit.spotifyId,
        videoId: hit.videoId,
        itunesId: hit.itunesId
      });
      if (!selected.ok) {
        setError(selected.error);
        return;
      }
      if (selected.artworkUrl) {
        setArtworkByKey((prev) => ({ ...prev, [selected.title + selected.artist]: selected.artworkUrl! }));
      }
      onSelect({
        title: selected.title,
        artist: selected.artist,
        mediaUrl: selected.mediaUrl,
        previewUrl: selected.previewUrl
      });
      setResults([]);
      setQuery('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save that song.');
    } finally {
      setSelectingId(null);
    }
  }

  async function applyPastedLink() {
    const url = linkDraft.trim();
    if (!url) return;
    setSelectingId('link');
    setError('');
    try {
      const selected = await callMusicTool<SelectedSong | SongSelectFailure>('select_song', {
        provider,
        url
      });
      if (!selected.ok) {
        setError(selected.error);
        return;
      }
      onSelect({
        title: selected.title,
        artist: selected.artist,
        mediaUrl: selected.mediaUrl,
        previewUrl: selected.previewUrl
      });
      setLinkDraft('');
      setResults([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not read that link.');
    } finally {
      setSelectingId(null);
    }
  }

  const savedArtwork = artworkByKey[songTitle + songArtist];

  return (
    <div className="space-y-3 pt-1">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-300" htmlFor="song-search">
          Search {expected}
        </label>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {provider === 'spotify' &&
            'Song title and artist are filled in from Spotify when you pick a track.'}
          {provider === 'youtube' &&
            'Song title and channel are filled in from YouTube when you pick a video.'}
          {provider === 'apple' &&
            'The cassette uses an Apple Music preview. Title and artist come from Apple Music.'}
        </p>
      </div>

      {songTitle ? (
        <div className="flex items-center gap-3 rounded-lg border border-cyan-500/30 bg-slate-900/80 p-2.5">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-slate-800 bg-cover bg-center text-cyan-300"
            style={savedArtwork ? { backgroundImage: `url("${savedArtwork}")` } : undefined}
          >
            {!savedArtwork && <Music className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-cyan-300">
              {source ? `Saved from ${source}` : 'Saved track'}
            </p>
            <p className="truncate text-sm font-semibold text-white">{songTitle}</p>
            <p className="truncate text-xs text-slate-400">{songArtist}</p>
            {mismatch && (
              <p className="mt-1 text-[11px] text-amber-300">
                This player needs a {expected} song. Search below to replace it.
              </p>
            )}
            {legacyTyped && (
              <p className="mt-1 text-[11px] text-amber-300">
                This name was typed by hand. Search below to replace it with a real track.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClear}
            className="rounded-md border border-slate-700 px-2 py-1 text-[11px] text-slate-300 hover:text-white"
          >
            <span className="inline-flex items-center gap-1">
              <X className="h-3 w-3" />
              Remove
            </span>
          </button>
        </div>
      ) : (
        <p className="text-[11px] text-slate-500">No song saved yet.</p>
      )}

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void runSearch(query);
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            id="song-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              provider === 'youtube' ? 'Search YouTube videos' : `Search ${expected} songs`
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-8 pr-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="rounded-lg border border-cyan-500/50 bg-cyan-600/20 px-3 py-2 text-xs font-bold text-cyan-100 disabled:opacity-60"
        >
          {searching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Search'}
        </button>
      </form>

      {note && results.length > 0 && <p className="text-[11px] text-slate-400">{note}</p>}
      {error && <p className="text-[11px] text-amber-300">{error}</p>}

      {results.length > 0 && (
        <ul className="space-y-1.5">
          {results.map((hit) => {
            const busy = selectingId === hit.id;
            return (
              <li key={hit.id}>
                <button
                  type="button"
                  disabled={Boolean(selectingId)}
                  onClick={() => void choose(hit)}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-left hover:border-cyan-500/60 disabled:opacity-60"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-slate-800 bg-cover bg-center text-slate-400"
                    style={hit.artworkUrl ? { backgroundImage: `url("${hit.artworkUrl}")` } : undefined}
                  >
                    {!hit.artworkUrl && <Music className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-white">{hit.title}</span>
                    <span className="block truncate text-[11px] text-slate-400">
                      {hit.artist}
                      {hit.album ? ` · ${hit.album}` : ''}
                      {hit.durationLabel ? ` · ${hit.durationLabel}` : ''}
                    </span>
                  </span>
                  {busy ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-300" />
                  ) : (
                    <Check className="h-3.5 w-3.5 text-slate-600" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="space-y-1.5">
        <span className="text-[10px] font-semibold text-slate-400">Try a 2006 anthem:</span>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_RETRO_SOUNDTRACKS.map((track) => (
            <button
              key={track.name}
              type="button"
              onClick={() => void runSearch(`${track.name} ${track.artist}`)}
              className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-cyan-300 hover:bg-slate-700"
            >
              ♫ {track.name}
            </button>
          ))}
        </div>
      </div>

      {provider !== 'apple' && (
        <div className="space-y-1.5 border-t border-slate-700/70 pt-2">
          <label className="text-[11px] font-semibold text-slate-300" htmlFor="song-link">
            Or paste a {expected} link
          </label>
          <div className="flex gap-2">
            <input
              id="song-link"
              type="url"
              value={linkDraft}
              onChange={(event) => setLinkDraft(event.target.value)}
              placeholder={
                provider === 'spotify'
                  ? 'https://open.spotify.com/track/…'
                  : 'https://www.youtube.com/watch?v=…'
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
            <button
              type="button"
              disabled={Boolean(selectingId) || !linkDraft.trim()}
              onClick={() => void applyPastedLink()}
              className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-bold text-slate-200 disabled:opacity-50"
            >
              {selectingId === 'link' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Use link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
