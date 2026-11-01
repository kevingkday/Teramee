import { parseSpotifyUrl, parseYouTubeUrl } from '../../src/lib/media-utils';
import type {
  SelectedSong,
  SongProvider,
  SongSearchHit,
  SongSearchResponse,
  SongSelectFailure
} from '../../src/lib/types';

/**
 * Profile soundtrack MCP.
 *
 * Open-source Spotify MCP servers (for example @xavifabregat/spotify-mcp) expose a
 * `search` tool against the Spotify Web API, then the caller saves the chosen track
 * URI. Spotify does not ship an official MCP, and that search needs a developer app.
 * When SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are set, `search_songs` uses that
 * same Web API search. Otherwise Spotify picks are resolved through open recording
 * data (Deezer ISRC → MusicBrainz URL relation → the public Spotify embed), and the
 * saved title and artist are read from Spotify itself.
 *
 * YouTube uses the Data API when YOUTUBE_API_KEY is set, and YouTube's search
 * endpoint otherwise. The retro cassette uses Apple's public iTunes Search API so
 * the jukebox gets a real preview and official title/artist.
 */

export const SEARCH_SONGS_TOOL = {
  name: 'search_songs',
  description:
    'Search Spotify, YouTube, or Apple Music for songs the user can save on a profile. Titles and artists come from that app.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Song, artist, or both' },
      provider: {
        type: 'string',
        enum: ['spotify', 'youtube', 'apple'],
        description: 'spotify, youtube, or apple (retro cassette / Apple Music)'
      },
      limit: { type: 'number', description: 'How many results to return (1-8, default 6)' }
    },
    required: ['query', 'provider']
  }
} as const;

export const SELECT_SONG_TOOL = {
  name: 'select_song',
  description:
    'Resolve one search result or pasted link to the official title, artist, and playable URL from Spotify, YouTube, or Apple Music.',
  inputSchema: {
    type: 'object',
    properties: {
      provider: { type: 'string', enum: ['spotify', 'youtube', 'apple'] },
      isrc: { type: 'string', description: 'Recording ISRC, used to find the Spotify track' },
      spotifyId: { type: 'string', description: 'Spotify track id' },
      videoId: { type: 'string', description: 'YouTube video id' },
      itunesId: { type: 'string', description: 'Apple Music / iTunes track id' },
      url: { type: 'string', description: 'Spotify track URL or YouTube URL' }
    },
    required: ['provider']
  }
} as const;

const MUSIC_MCP_TOOLS = [SEARCH_SONGS_TOOL, SELECT_SONG_TOOL];

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

const MB_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'Teramee/1.0 (profile soundtrack search)'
};

interface MbRelation {
  url?: { resource?: string };
}

let spotifyTokenCache: { value: string; expiresAt: number } | null = null;

function asProvider(value: unknown): SongProvider | null {
  if (value === 'spotify' || value === 'youtube' || value === 'apple') return value;
  return null;
}

function clampLimit(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return 6;
  return Math.min(8, Math.max(1, Math.round(parsed)));
}

function cleanQuery(value: unknown): string {
  return String(value || '')
    .replace(/[\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function safeHttpsUrl(url: string | undefined, allowedHost: (host: string) => boolean): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return '';
    if (!allowedHost(parsed.hostname.toLowerCase())) return '';
    return parsed.toString();
  } catch {
    return '';
  }
}

function safePreviewUrl(url?: string): string {
  return safeHttpsUrl(url, (host) => {
    return (
      host.endsWith('.itunes.apple.com') ||
      host.endsWith('.scdn.co') ||
      host.endsWith('.dzcdn.net')
    );
  });
}

function safeArtworkUrl(url?: string): string {
  return safeHttpsUrl(url, (host) => {
    return (
      host.endsWith('.mzstatic.com') ||
      host.endsWith('.dzcdn.net') ||
      host.endsWith('.ytimg.com') ||
      host.endsWith('.spotifycdn.com') ||
      host.endsWith('.scdn.co')
    );
  });
}

function upgradeItunesArtwork(url?: string): string {
  if (!url) return '';
  return safeArtworkUrl(url.replace(/\d+x\d+bb(?=\.)/, '300x300bb'));
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}

function spotifyTrackIdFromUrl(url: string): string | null {
  const parsed = parseSpotifyUrl(url);
  if (!parsed.isValid || parsed.mediaType !== 'track' || !parsed.id) return null;
  return parsed.id;
}

function canonicalSpotifyUrl(trackId: string): string {
  return `https://open.spotify.com/track/${trackId}`;
}

async function getSpotifyAppToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;

  if (spotifyTokenCache && spotifyTokenCache.expiresAt > Date.now() + 15_000) {
    return spotifyTokenCache.value;
  }

  const basic = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) return null;

  const payload = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!payload.access_token) return null;
  const expiresIn = typeof payload.expires_in === 'number' ? payload.expires_in : 3600;
  spotifyTokenCache = {
    value: payload.access_token,
    expiresAt: Date.now() + expiresIn * 1000
  };
  return payload.access_token;
}

