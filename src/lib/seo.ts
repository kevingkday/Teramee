import { INITIAL_PROFILES } from './initial-profiles';
import type { ProfileDesignTokens, UserProfile } from './types';

export const SITE_ORIGIN = 'https://www.teramee.com';
export const SITE_NAME = 'Teramee';
export const SITE_TITLE = 'Teramee | Your Space, Your Sound, Your Rules';
export const SITE_DESCRIPTION =
  'The modern expressive social web. Customize your digital space with custom CSS, music players, Top 8 connections, and retro aesthetics with bulletproof sandboxing.';

export const OG_SIZE = { width: 1200, height: 630 } as const;

export const DEFAULT_SHARE_IMAGE = {
  url: '/opengraph-image',
  width: OG_SIZE.width,
  height: OG_SIZE.height,
  alt: 'Teramee — your space, your sound, your rules'
} as const;

export interface ShareCard {
  username: string;
  displayName: string;
  title: string;
  description: string;
  imageDescription: string;
  backgroundColor: string;
  headerColor: string;
  accentColor: string;
  cardColor: string;
  textColor: string;
  updatedAt: string;
}

export interface SitemapEntry {
  path: string;
  lastModified?: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function clampText(value: string, max: number): string {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, Math.max(0, max - 3)).trimEnd()}...`;
}

export function cssColor(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (!HEX_COLOR.test(trimmed)) return fallback;
  if (trimmed.length === 4) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return trimmed.toLowerCase();
}

export function contrastText(hex: string): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  return luminance > 150 ? '#1f2937' : '#ffffff';
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

type ShareSource = Pick<
  UserProfile,
  'username' | 'displayName' | 'tagline' | 'headline' | 'bioHtml' | 'tokens' | 'updatedAt'
>;

export function shareCardFromProfile(profile: ShareSource): ShareCard {
  const username = profile.username.toLowerCase();
  const displayName = (profile.displayName || username).trim() || username;
  const description = clampText(
    profile.tagline || profile.headline || stripHtml(profile.bioHtml || '') || 'A customized profile on Teramee.',
    180
  );
  const tokens: Partial<ProfileDesignTokens> = profile.tokens || {};
  return {
    username,
    displayName,
    title: `${displayName} (@${username}) | Teramee`,
    description,
    imageDescription: clampText(description, 110),
    backgroundColor: cssColor(tokens.backgroundColor, '#020617'),
    headerColor: cssColor(tokens.headerColor, '#003366'),
    accentColor: cssColor(tokens.accentColor, '#22d3ee'),
    cardColor: cssColor(tokens.cardColor, '#ffffff'),
    textColor: cssColor(tokens.textColor, '#1f2937'),
    updatedAt: profile.updatedAt || ''
  };
}

export function shareCardFromSeed(username: string): ShareCard | null {
  const profile = INITIAL_PROFILES[username];
  if (!profile) return null;
  return shareCardFromProfile(profile);
}

export function seededProfileUsernames(): string[] {
  return Object.keys(INITIAL_PROFILES)
    .filter((name) => name !== 'tom')
    .sort();
}

export function mergeProfileUsernames(extra: string[]): string[] {
  const names = new Set(seededProfileUsernames());
  for (const name of extra) {
    const cleaned = name.toLowerCase().trim();
    if (cleaned && cleaned !== 'tom' && /^[a-z0-9_]{1,32}$/.test(cleaned)) {
      names.add(cleaned);
    }
  }
  return [...names].sort();
}

export function sitemapEntries(usernames: string[], updatedAt: Record<string, string> = {}): SitemapEntry[] {
  const pages: SitemapEntry[] = [
    { path: '/', changeFrequency: 'daily', priority: 1 },
    { path: '/technology', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/signup', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/login', changeFrequency: 'yearly', priority: 0.3 }
  ];
  const profiles: SitemapEntry[] = usernames.map((username) => ({
    path: `/user/${username}`,
    lastModified: updatedAt[username] || INITIAL_PROFILES[username]?.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8
  }));
  return [...pages, ...profiles];
}

export function renderSitemapXml(origin: string, entries: SitemapEntry[]): string {
  const body = entries
    .map((entry) => {
      const loc = escapeHtml(new URL(entry.path, origin).toString());
      const lastmod = entry.lastModified
        ? `\n    <lastmod>${escapeHtml(entry.lastModified)}</lastmod>`
        : '';
      return `  <url>\n    <loc>${loc}</loc>${lastmod}\n    <changefreq>${entry.changeFrequency}</changefreq>\n    <priority>${entry.priority.toFixed(1)}</priority>\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function replaceMeta(html: string, attr: 'name' | 'property', key: string, content: string): string {
  const tag = `<meta ${attr}="${key}" content="${escapeHtml(content)}"/>`;
  const pattern = new RegExp(`<meta\\s+[^>]*${attr}=["']${key}["'][^>]*>`, 'i');
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace('</head>', `${tag}</head>`);
}

function replaceLink(html: string, rel: string, href: string): string {
  const tag = `<link rel="${rel}" href="${escapeHtml(href)}"/>`;
  const pattern = new RegExp(`<link\\s+[^>]*rel=["']${rel}["'][^>]*>`, 'i');
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace('</head>', `${tag}</head>`);
}

/** Point a static profile shell's head tags at one member. */
export function rewriteProfileHtml(html: string, card: ShareCard, origin: string): string {
  const pageUrl = new URL(`/user/${card.username}`, origin).toString();
  const imageUrl = new URL(`/user/${card.username}/opengraph-image`, origin).toString();
  let next = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(card.title)}</title>`);
  next = replaceMeta(next, 'name', 'description', card.description);
  next = replaceMeta(next, 'property', 'og:title', card.title);
  next = replaceMeta(next, 'property', 'og:description', card.description);
  next = replaceMeta(next, 'property', 'og:url', pageUrl);
  next = replaceMeta(next, 'property', 'og:type', 'profile');
  next = replaceMeta(next, 'property', 'og:image', imageUrl);
  next = replaceMeta(next, 'property', 'og:image:alt', `${card.displayName} on Teramee`);
  next = replaceMeta(next, 'name', 'twitter:card', 'summary_large_image');
  next = replaceMeta(next, 'name', 'twitter:title', card.title);
  next = replaceMeta(next, 'name', 'twitter:description', card.description);
  next = replaceMeta(next, 'name', 'twitter:image', imageUrl);
  next = replaceLink(next, 'canonical', pageUrl);
  return next;
}
