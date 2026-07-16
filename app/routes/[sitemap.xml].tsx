import type {Route} from './+types/[sitemap.xml]';
import {getAllTowns, PROVINCES} from '~/lib/catalog';

/**
 * Catalog-driven sitemap. Every town product page and every open province
 * page is listed the moment it exists in the catalog — no Shopify sitemap
 * dependency while the catalog is local. (The mock.shop-driven
 * sitemap.$type.$page route still exists but nothing links to it.)
 */
export async function loader({request}: Route.LoaderArgs) {
  const origin = new URL(request.url).origin;

  const staticPaths = [
    '/',
    '/shop',
    '/new-arrivals',
    '/provinces',
    '/request-your-town',
    '/contact',
  ];
  const provincePaths = PROVINCES.filter((p) => p.status === 'open').map(
    (p) => `/provinces/${p.slug}`,
  );
  const townPaths = getAllTowns().map((t) => `/products/${t.handle}`);

  const urls = [...staticPaths, ...provincePaths, ...townPaths]
    .map(
      (path) =>
        `  <url><loc>${origin}${path}</loc><changefreq>weekly</changefreq></url>`,
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
