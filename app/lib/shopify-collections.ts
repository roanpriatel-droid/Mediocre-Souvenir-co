/**
 * The Shopify collection layer.
 *
 * The store carries 69 smart collections: one per region (13 Canadian
 * provinces and territories, 50 US states — kebab-case handles that match
 * `Region.slug` exactly), plus six utility collections. Those collections are
 * now the merchandising spine of the site: the region grid, the nav, the
 * homepage rows, and every /collections/* page read from here.
 *
 * Two rules run through all of it:
 *
 *  1. **Live data wins, but never at the cost of the page.** Every helper
 *     swallows Storefront errors and returns an empty result. A region with no
 *     products — whether because it genuinely has none, or because the store is
 *     unreachable — renders the waitlist state, which is a real page with a
 *     real job. Nothing here can produce a broken collection.
 *  2. **The local catalog stays as enrichment.** Town facts, the generative
 *     mockups, and the certificate copy live in app/lib/catalog and are keyed
 *     by product handle. When a Shopify product matches a known town we show
 *     the town's facts; when it does not, the product stands on its own.
 */

import type {Storefront} from '@shopify/hydrogen';

import {REGIONS, type Region} from './catalog';

/** The six non-region collections, by handle. */
export const UTILITY_COLLECTIONS = {
  allSouvenirs: 'all-souvenirs',
  newArrivals: 'new-arrivals',
  canada: 'canada',
  unitedStates: 'united-states',
  nowOpen: 'now-open',
  comingInDueTime: 'coming-in-due-time',
} as const;

/** Region collection handles are the region slugs — verified against REGIONS. */
export function regionCollectionHandle(region: Pick<Region, 'slug'>): string {
  return region.slug;
}

export function regionCollectionPath(region: Pick<Region, 'slug'>): string {
  return `/collections/${region.slug}`;
}

const regionByHandle = new Map(REGIONS.map((region) => [region.slug, region]));

/** The Region behind a collection handle, when that handle is a region. */
export function regionForCollectionHandle(handle: string): Region | undefined {
  return regionByHandle.get(handle);
}

export function isRegionCollection(handle: string): boolean {
  return regionByHandle.has(handle);
}

/**
 * Handles that belong to a page that already exists. Shopify stores publish
 * these URLs by convention and inbound links assume them.
 */
export const COLLECTION_REDIRECTS: Record<string, string> = {
  all: '/collections/all-souvenirs',
  'all-towns': '/collections/all-souvenirs',
  new: '/collections/new-arrivals',
  frontpage: '/',

  /*
   * Retired curated racks. These were live and in the sitemap before the
   * catalogue moved to Shopify, so they may be indexed or linked externally.
   * The three template racks map onto the print-style filter that replaced
   * them; the rest go to the full rack.
   */
  'classic-varsity': '/collections/all-souvenirs?style=varsity',
  'retro-postcard': '/collections/all-souvenirs?style=greetings',
  'faded-slogan': '/collections/all-souvenirs?style=tour',
  'most-overlooked': '/collections/all-souvenirs',
  'ivory-tees': '/collections/all-souvenirs',
  'butter-tees': '/collections/all-souvenirs',
  'blue-jean-tees': '/collections/all-souvenirs',
  'brick-tees': '/collections/all-souvenirs',
  'sage-tees': '/collections/all-souvenirs',
  'village-tees': '/collections/all-souvenirs',
  'small-town-tees': '/collections/all-souvenirs',
  'proper-town-tees': '/collections/all-souvenirs',
  'technically-a-city-tees': '/collections/all-souvenirs',
};

export function countryCollectionHandle(country: Region['country']): string {
  return country === 'Canada'
    ? UTILITY_COLLECTIONS.canada
    : UTILITY_COLLECTIONS.unitedStates;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const MONEY_FRAGMENT = `#graphql
  fragment SouvenirMoney on MoneyV2 {
    amount
    currencyCode
  }
` as const;

/** The card shape every product grid renders. Kept lean — grids are wide. */
export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment SouvenirCard on Product {
    id
    handle
    title
    availableForSale
    tags
    featuredImage {
      id
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...SouvenirMoney
      }
      maxVariantPrice {
        ...SouvenirMoney
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...SouvenirMoney
      }
    }
    # Two is enough to answer "is this a one-variant product?" — which decides
    # whether quick-add can add it outright or has to send you to the PDP.
    variants(first: 2) {
      nodes {
        id
        availableForSale
      }
    }
  }
  ${MONEY_FRAGMENT}
