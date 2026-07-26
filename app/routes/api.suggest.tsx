import type {Route} from './+types/api.suggest';
import {suggestProducts} from '~/lib/shopify-search';

/** Typeahead source for the hero search box. */
export async function loader({request, context}: Route.LoaderArgs) {
  const query = new URL(request.url).searchParams.get('q') ?? '';
  const suggestions = await suggestProducts(context.storefront, query);
  return Response.json(
    {suggestions},
    {headers: {'Cache-Control': 'public, max-age=60'}},
  );
}