interface SpotifyApiTrack {
  id?: string;
  name?: string;
  duration_ms?: number;
  preview_url?: string | null;
  external_urls?: { spotify?: string };
  artists?: { name?: string }[];
  album?: { name?: string; images?: { url?: string; width?: number }[] };
}

async function searchSpotifyApi(query: string, limit: number): Promise<SongSearchHit[] | null> {
  const token = await getSpotifyAppToken();
  if (!token) return null;

  const endpoint = new URL('https://api.spotify.com/v1/search');
  endpoint.searchParams.set('q', query);
  endpoint.searchParams.set('type', 'track');
  endpoint.searchParams.set('limit', String(limit));
  endpoint.searchParams.set('market', 'US');

  const payload = await fetchJson<{ tracks?: { items?: SpotifyApiTrack[] } }>(endpoint.toString(), {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
  });

  const hits: SongSearchHit[] = [];
  for (const track of payload.tracks?.items || []) {
    if (!track.id || !track.name) continue;
    const artist = (track.artists || [])
      .map((entry) => entry.name?.trim())
      .filter(Boolean)
      .join(', ');
    if (!artist) continue;
    const images = [...(track.album?.images || [])].sort((a, b) => (b.width || 0) - (a.width || 0));
    hits.push({
      id: track.id,
      provider: 'spotify',
      title: track.name,
      artist,
      album: track.album?.name,
      artworkUrl: safeArtworkUrl(images[0]?.url) || undefined,
      durationLabel:
        typeof track.duration_ms === 'number' ? formatClock(track.duration_ms / 1000) : undefined,
      sourceLabel: 'Spotify',
      canonical: true,
      spotifyId: track.id,
      mediaUrl: track.external_urls?.spotify || canonicalSpotifyUrl(track.id),
      previewUrl: safePreviewUrl(track.preview_url || undefined) || undefined
    });
  }
  return hits;
}

interface DeezerTrack {
  id?: number;
  title?: string;
  duration?: number;
  isrc?: string;
  preview?: string;
  artist?: { name?: string };
  album?: { title?: string; cover_medium?: string; cover_big?: string };
}

