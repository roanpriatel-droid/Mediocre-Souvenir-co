import type {Route} from './+types/api.upsell';
import {
  loadCollectionProducts,
  UTILITY_COLLECTIONS,
} from '~/lib/shopify-collections';
import {productsInOpenRegions} from '~/lib/shopify-catalog';

/**
 * One suggestion for the cart, drawn from Now Open so we never propose a
 * region that has nothing to sell. Handles already in the cart are passed in
 * and excluded.
 */
export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const exclude = new Set(
    (url.searchParams.get('exclude') ?? '').split(',').filter(Boolean),
  );

  let products = await loadCollectionProducts(
    context.storefront,
    UTILITY_COLLECTIONS.nowOpen,
    12,
  );
  if (!products.length) {
    products = await loadCollectionProducts(
      context.storefront,
      UTILITY_COLLECTIONS.allSouvenirs,
      12,
    );
  }
  if (!products.length) {
    products = await productsInOpenRegions(context.storefront, 12);
  }

  const suggestion =
    products.find(
      (product) => product.availableForSale && !exclude.has(product.handle),
    ) ?? null;

  return Response.json(
    {suggestion},
    {headers: {'Cache-Control': 'public, max-age=300'}},
  );
}