` as const;

export const COLLECTION_QUERY = `#graphql
  query SouvenirCollection($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
        width
        height
      }
      products(first: $first) {
        nodes {
          ...SouvenirCard
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

/**
 * The paginated collection query.
 *
 * Sorting and availability filtering happen in the API, not in the browser —
 * with 1,600 products a client-side sort would only reorder whatever page you
 * happened to be looking at, which is worse than no sort at all.
 */
export const COLLECTION_PAGE_QUERY = `#graphql
  query SouvenirCollectionPage(
    $handle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
        width
        height
      }
      products(
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
        sortKey: $sortKey
        reverse: $reverse
        filters: $filters
      ) {
        nodes {
          ...SouvenirCard
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

/**
 * Market-neutral variant of the collection query.
 *
 * `@inContext(country:)` scopes results to that market's catalog, so a product
 * published only to the Canadian market returns nothing under a US context.
 * When the contextual query comes back empty we retry with this one, which
 * asks the shop's default catalog. Prices are then the shop default rather
 * than market-localised — an acceptable trade for actually showing the product.
 */
export const COLLECTION_QUERY_NEUTRAL = `#graphql
  query SouvenirCollectionNeutral($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
        width
        height
      }
      products(first: $first) {
        nodes {
          ...SouvenirCard
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

/**
 * One query for the whole region grid.
 *
 * The Storefront API has no product-count field on Collection, so we ask for a
 * single product per collection — enough to answer the only question the grid
 * asks: is this region open, or is it a waitlist.
 *
 * Deliberately has **no `@inContext`**. Whether a region has stock is not a
 * per-market question for this grid's purposes, and scoping it to a market the
 * catalog is not published to made all 63 regions read "in due time".
 */
export const COLLECTIONS_STATUS_QUERY = `#graphql
  query SouvenirCollectionsStatus($first: Int!) {
    collections(first: $first) {
      nodes {
        id
        handle
        title
        products(first: 1) {
          nodes {
            id
          }
        }
      }
    }
  }
` as const;

// ---------------------------------------------------------------------------
// Loaders
// ---------------------------------------------------------------------------

export interface SouvenirCard {
  id: string;
  handle: string;
  title: string;
  availableForSale: boolean;
  tags: string[];
  featuredImage: {
    id?: string | null;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  priceRange: {
    minVariantPrice: {amount: string; currencyCode: string};
    maxVariantPrice: {amount: string; currencyCode: string};
  };
  compareAtPriceRange: {
    minVariantPrice: {amount: string; currencyCode: string};
  };
  variants?: {nodes: {id: string; availableForSale: boolean}[]};
}

export interface LoadedCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: {url: string; altText?: string | null} | null;
  products: SouvenirCard[];
}

/**
 * A collection and its products, or null when the collection does not exist.
 *
 * Never throws. A Storefront failure is logged and reported as "no
 * collection", which every caller already has to handle — the alternative is a
 * 500 on a page whose empty state is a designed, useful surface.
 */
export async function loadCollection(
  storefront: Storefront,
  handle: string,
  first = 100,
): Promise<LoadedCollection | null> {
  try {
    const data = await storefront.query(COLLECTION_QUERY, {
      variables: {handle, first},
      cache: storefront.CacheShort(),
    });
    const collection = data?.collection;
    if (!collection) {
      // A null collection is not an error, so nothing used to be logged and
      // the fallback quietly hid a misconfigured store. Say it out loud —
      // Oxygen log drains pick this up.
      console.warn(
        `[msc:collection] "${handle}" is not visible to the Storefront API ` +
          `(missing, or not published to this sales channel)`,
      );
      return null;
    }

    let products = (collection.products?.nodes ?? []) as SouvenirCard[];

    // Empty under the buyer's market usually means the catalog is not
    // published to that market, not that the rack is bare. Ask the shop's
    // default catalog before believing it.
    if (!products.length) {
      console.warn(
        `[msc:collection] "${handle}" returned 0 products in the buyer market; ` +
          `retrying without market context`,
      );
      try {
        const neutral = await storefront.query(COLLECTION_QUERY_NEUTRAL, {
          variables: {handle, first},
          cache: storefront.CacheShort(),
        });
        const neutralProducts = (neutral?.collection?.products?.nodes ??
          []) as SouvenirCard[];
        if (neutralProducts.length) {
          console.warn(
            `[msc:collection] "${handle}" has ${neutralProducts.length} ` +
              `products in the default catalog — the buyer market is missing them`,
          );
          products = neutralProducts;
        }
      } catch (error) {
        console.error(`[msc:collection] "${handle}" neutral retry failed`, error);
      }
    }

    return {
      id: collection.id,
      handle: collection.handle,
      title: collection.title,
      description: collection.description ?? '',
      image: collection.image ?? null,
      products,
    };
  } catch (error) {
    console.error(`[msc:collection] "${handle}" failed to load`, error);
    return null;
  }
}

export interface CollectionPage {
  id: string;
  handle: string;
  title: string;
  description: string;
  /** Connection shape Hydrogen's <Pagination> consumes directly. */
  products: {
    nodes: SouvenirCard[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
      endCursor?: string | null;
    };
  };
}

const EMPTY_PAGE_INFO = {
  hasNextPage: false,
  hasPreviousPage: false,
  startCursor: null,
  endCursor: null,
};

/**
 * One page of a collection, sorted and filtered by the API.
 *
 * Falls back to the shop's default catalog when the buyer's market returns an
 * empty first page — the same market-mismatch guard as loadCollection, since
 * that failure mode is what made a fully stocked store look closed.
 */
export async function loadCollectionPage(
  storefront: Storefront,
  handle: string,
  variables: Record<string, unknown>,
): Promise<CollectionPage | null> {
  try {
    const data = await storefront.query(COLLECTION_PAGE_QUERY, {
      variables: {...variables, handle},
      cache: storefront.CacheShort(),
    });
    const collection = data?.collection;
    if (!collection) {
      console.warn(
        `[msc:collection] "${handle}" is not visible to the Storefront API ` +
          `(missing, or not published to this sales channel)`,
      );
      return null;
    }

    let products = collection.products;
    const isFirstPage = !variables.startCursor && !variables.endCursor;

    if (!products?.nodes?.length && isFirstPage) {
      console.warn(
        `[msc:collection] "${handle}" returned 0 products in the buyer market; ` +
          `retrying without market context`,
      );
      try {
        const neutral = await storefront.query(COLLECTION_QUERY_NEUTRAL, {
          variables: {handle, first: 100},
          cache: storefront.CacheShort(),
        });
        const neutralNodes = neutral?.collection?.products?.nodes ?? [];
        if (neutralNodes.length) {
          console.warn(
            `[msc:collection] "${handle}" has ${neutralNodes.length} products ` +
              `in the default catalog — the buyer market is missing them`,
          );
          products = {nodes: neutralNodes, pageInfo: EMPTY_PAGE_INFO};
        }
      } catch (error) {
        console.error(`[msc:collection] "${handle}" neutral retry failed`, error);
      }
    }

    return {
      id: collection.id,
      handle: collection.handle,
      title: collection.title,
      description: collection.description ?? '',
      products: {
        nodes: (products?.nodes ?? []) as SouvenirCard[],
        pageInfo: products?.pageInfo ?? EMPTY_PAGE_INFO,
      },
    };
  } catch (error) {
    console.error(`[msc:collection] "${handle}" page failed to load`, error);
    return null;
  }
}

/** Just the products of a collection — for homepage rows. Never throws. */
export async function loadCollectionProducts(
  storefront: Storefront,
  handle: string,
  first = 8,
): Promise<SouvenirCard[]> {
  const collection = await loadCollection(storefront, handle, first);
  return collection?.products ?? [];
}

export interface RegionStatus {
  /** Region slug → true when the region collection holds at least one product. */
  open: Record<string, boolean>;
  /** False when the Storefront lookup failed, so callers can fall back. */
  live: boolean;
}

/**
 * Which regions are open, straight from the store.
 *
 * When the lookup fails we return `live: false` and an empty map; callers then
 * fall back to the hand-maintained `status` on each Region, which is what the
 * site used before the collections existed. The grid renders either way.
 */
export async function loadRegionStatus(
  storefront: Storefront,
): Promise<RegionStatus> {
  try {
    const data = await storefront.query(COLLECTIONS_STATUS_QUERY, {
      variables: {first: 250},
      cache: storefront.CacheShort(),
    });
    const nodes = data?.collections?.nodes ?? [];
    if (!nodes.length) return {open: {}, live: false};

    const open: Record<string, boolean> = {};
    for (const node of nodes) {
      if (!regionByHandle.has(node.handle)) continue;
      open[node.handle] = (node.products?.nodes?.length ?? 0) > 0;
    }

    // Not one region collection is reachable — they are not published to this
    // sales channel. Work out which regions are stocked from the products
    // instead, so the grid reflects the catalogue rather than the config.
    if (!Object.keys(open).length) {
      console.warn(
        '[msc:collections] no region collections visible to the Storefront ' +
          'API; deriving region status from products',
      );
      const {regionStatusFromProducts} = await import('./shopify-catalog');
      return {open: await regionStatusFromProducts(storefront), live: true};
    }

    return {open, live: true};
  } catch (error) {
    console.error('[msc:collections] region status failed to load', error);
    return {open: {}, live: false};
  }
}

/**
 * Is this region open? Live data when we have it, local config otherwise.
 * `status === 'open'` in app/lib/catalog/regions.ts is the fallback answer.
 */
export function isRegionOpen(region: Region, status: RegionStatus): boolean {
  if (status.live && region.slug in status.open) {
    return status.open[region.slug];
  }
  return region.status === 'open';
}

/** Price label for a card — a range collapses to one figure when it is flat. */
export function cardPriceLabel(product: SouvenirCard): string {
  const min = Number(product.priceRange.minVariantPrice.amount);
  const max = Number(product.priceRange.maxVariantPrice.amount);
  const currency = product.priceRange.minVariantPrice.currencyCode;
  const symbol = currency === 'USD' || currency === 'CAD' ? '$' : '';
  const fmt = (value: number) =>
    `${symbol}${Number.isInteger(value) ? value : value.toFixed(2)}`;
  return min === max ? fmt(min) : `${fmt(min)}–${fmt(max)}`;
}