async function searchDeezerForSpotify(query: string, limit: number): Promise<SongSearchHit[]> {
  const endpoint = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${Math.min(limit * 2, 16)}`;
  const payload = await fetchJson<{ data?: DeezerTrack[]; error?: { message?: string } }>(endpoint);
  if (payload.error) {
    throw new Error(payload.error.message || 'Catalog search failed');
  }

  const hits: SongSearchHit[] = [];
  for (const track of payload.data || []) {
    const isrc = (track.isrc || '').trim().toUpperCase();
    const title = (track.title || '').trim();
    const artist = (track.artist?.name || '').trim();
    if (!track.id || !title || !artist || !/^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(isrc)) continue;
    hits.push({
      id: `isrc:${isrc}`,
      provider: 'spotify',
      title,
      artist,
      album: track.album?.title,
      artworkUrl: safeArtworkUrl(track.album?.cover_big || track.album?.cover_medium) || undefined,
      durationLabel: typeof track.duration === 'number' ? formatClock(track.duration) : undefined,
      sourceLabel: 'Spotify',
      canonical: false,
      isrc,
      previewUrl: safePreviewUrl(track.preview) || undefined
    });
  }
  return hits.slice(0, limit);
}

function youtubeText(node: unknown): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node !== 'object') return '';
  const record = node as { simpleText?: string; runs?: { text?: string }[] };
  if (typeof record.simpleText === 'string') return record.simpleText;
  if (Array.isArray(record.runs)) {
    return record.runs.map((run) => run.text || '').join('');
  }
  return '';
}

function collectVideoRenderers(node: unknown, found: Record<string, unknown>[], depth = 0): void {
  if (!node || depth > 14 || found.length >= 12) return;
  if (Array.isArray(node)) {
    for (const entry of node) collectVideoRenderers(entry, found, depth + 1);
    return;
  }
  if (typeof node !== 'object') return;
  const record = node as Record<string, unknown>;
  if (record.videoRenderer && typeof record.videoRenderer === 'object') {
    found.push(record.videoRenderer as Record<string, unknown>);
  }
  for (const value of Object.values(record)) {
    if (value && typeof value === 'object') collectVideoRenderers(value, found, depth + 1);
  }
}

async function searchYouTubeApi(query: string, limit: number, apiKey: string): Promise<SongSearchHit[]> {
  const endpoint = new URL('https://www.googleapis.com/youtube/v3/search');
  endpoint.searchParams.set('part', 'snippet');
  endpoint.searchParams.set('type', 'video');
  endpoint.searchParams.set('maxResults', String(limit));
  endpoint.searchParams.set('q', query);
  endpoint.searchParams.set('key', apiKey);

  const payload = await fetchJson<{
    items?: {
      id?: { videoId?: string };
      snippet?: {
        title?: string;
        channelTitle?: string;
        thumbnails?: { medium?: { url?: string }; high?: { url?: string } };
      };
    }[];
  }>(endpoint.toString());

  const hits: SongSearchHit[] = [];
  for (const item of payload.items || []) {
    const videoId = item.id?.videoId || '';
    const title = (item.snippet?.title || '').trim();
    const artist = (item.snippet?.channelTitle || '').trim();
    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId) || !title || !artist) continue;
    hits.push({
      id: videoId,
      provider: 'youtube',
      title,
      artist,
      artworkUrl:
        safeArtworkUrl(item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url) ||
        undefined,
      sourceLabel: 'YouTube',
      canonical: false,
      videoId,
      mediaUrl: `https://www.youtube.com/watch?v=${videoId}`
    });
  }
  return hits;
}

async function searchYouTubeInnerTube(query: string, limit: number): Promise<SongSearchHit[]> {
  const response = await fetch('https://www.youtube.com/youtubei/v1/search?prettyPrint=false', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: '2.20241101.00.00',
          hl: 'en',
          gl: 'US'
        }
      },
      query
    }),
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const payload = (await response.json()) as unknown;
  const renderers: Record<string, unknown>[] = [];
  collectVideoRenderers(payload, renderers);

  const hits: SongSearchHit[] = [];
  const seen = new Set<string>();
  for (const renderer of renderers) {
    const videoId = String(renderer.videoId || '');
    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId) || seen.has(videoId)) continue;
    const title = youtubeText(renderer.title).trim();
    const artist = (youtubeText(renderer.ownerText) || youtubeText(renderer.longBylineText)).trim();
    if (!title || !artist) continue;
    seen.add(videoId);
    const thumbs = (renderer.thumbnail as { thumbnails?: { url?: string }[] } | undefined)?.thumbnails;
    const artwork = thumbs && thumbs.length > 0 ? thumbs[thumbs.length - 1]?.url : '';
    hits.push({
      id: videoId,
      provider: 'youtube',
      title,
      artist,
      artworkUrl: safeArtworkUrl(artwork) || undefined,
      durationLabel: youtubeText(renderer.lengthText) || undefined,
      sourceLabel: 'YouTube',
      canonical: false,
      videoId,
      mediaUrl: `https://www.youtube.com/watch?v=${videoId}`
    });
    if (hits.length >= limit) break;
  }
  return hits;
}

interface ItunesTrack {
  kind?: string;
  trackId?: number;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackTimeMillis?: number;
  trackViewUrl?: string;
}

function itunesHit(track: ItunesTrack): SongSearchHit | null {
  if (track.kind !== 'song' || !track.trackId || !track.trackName || !track.artistName) return null;
  const itunesId = String(track.trackId);
  return {
    id: itunesId,
    provider: 'apple',
    title: track.trackName,
    artist: track.artistName,
    album: track.collectionName,
    artworkUrl: upgradeItunesArtwork(track.artworkUrl100) || undefined,
    durationLabel:
      typeof track.trackTimeMillis === 'number' ? formatClock(track.trackTimeMillis / 1000) : undefined,
    sourceLabel: 'Apple Music',
    canonical: true,
    itunesId,
    mediaUrl: safeHttpsUrl(track.trackViewUrl, (host) => host.endsWith('apple.com')) || '',
    previewUrl: safePreviewUrl(track.previewUrl) || undefined
  };
}

