import {redirect} from 'react-router';
import type {Route} from './+types/provinces.$slug';
import {getRegion} from '~/lib/catalog';

/**
 * Region landing pages now live at /collections/:slug, where the Shopify
 * smart collection for that province is. This URL shape predates the
 * collections and stays routable so old links, the previous sitemap, and
 * anything already indexed keep working.
 */
export async function loader({params}: Route.LoaderArgs) {
  const region = getRegion(params.slug ?? '', 'province');
  return redirect(region ? `/collections/${region.slug}` : '/provinces', 301);
}
