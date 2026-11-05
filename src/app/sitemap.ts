import type { MetadataRoute } from 'next';
import { seededProfileUsernames, SITE_ORIGIN, sitemapEntries } from '@/lib/seo';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries(seededProfileUsernames()).map((entry) => ({
    url: new URL(entry.path, SITE_ORIGIN).toString(),
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority
  }));
}
