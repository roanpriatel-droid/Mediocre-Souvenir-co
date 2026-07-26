import type {Route} from './+types/[sitemap.xml]';
import {
  getAllTowns,
  getCollections,
  getOpenRegions,
  REGIONS,
} from '~/lib/catalog';
import {UTILITY_COLLECTIONS} from '~/lib/shopify-collections';
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
    // The six utility collections that anchor the nav.
    ...Object.values(UTILITY_COLLECTIONS).map((handle) => ({
      path: `/collections/${handle}`,
      changefreq: 'daily',
      priority: '0.9',
    })),
    // All 63 region collections. Unopened regions are indexable on purpose:
    // each one is a real waitlist page, and "ohio souvenir t-shirt" is the
    // exact query we want to be the answer to before we have the shirts.
    ...REGIONS.map((region) => ({
      path: `/collections/${region.slug}`,
      changefreq: getOpenRegions().some((open) => open.slug === region.slug)
        ? 'weekly'
        : 'monthly',
      priority: region.status === 'open' ? '0.9' : '0.6',
    })),
    // Locally curated racks (template, colorway, town size).
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

  // The page registry and the collection lists overlap (All Souvenirs, New
  // Arrivals, the country collections). First entry wins.
  const seen = new Set<string>();
  const urls = entries
    .filter(({path}) => !seen.has(path) && seen.add(path))
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
