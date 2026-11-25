import type {Route} from './+types/api.upsell';
import {
  loadCollectionProducts,
  UTILITY_COLLECTIONS,
} from '~/lib/shopify-collections';
import {PRINT_STYLES, productsInOpenRegions} from '~/lib/shopify-catalog';
import {productsByHandle} from '~/lib/shopify-search';
import {regionForProduct} from '~/lib/town-copy';
import type {SouvenirCard} from '~/lib/shopify-collections';

/**
 * One suggestion for the cart. Handles already in the cart are passed in and
 * excluded. In order of relevance:
 *
 * 1. Another print of a town already in the cart ("complete the set").
 * 2. Another town from the same state or province.
 * 3. Anything on the rack.
 *
 * It used to be the first product in Now Open, which is alphabetical, so
 * every cart suggested 100 Mile House, BC.
 */
export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const inCart = (url.searchParams.get('exclude') ?? '')
    .split(',')
    .filter(Boolean);
  const exclude = new Set(inCart);
  const available = (product: SouvenirCard) =>
    product.availableForSale && !exclude.has(product.handle);

  let suggestion: SouvenirCard | null = null;
  const anchor = inCart[inCart.length - 1];

  if (anchor) {
    // 1 · Same town, another print.
    const style = PRINT_STYLES.find((s) => anchor.endsWith(`-${s.value}`));
    if (style) {
      const base = anchor.slice(0, -(style.value.length + 1));
      const siblings = await productsByHandle(
        context.storefront,
        PRINT_STYLES.map((s) => `${base}-${s.value}`),
      );
      suggestion = siblings.find(available) ?? null;
    }

    // 2 · Same region, another town.
    if (!suggestion) {
      const region = regionForProduct({title: '', handle: anchor});
      if (region) {
        const town = style
          ? anchor.slice(0, -(style.value.length + 1))
          : anchor;
        const nearby = await loadCollectionProducts(
          context.storefront,
          region.slug,
          24,
        );
        const others = nearby.filter(
          (product) => available(product) && !product.handle.startsWith(town),
        );
        // Spread the pick so carts from one region do not all see one town.
        suggestion = others.length
          ? others[hash(anchor) % others.length]
          : null;
      }
    }
  }

  // 3 · Anything on the rack.
  if (!suggestion) {
    let products = await loadCollectionProducts(
      context.storefront,
      UTILITY_COLLECTIONS.allSouvenirs,
      24,
    );
    if (!products.length) {
      products = await productsInOpenRegions(context.storefront, 24);
    }
    const candidates = products.filter(available);
    suggestion = candidates.length
      ? candidates[hash(inCart.join(',')) % candidates.length]
      : null;
  }

  return Response.json(
    {
      suggestion,
      sameTown: Boolean(
        suggestion && anchor && sameTown(anchor, suggestion.handle),
      ),
    },
    {headers: {'Cache-Control': 'public, max-age=300'}},
  );
}

function sameTown(a: string, b: string): boolean {
  const strip = (handle: string) => {
    const style = PRINT_STYLES.find((s) => handle.endsWith(`-${s.value}`));
    return style ? handle.slice(0, -(style.value.length + 1)) : handle;
  };
  return strip(a) === strip(b);
}

/** A small stable hash, so the same cart sees the same suggestion. */
function hash(text: string): number {
  let value = 0;
  for (let i = 0; i < text.length; i++) {
    value = (value * 31 + text.charCodeAt(i)) >>> 0;
  }
  return value;
}
