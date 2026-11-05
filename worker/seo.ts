import type { D1Database } from './schema';
import { normalizeProfileHandle } from '../src/lib/handles';
import {
  mergeProfileUsernames,
  renderSitemapXml,
  rewriteProfileHtml,
  shareCardFromProfile,
  shareCardFromSeed,
  sitemapEntries,
  type ShareCard
} from '../src/lib/seo';
import type { ProfileDesignTokens } from '../src/lib/types';
import { renderProfileCardPng } from './og-png';

export interface SeoEnv {
  DB?: D1Database;
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };
}

interface ProfileShareRow {
  username: string;
  display_name: string;
  tagline: string | null;
  headline: string | null;
  bio_html: string | null;
  tokens_json: string | null;
  updated_at: string | null;
}

function decodePath(pathname: string): string {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

async function fetchAsset(env: SeoEnv, request: Request, pathname?: string): Promise<Response | null> {
  if (!env.ASSETS) return null;
  const url = pathname ? new URL(pathname, request.url) : new URL(request.url);
  const assetRequest = pathname ? new Request(url.toString(), request) : request;
  try {
    return await env.ASSETS.fetch(assetRequest);
  } catch (err) {
    console.error('Asset fetch failed:', err);
    return null;
  }
}

function isFoundAsset(response: Response | null): response is Response {
  return Boolean(response && response.ok && response.status !== 404);
}

function asPng(response: Response): Response {
  const headers = new Headers(response.headers);
  const type = headers.get('content-type') || '';
  if (!type.startsWith('image/')) headers.set('content-type', 'image/png');
  if (!headers.has('cache-control')) headers.set('cache-control', 'public, max-age=86400');
  return new Response(response.body, { status: response.status, headers });
}

async function notFoundPage(request: Request, env: SeoEnv): Promise<Response> {
  // `404.html` is served at `/404`. Requesting the `.html` path is a redirect.
  const asset = (await fetchAsset(env, request, '/404')) || (await fetchAsset(env, request, '/404.html'));
  const headers = new Headers(asset?.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'no-store');
  headers.set('x-robots-tag', 'noindex');
  if (isFoundAsset(asset)) {
    return new Response(asset.body, { status: 404, headers });
  }
  return new Response('Not Found', {
    status: 404,
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' }
  });
}

async function shareCardForHandle(env: SeoEnv, handle: string): Promise<ShareCard | null> {
  if (env.DB) {
    try {
      const row = await env.DB
        .prepare(
          `SELECT username, display_name, tagline, headline, bio_html, tokens_json, updated_at
           FROM profiles WHERE username = ? LIMIT 1`
        )
        .bind(handle)
        .first<ProfileShareRow>();
      if (row) {
        let tokens = {} as ProfileDesignTokens;
        try {
          tokens = JSON.parse(row.tokens_json || '{}') as ProfileDesignTokens;
        } catch {
          tokens = {} as ProfileDesignTokens;
        }
        return shareCardFromProfile({
          username: row.username,
          displayName: row.display_name,
          tagline: row.tagline || '',
          headline: row.headline || '',
          bioHtml: row.bio_html || '',
          tokens,
          updatedAt: row.updated_at || ''
        });
      }
    } catch (err) {
      console.error('Profile share lookup failed:', err);
    }
  }
  return shareCardFromSeed(handle);
}

async function serveProfileImage(request: Request, env: SeoEnv, rawHandle: string): Promise<Response> {
  // next/og writes extensionless PNGs. Social crawlers need image/png even when
  // the asset server guesses a generic type, including for the ?hash URL.
  const direct = await fetchAsset(env, request);
  if (isFoundAsset(direct)) return asPng(direct);

  const handle = normalizeProfileHandle(rawHandle);
  if (!handle) return notFoundPage(request, env);

  const staticImage = await fetchAsset(env, request, `/user/${handle}/opengraph-image`);
  if (isFoundAsset(staticImage)) return asPng(staticImage);

  const card = await shareCardForHandle(env, handle);
  if (!card) return notFoundPage(request, env);

  try {
    const png = await renderProfileCardPng(card);
    return new Response(png as unknown as BodyInit, {
      status: 200,
      headers: {
        'content-type': 'image/png',
        'cache-control': 'public, max-age=86400'
      }
    });
  } catch (err) {
    console.error('OG image render failed:', err);
    return notFoundPage(request, env);
  }
}

async function serveProfilePage(request: Request, env: SeoEnv, rawHandle: string): Promise<Response> {
  const direct = await fetchAsset(env, request);
  if (isFoundAsset(direct)) return direct;

  let literal = rawHandle.trim().toLowerCase();
  try {
    literal = decodeURIComponent(literal);
  } catch {
    literal = rawHandle.trim().toLowerCase();
  }
  if (literal.startsWith('@')) literal = literal.slice(1);

  if (/^[a-z0-9_]{1,32}$/.test(literal)) {
    const literalPage = await fetchAsset(env, request, `/user/${literal}`);
    if (isFoundAsset(literalPage)) return literalPage;
  }

  const handle = normalizeProfileHandle(rawHandle);
  if (!handle) return notFoundPage(request, env);

  const canonicalPage = await fetchAsset(env, request, `/user/${handle}`);
  if (isFoundAsset(canonicalPage)) return canonicalPage;

  const card = await shareCardForHandle(env, handle);
  if (!card) return notFoundPage(request, env);

  const shell = await fetchAsset(env, request, '/profile-shell');
  if (!isFoundAsset(shell)) return notFoundPage(request, env);

  const html = rewriteProfileHtml(await shell.text(), card, new URL(request.url).origin);
  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate'
    }
  });
}

async function serveSitemap(request: Request, env: SeoEnv): Promise<Response> {
  const updatedAt: Record<string, string> = {};
  const dbNames: string[] = [];
  if (env.DB) {
    try {
      const result = await env.DB
        .prepare(`SELECT username, updated_at FROM profiles WHERE username != 'tom'`)
        .all<{ username: string; updated_at: string }>();
      for (const row of result.results || []) {
        dbNames.push(row.username);
        if (row.updated_at) updatedAt[row.username.toLowerCase()] = row.updated_at;
      }
    } catch (err) {
      console.error('Sitemap profile query failed:', err);
    }
  }

  const xml = renderSitemapXml(new URL(request.url).origin, sitemapEntries(mergeProfileUsernames(dbNames), updatedAt));
  return new Response(xml, {
    status: 200,
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=300'
    }
  });
}

/**
 * Handle SEO routes that the static asset layer cannot answer on its own:
 * real profile HTML (including /@handle), missing-handle 404s, dynamic OG
 * images, and a sitemap that includes profiles created after the build.
 * Returns null so the caller can serve a normal static asset.
 */
export async function handleSeoRequest(request: Request, env: SeoEnv, pathname: string): Promise<Response | null> {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;

  const path = decodePath(pathname);
  if (path === '/sitemap.xml') return serveSitemap(request, env);
  if (path === '/profile-shell' || path === '/profile-shell/') return notFoundPage(request, env);

  const route = path.match(/^\/(?:user\/|@)([^/]+)(\/.*)?$/i);
  if (!route) return null;

  const rest = route[2] || '';
  if (rest && rest !== '/') {
    if (/^\/(?:opengraph-image|twitter-image)(?:[./-][^/]*)?$/i.test(rest)) {
      return serveProfileImage(request, env, route[1]);
    }
    return null;
  }

  return serveProfilePage(request, env, route[1]);
}
