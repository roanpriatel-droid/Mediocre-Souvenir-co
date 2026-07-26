import type {Route} from './+types/[sitemap.xml]';
import {
  getAllTowns,
  getCollections,
  getOpenRegions,
  regionPath,
} from '~/lib/catalog';
import {ARTICLES} from '~/lib/journal';
import {sitemapPagePaths} from '~/lib/site-pages';

/**
 * Catalog-driven sitemap. Every town product page, region page, collection,
 * article, and static page is listed the moment it exists — the static list
 * lives in app/lib/site-pages.ts, which site search reads from too, so a new
 * page cannot be searchable but unlisted (or the reverse).
 *
 * No Shopify sitemap dependency while the catalog is local. (The mock.shop
 * sitemap.$type.$page route still exists but nothing links to it.)
 */
export async function loader({request}: Route.LoaderArgs) {
  const origin = new URL(request.url).origin;

  /** Rough priority signal: products and regions earn crawl budget first. */
  const entries: {path: string; changefreq: string; priority: string}[] = [
    ...sitemapPagePaths().map((path) => ({
      path,
      changefreq: 'weekly',
      priority: path === '/' ? '1.0' : '0.7',
    })),
    ...getOpenRegions().map((region) => ({
      path: regionPath(region),
      changefreq: 'weekly',
      priority: '0.8',
    })),
    ...getCollections().map((collection) => ({
      path: `/collections/${collection.handle}`,
      changefreq: 'weekly',
      priority: '0.7',
    })),
    ...getAllTowns().map((town) => ({
      path: `/products/${town.handle}`,
      changefreq: 'weekly',
      priority: '0.9',
    })),
    ...ARTICLES.map((article) => ({
      path: `/journal/${article.slug}`,
      changefreq: 'monthly',
      priority: '0.5',
    })),
  ];

  const urls = entries
    .map(
      ({path, changefreq, priority}) =>
        `  <url><loc>${origin}${path}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': `max-age=${60 * 60 * 24}`,
    },
  });
}