async function searchApple(query: string, limit: number): Promise<SongSearchHit[]> {
  const endpoint = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}&country=US`;
  const payload = await fetchJson<{ results?: ItunesTrack[] }>(endpoint);
  return (payload.results || []).map(itunesHit).filter((hit): hit is SongSearchHit => Boolean(hit));
}

async function lookupApple(itunesId: string): Promise<SelectedSong | SongSelectFailure> {
  if (!/^\d{2,16}$/.test(itunesId)) {
    return { ok: false, error: 'That Apple Music track id is not valid.' };
  }
  const endpoint = `https://itunes.apple.com/lookup?id=${encodeURIComponent(itunesId)}&country=US`;
  const payload = await fetchJson<{ results?: ItunesTrack[] }>(endpoint);
  const hit = (payload.results || []).map(itunesHit).find(Boolean);
  if (!hit) {
    return { ok: false, error: 'Apple Music did not return that song. Try another result.' };
  }
  return {
    ok: true,
    provider: 'apple',
    title: hit.title,
    artist: hit.artist,
    album: hit.album,
    artworkUrl: hit.artworkUrl,
    mediaUrl: hit.mediaUrl || '',
    previewUrl: hit.previewUrl || '',
    sourceLabel: 'Apple Music'
  };
}

interface SpotifyEmbedEntity {
  title?: string;
  name?: string;
  artists?: { name?: string }[];
  audioPreview?: { url?: string };
  visualIdentity?: { image?: { url?: string; maxWidth?: number }[] };
}

async function readSpotifyEmbed(trackId: string): Promise<{
  title: string;
  artist: string;
  artworkUrl?: string;
  previewUrl: string;
} | null> {
  if (!/^[A-Za-z0-9]{10,32}$/.test(trackId)) return null;
  const response = await fetch(`https://open.spotify.com/embed/track/${trackId}`, {
    headers: {
      Accept: 'text/html',
      'User-Agent': 'Mozilla/5.0 (compatible; Teramee/1.0)'
    },
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) return null;
  const html = await response.text();
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) return null;

  let entity: SpotifyEmbedEntity | null = null;
  try {
    const parsed = JSON.parse(match[1]) as {
      props?: {
        pageProps?: {
          state?: {
            data?: {
              entity?: SpotifyEmbedEntity;
            };
          };
        };
      };
    };
    entity = parsed.props?.pageProps?.state?.data?.entity || null;
  } catch {
    return null;
  }

  const title = (entity?.title || entity?.name || '').trim();
  const artist = (entity?.artists || [])
    .map((entry) => entry.name?.trim())
    .filter(Boolean)
    .join(', ');
  if (!title || !artist) return null;
  const images = [...(entity?.visualIdentity?.image || [])].sort(
    (a, b) => (b.maxWidth || 0) - (a.maxWidth || 0)
  );
  return {
    title,
    artist,
    artworkUrl: safeArtworkUrl(images[0]?.url) || undefined,
    previewUrl: safePreviewUrl(entity?.audioPreview?.url)
  };
}

async function selectSpotifyId(trackId: string): Promise<SelectedSong | SongSelectFailure> {
  const meta = await readSpotifyEmbed(trackId);
  if (!meta) {
    return { ok: false, error: 'Spotify did not return a title and artist for that track.' };
  }
  return {
    ok: true,
    provider: 'spotify',
    title: meta.title,
    artist: meta.artist,
    artworkUrl: meta.artworkUrl,
    mediaUrl: canonicalSpotifyUrl(trackId),
    previewUrl: meta.previewUrl,
    sourceLabel: 'Spotify'
  };
}

function spotifyTrackUrlsFromRelations(relations: MbRelation[]): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const relation of relations) {
    const resource = relation.url?.resource || '';
    const id = spotifyTrackIdFromUrl(resource);
    if (!id) continue;
    const url = canonicalSpotifyUrl(id);
    if (seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }
  return urls;
}

