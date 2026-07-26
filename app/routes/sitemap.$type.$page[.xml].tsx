import {redirect} from 'react-router';

/**
 * Shopify's paginated sitemap shards (/sitemap/products/1.xml).
 *
 * The catalog is local, so `getSitemap` has nothing to read and the real
 * sitemap is the single catalog-driven /sitemap.xml — which comfortably fits
 * the whole catalog well past 200 SKUs. This route stays only to forward the
 * conventional URLs rather than error on them.
 *
 * If the catalog ever moves into Shopify and outgrows one file, restore the
 * `getSitemap` implementation from git history and index the shards here.
 */
export async function loader() {
  return redirect('/sitemap.xml', 301);
}
