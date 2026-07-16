import {britishColumbiaTowns} from './data.british-columbia';
import type {Province, TownProduct} from './types';

export * from './types';

/**
 * The full catalog. Add a province by importing its data file here —
 * navigation, search, sitemaps, and SEO pick it up automatically.
 * Built to hold 200+ SKUs; everything below stays O(catalog) or better.
 */
const ALL_TOWNS: TownProduct[] = [...britishColumbiaTowns];

export const PROVINCES: Province[] = [
  {slug: 'british-columbia', name: 'British Columbia', abbrev: 'BC', country: 'Canada', status: 'open'},
  {slug: 'alberta', name: 'Alberta', abbrev: 'AB', country: 'Canada', status: 'next'},
  {slug: 'saskatchewan', name: 'Saskatchewan', abbrev: 'SK', country: 'Canada', status: 'someday'},
  {slug: 'manitoba', name: 'Manitoba', abbrev: 'MB', country: 'Canada', status: 'someday'},
  {slug: 'ontario', name: 'Ontario', abbrev: 'ON', country: 'Canada', status: 'someday'},
  {slug: 'quebec', name: 'Quebec', abbrev: 'QC', country: 'Canada', status: 'someday'},
  {slug: 'new-brunswick', name: 'New Brunswick', abbrev: 'NB', country: 'Canada', status: 'someday'},
  {slug: 'nova-scotia', name: 'Nova Scotia', abbrev: 'NS', country: 'Canada', status: 'someday'},
  {slug: 'prince-edward-island', name: 'Prince Edward Island', abbrev: 'PE', country: 'Canada', status: 'someday'},
  {slug: 'newfoundland-and-labrador', name: 'Newfoundland and Labrador', abbrev: 'NL', country: 'Canada', status: 'someday'},
  {slug: 'yukon', name: 'Yukon', abbrev: 'YT', country: 'Canada', status: 'someday'},
  {slug: 'northwest-territories', name: 'Northwest Territories', abbrev: 'NT', country: 'Canada', status: 'someday'},
  {slug: 'nunavut', name: 'Nunavut', abbrev: 'NU', country: 'Canada', status: 'someday'},
];

const byHandle = new Map(ALL_TOWNS.map((t) => [t.handle, t]));

export function getAllTowns(): TownProduct[] {
  return ALL_TOWNS;
}

export function getTownByHandle(handle: string): TownProduct | undefined {
  return byHandle.get(handle);
}

export function getTownsByProvince(provinceSlug: string): TownProduct[] {
  return ALL_TOWNS.filter((t) => t.provinceSlug === provinceSlug).sort((a, b) =>
    a.city.localeCompare(b.city),
  );
}

export function getProvince(slug: string): Province | undefined {
  return PROVINCES.find((p) => p.slug === slug);
}

export function getNewArrivals(): TownProduct[] {
  return ALL_TOWNS.filter((t) => t.newArrival);
}

export function getMostOverlooked(): TownProduct[] {
  return ALL_TOWNS.filter((t) => t.mostOverlooked);
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