async function selectSpotifyIsrc(isrc: string): Promise<SelectedSong | SongSelectFailure> {
  const clean = isrc.trim().toUpperCase();
  if (!/^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(clean)) {
    return { ok: false, error: 'That song is missing a recording code, so Spotify cannot be matched.' };
  }

  const endpoint = `https://musicbrainz.org/ws/2/isrc/${encodeURIComponent(clean)}?inc=url-rels&fmt=json`;
  const response = await fetch(endpoint, {
    headers: MB_HEADERS,
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) {
    return { ok: false, error: 'Could not look up that recording. Try another song.' };
  }
  const payload = (await response.json()) as { recordings?: { relations?: MbRelation[] }[] };
  const relations = (payload.recordings || []).flatMap((recording) => recording.relations || []);
  const trackUrls = spotifyTrackUrlsFromRelations(relations).slice(0, 3);
  if (trackUrls.length === 0) {
    return {
      ok: false,
      error: 'Spotify does not have a public track linked to this recording. Try another result.'
    };
  }

  for (const trackUrl of trackUrls) {
    const trackId = spotifyTrackIdFromUrl(trackUrl);
    if (!trackId) continue;
    const selected = await selectSpotifyId(trackId);
    if (selected.ok) return selected;
  }
  return { ok: false, error: 'Spotify did not return a title and artist for that track.' };
}

async function selectYouTube(videoId: string): Promise<SelectedSong | SongSelectFailure> {
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    return { ok: false, error: 'That YouTube link is not a video.' };
  }
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`;
  try {
    const payload = await fetchJson<{
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
    }>(endpoint);
    const title = (payload.title || '').trim();
    const artist = (payload.author_name || '').trim();
    if (!title || !artist) {
      return { ok: false, error: 'YouTube did not return a title and channel for that video.' };
    }
    return {
      ok: true,
      provider: 'youtube',
      title,
      artist,
      artworkUrl: safeArtworkUrl(payload.thumbnail_url) || undefined,
      mediaUrl: watchUrl,
      previewUrl: '',
      sourceLabel: 'YouTube'
    };
  } catch {
    return { ok: false, error: 'YouTube did not return that video. Try another result.' };
  }
}

export async function executeSearchSongsTool(args: {
  query?: string;
  provider?: string;
  limit?: number;
}): Promise<SongSearchResponse> {
  const provider = asProvider(args.provider);
  const query = cleanQuery(args.query);
  const limit = clampLimit(args.limit);

  if (!provider) {
    return {
      provider: 'spotify',
      query,
      sourceLabel: 'Spotify',
      note: '',
      results: [],
      error: 'Choose Spotify, YouTube, or the retro cassette player before searching.'
    };
  }
  if (query.length < 2) {
    return {
      provider,
      query,
      sourceLabel: provider === 'apple' ? 'Apple Music' : provider === 'youtube' ? 'YouTube' : 'Spotify',
      note: '',
      results: [],
      error: 'Type at least 2 characters to search.'
    };
  }

  try {
    if (provider === 'spotify') {
      try {
        const apiHits = await searchSpotifyApi(query, limit);
        if (apiHits) {
          return {
            provider,
            query,
            sourceLabel: 'Spotify',
            note: 'Titles, artists, and track links come from the Spotify catalog.',
            results: apiHits,
            error: apiHits.length === 0 ? 'No Spotify tracks matched that search.' : undefined
          };
        }
      } catch {
        // Fall through to the open-catalog resolver when the Web API is unavailable.
      }

      const catalogHits = await searchDeezerForSpotify(query, limit);
      return {
        provider,
        query,
        sourceLabel: 'Spotify',
        note: 'Choose a result to save the official Spotify title, artist, and embed. The name is not typed in.',
        results: catalogHits,
        error: catalogHits.length === 0 ? 'No songs with a Spotify recording match that search.' : undefined
      };
    }

    if (provider === 'youtube') {
      const apiKey = process.env.YOUTUBE_API_KEY?.trim();
      const hits = apiKey
        ? await searchYouTubeApi(query, limit, apiKey)
        : await searchYouTubeInnerTube(query, limit);
      return {
        provider,
        query,
        sourceLabel: 'YouTube',
        note: 'The saved title and channel come from YouTube when you pick a video.',
        results: hits,
        error: hits.length === 0 ? 'No YouTube videos matched that search.' : undefined
      };
    }

    const hits = await searchApple(query, limit);
    return {
      provider,
      query,
      sourceLabel: 'Apple Music',
      note: 'The cassette plays the Apple Music preview. Title and artist come from Apple Music.',
      results: hits,
      error: hits.length === 0 ? 'No Apple Music songs matched that search.' : undefined
    };
  } catch {
    return {
      provider,
      query,
      sourceLabel: provider === 'apple' ? 'Apple Music' : provider === 'youtube' ? 'YouTube' : 'Spotify',
      note: '',
      results: [],
      error: 'Song search is unavailable right now. Try again in a moment.'
    };
  }
}

export async function executeSelectSongTool(args: {
  provider?: string;
  isrc?: string;
  spotifyId?: string;
  videoId?: string;
  itunesId?: string;
  url?: string;
}): Promise<SelectedSong | SongSelectFailure> {
  const provider = asProvider(args.provider);
  if (!provider) {
    return { ok: false, error: 'Choose Spotify, YouTube, or the retro cassette player first.' };
  }

  try {
    const pasted = (args.url || '').trim();
    if (pasted) {
      if (provider === 'spotify') {
        const trackId = spotifyTrackIdFromUrl(pasted);
        if (!trackId) {
          return { ok: false, error: 'Paste a Spotify track link, like open.spotify.com/track/…' };
        }
        return await selectSpotifyId(trackId);
      }
      if (provider === 'youtube') {
        const parsed = parseYouTubeUrl(pasted);
        if (!parsed.isValid || !parsed.videoId) {
          return { ok: false, error: 'Paste a YouTube link, like youtube.com/watch?v=…' };
        }
        return await selectYouTube(parsed.videoId);
      }
      return { ok: false, error: 'Paste is available for Spotify and YouTube. Search Apple Music for the cassette.' };
    }

    if (provider === 'spotify') {
      if (args.spotifyId) return await selectSpotifyId(String(args.spotifyId));
      if (args.isrc) return await selectSpotifyIsrc(String(args.isrc));
      return { ok: false, error: 'Pick a song from the search results.' };
    }
    if (provider === 'youtube') {
      if (!args.videoId) return { ok: false, error: 'Pick a YouTube video from the search results.' };
      return await selectYouTube(String(args.videoId));
    }
    if (!args.itunesId) return { ok: false, error: 'Pick a song from the search results.' };
    return await lookupApple(String(args.itunesId));
  } catch {
    return { ok: false, error: 'Could not load that song from the selected app. Try another result.' };
  }
}

export async function dispatchMusicMcpRpc(rpc: JsonRpcRequest): Promise<JsonRpcResponse> {
  const id = rpc.id ?? null;

  if (rpc.method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2025-03-26',
        serverInfo: { name: 'teramee-music-mcp', version: '1.0.0' },
        capabilities: { tools: {} }
      }
    };
  }

  if (rpc.method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: { tools: MUSIC_MCP_TOOLS }
    };
  }

  if (rpc.method === 'tools/call') {
    const params = (rpc.params || {}) as {
      name?: string;
      arguments?: Record<string, unknown>;
    };
    const toolArgs = params.arguments || {};

    if (params.name === SEARCH_SONGS_TOOL.name) {
      const searchResult = await executeSearchSongsTool({
        query: typeof toolArgs.query === 'string' ? toolArgs.query : '',
        provider: typeof toolArgs.provider === 'string' ? toolArgs.provider : '',
        limit: typeof toolArgs.limit === 'number' ? toolArgs.limit : undefined
      });
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(searchResult) }],
          structuredContent: searchResult,
          isError: Boolean(searchResult.error && searchResult.results.length === 0)
        }
      };
    }

    if (params.name === SELECT_SONG_TOOL.name) {
      const selected = await executeSelectSongTool({
        provider: typeof toolArgs.provider === 'string' ? toolArgs.provider : '',
        isrc: typeof toolArgs.isrc === 'string' ? toolArgs.isrc : undefined,
        spotifyId: typeof toolArgs.spotifyId === 'string' ? toolArgs.spotifyId : undefined,
        videoId: typeof toolArgs.videoId === 'string' ? toolArgs.videoId : undefined,
        itunesId: typeof toolArgs.itunesId === 'string' ? toolArgs.itunesId : undefined,
        url: typeof toolArgs.url === 'string' ? toolArgs.url : undefined
      });
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(selected) }],
          structuredContent: selected,
          isError: selected.ok === false
        }
      };
    }

    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Unknown MCP tool: ${String(params.name)}` }
    };
  }

  return {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not found: ${rpc.method}` }
  };
}

export async function handleMusicMcpRequest(request: Request): Promise<Response> {
  if (request.method === 'GET') {
    return new Response(
      JSON.stringify({
        name: 'teramee-music-mcp',
        transport: 'streamable-http',
        tools: MUSIC_MCP_TOOLS
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = (await request.json()) as JsonRpcRequest;
    const responsePayload = await dispatchMusicMcpRpc(body);
    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: `Parse error: ${message}` }
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
