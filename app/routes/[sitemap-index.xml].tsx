import type {Route} from './+types/[sitemap-index.xml]';
import {getSitemapIndex} from '@shopify/hydrogen';
import {siteOrigin} from '~/lib/site-origin';

/**
 * The one sitemap robots.txt hands to crawlers. It lists every page of the
 * product sitemap (2,154 products span several pages, and the count changes)
 * plus the hand-built /sitemap.xml of regions, towns, guides and pages.
 */
export async function loader({request, context: {storefront}}: Route.LoaderArgs) {
  const response = await getSitemapIndex({
    storefront,
    // Hydrogen builds the links from the request's origin; give it the public
    // domain so a crawl through a preview address still lists the real URLs.
    request: new Request(`${siteOrigin(request)}/sitemap-index.xml`),
    types: ['products'],
    customChildSitemaps: ['/sitemap.xml'],
  });
  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);
  return response;
}
