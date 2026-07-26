import {
  getCollection,
  getCollections,
  townsInCollection,
} from './collections';
import {britishColumbiaTowns} from './data.british-columbia';
import {REGIONS, regionPath} from './regions';
import type {Region, TownProduct} from './types';

export * from './types';
export * from './collections';
export {REGIONS, regionPath};

/**
 * The full catalog. Add a region by importing its data file here —
 * navigation, search, sitemaps, and SEO pick it up automatically.
 * Built to hold 200+ SKUs; everything below stays O(catalog) or better.
 */
const ALL_TOWNS: TownProduct[] = [...britishColumbiaTowns];

const byHandle = new Map(ALL_TOWNS.map((t) => [t.handle, t]));

export function getAllTowns(): TownProduct[] {
  return ALL_TOWNS;
}

export function getTownByHandle(handle: string): TownProduct | undefined {
  return byHandle.get(handle);
}

export function getTownsByRegion(regionSlug: string): TownProduct[] {
  return ALL_TOWNS.filter((t) => t.provinceSlug === regionSlug).sort((a, b) =>
    a.city.localeCompare(b.city),
  );
}

export function getRegion(
  slug: string,
  kind?: Region['kind'],
): Region | undefined {
  return REGIONS.find(
    (r) => r.slug === slug && (kind === undefined || r.kind === kind),
  );
}

export function getRegionsByCountry(country: Region['country']): Region[] {
  return REGIONS.filter((r) => r.country === country);
}

export function getOpenRegions(): Region[] {
  return REGIONS.filter((r) => r.status === 'open');
}

export function getNewArrivals(): TownProduct[] {
  return ALL_TOWNS.filter((t) => t.newArrival);
}

export function getMostOverlooked(): TownProduct[] {
  return ALL_TOWNS.filter((t) => t.mostOverlooked);
}

/** Every town filed into a curated collection, A–Z. */
export function getCollectionTowns(handle: string): TownProduct[] {
  const collection = getCollection(handle);
  return collection ? townsInCollection(collection, ALL_TOWNS) : [];
}

/** Collection handle → how many towns are on that rack. Drives the index page. */
export function getCollectionCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const collection of getCollections()) {
    counts[collection.handle] = ALL_TOWNS.filter(collection.includes).length;
  }
  return counts;
}

/** The collections a single town appears in — cross-links on the product page. */
export function getCollectionsForTown(town: TownProduct) {
  return getCollections().filter((collection) => collection.includes(town));
}

/** Simple prefix/substring town search — the hero's "Find your town". */
export function searchTowns(query: string, limit = 8): TownProduct[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const starts: TownProduct[] = [];
  const contains: TownProduct[] = [];
  for (const town of ALL_TOWNS) {
    const name = town.city.toLowerCase();
    if (name.startsWith(q)) starts.push(town);
    else if (name.includes(q) || town.provinceState.toLowerCase().includes(q))
      contains.push(town);
  }
  return [...starts, ...contains].slice(0, limit);
}

/**
 * ── The swap point ─────────────────────────────────────────────────────
 * Every town tee currently checks out against one mock.shop variant, with
 * the real product carried in cart line attributes (Town / Size / Colorway).
 * When the real Shopify + Printify store is linked:
 *   1. point PUBLIC_STORE_DOMAIN etc. at the real storefront,
 *   2. replace this query with `product(handle: $handle)` so each town maps
 *      to its own Printify-synced product and size variants,
 *   3. delete the attribute plumbing if variants carry size natively.
 * Nothing else in the app should need to change.
 */
export const PURCHASABLE_STANDIN_QUERY = `#graphql
  query PurchasableStandin($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    product(handle: "men-t-shirt") {
      id
      title
      variants(first: 1) {
        nodes {
          id
          availableForSale
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
` as const;
