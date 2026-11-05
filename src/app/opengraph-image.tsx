import { ImageResponse } from 'next/og';
import { OG_SIZE } from '@/lib/seo';
import { SiteShareImage } from '@/lib/share-image';

export const alt = 'Teramee — your space, your sound, your rules';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';

/**
 * Prerendered during `next build` into a static PNG under `out/`.
 * Production is a Cloudflare Worker serving that static export, not OpenNext,
 * so this ImageResponse does not run on the worker. Skipping custom fonts and
 * remote fetches keeps it inside next/og's 500KB edge bundle limit.
 */
export default function Image() {
  return new ImageResponse(<SiteShareImage />, { ...size });
}
