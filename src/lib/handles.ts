const HANDLE_PATTERN = /^[a-z0-9_]{1,32}$/;

/**
 * Normalize a profile handle from a URL segment.
 * `tom` is the historical alias for `kevin`.
 * Returns null when the segment cannot be a Teramee handle.
 */
export function normalizeProfileHandle(raw: string): string | null {
  let handle = raw.trim();
  try {
    handle = decodeURIComponent(handle);
  } catch {
    return null;
  }
  handle = handle.trim().toLowerCase();
  if (handle.startsWith('@')) handle = handle.slice(1);
  if (!HANDLE_PATTERN.test(handle)) return null;
  if (handle === 'tom') return 'kevin';
  return handle;
}

/** Read `@sarah` or `/user/sarah` (and the `%40` form) from a pathname. */
export function readProfileHandle(pathname: string): string | null {
  let path = pathname;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    path = pathname;
  }
  const match = path.match(/^\/(?:user\/|@)([^/?#]+)/i);
  if (!match?.[1]) return null;
  return normalizeProfileHandle(match[1]);
}
