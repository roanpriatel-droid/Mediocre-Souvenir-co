import type {Route} from './+types/sitemap.$type.$page[.xml]';
import {getSitemap} from '@shopify/hydrogen';

/**
 * Generated sitemaps for store resources — products above all, of which there
 * are far too many for the hand-built /sitemap.xml. Hydrogen pages these
 * straight from the Storefront API.
 */
export async function loader({
  request,
  params,
  context: {storefront},
}: Route.LoaderArgs) {
  const response = await getSitemap({
    storefront,
    request,
    params,
    locales: ['EN-CA', 'EN-US'],
    getLink: ({type, baseUrl, handle}) => `${baseUrl}/${type}/${handle}`,
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);
  return response;
}
