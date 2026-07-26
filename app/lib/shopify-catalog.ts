import type {Storefront} from '@shopify/hydrogen';
import {REGIONS, type Region} from './catalog';
import {
  PRODUCT_CARD_FRAGMENT,
  type SouvenirCard,
} from './shopify-collections';

/**
 * Region merchandising derived from products, not collections.
 *
 * The store's 69 smart collections are not published to the headless sales
 * channel — the Storefront API can see exactly one collection ("frontpage")
 * while every product is visible, priced and in stock. Publishing them is a
 * one-off admin action and remains the right fix, but the shop must not be a
 * blank wall until somebody clicks it.
 *
 * So: fetch the products and group them ourselves. Region is encoded in both
 * the title ("Toledo, OH — Varsity") and the handle ("toledo-oh-varsity"), and
 * we read the title first because it is the field a merchant is most likely to
 * keep tidy. Everything here is a fallback — when a real collection is
 * reachable it always wins.
 */

const MAX_PAGES = 8;
const PAGE_SIZE = 250;

const ALL_PRODUCTS_QUERY = `#graphql
  query SouvenirAllProducts($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: TITLE) {
      nodes {
        ...SouvenirCard
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

const NEWEST_PRODUCTS_QUERY = `#graphql
  query SouvenirNewestProducts($first: Int!) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...SouvenirCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

/**
 * Every product in the store, paged. Cached hard — this is a whole-catalogue
 * read and only runs on the fallback path.
 */
export async function loadAllProducts(
  storefront: Storefront,
): Promise<SouvenirCard[]> {
  const all: SouvenirCard[] = [];
  let after: string | null = null;

  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const data: any = await storefront.query(ALL_PRODUCTS_QUERY, {
        variables: {first: PAGE_SIZE, after},
        cache: storefront.CacheLong(),
      });
      const nodes = (data?.products?.nodes ?? []) as SouvenirCard[];
      all.push(...nodes);

      if (!data?.products?.pageInfo?.hasNextPage) break;
      after = data.products.pageInfo.endCursor;
      if (!after) break;
    }
  } catch (error) {
    console.error('[msc:catalog] product sweep failed', error);
  }

  return all;
}

export async function loadNewestProducts(
  storefront: Storefront,
  first = 8,
): Promise<SouvenirCard[]> {
  try {
    const data = await storefront.query(NEWEST_PRODUCTS_QUERY, {
      variables: {first},
      cache: storefront.CacheShort(),
    });
    return (data?.products?.nodes ?? []) as SouvenirCard[];
  } catch (error) {
    console.error('[msc:catalog] newest products failed', error);
    return [];
  }
}

const abbrevToRegion = new Map(
  REGIONS.map((region) => [region.abbrev.toUpperCase(), region]),
);

/**
 * The region a product belongs to.
 *
 * "Toledo, OH — Varsity" → OH. Falls back to the handle
 * ("toledo-oh-varsity"), where the region sits between the city and the
 * template. Returns undefined rather than guessing.
 */
export function regionForProduct(product: SouvenirCard): Region | undefined {
  const fromTitle = /,\s*([A-Za-z]{2})\b/.exec(product.title);
  if (fromTitle) {
    const region = abbrevToRegion.get(fromTitle[1].toUpperCase());
    if (region) return region;
  }

  for (const segment of product.handle.split('-')) {
    if (segment.length === 2) {
      const region = abbrevToRegion.get(segment.toUpperCase());
      if (region) return region;
    }
  }

  return undefined;
}

export interface DerivedCatalog {
  products: SouvenirCard[];
  /** Region slug → its products, A–Z by title. */
  byRegion: Map<string, SouvenirCard[]>;
}

export function groupByRegion(products: SouvenirCard[]): DerivedCatalog {
  const byRegion = new Map<string, SouvenirCard[]>();
  for (const product of products) {
    const region = regionForProduct(product);
    if (!region) continue;
    const bucket = byRegion.get(region.slug);
    if (bucket) bucket.push(product);
    else byRegion.set(region.slug, [product]);
  }
  for (const bucket of byRegion.values()) {
    bucket.sort((a, b) => a.title.localeCompare(b.title));
  }
  return {products, byRegion};
}

/** The whole catalogue, grouped. One sweep, cached by the Storefront client. */
export async function loadDerivedCatalog(
  storefront: Storefront,
): Promise<DerivedCatalog> {
  return groupByRegion(await loadAllProducts(storefront));
}

/** Products for one region, without needing its collection to be published. */
export async function productsForRegion(
  storefront: Storefront,
  region: Region,
): Promise<SouvenirCard[]> {
  const {byRegion} = await loadDerivedCatalog(storefront);
  return byRegion.get(region.slug) ?? [];
}

/** Region slug → has products. Same shape loadRegionStatus returns. */
export async function regionStatusFromProducts(
  storefront: Storefront,
): Promise<Record<string, boolean>> {
  const {byRegion} = await loadDerivedCatalog(storefront);
  const open: Record<string, boolean> = {};
  for (const region of REGIONS) {
    open[region.slug] = (byRegion.get(region.slug)?.length ?? 0) > 0;
  }
  return open;
}

/** Products for a country, for the Canada / United States racks. */
export async function productsForCountry(
  storefront: Storefront,
  country: Region['country'],
): Promise<SouvenirCard[]> {
  const {byRegion} = await loadDerivedCatalog(storefront);
  const out: SouvenirCard[] = [];
  for (const region of REGIONS) {
    if (region.country !== country) continue;
    out.push(...(byRegion.get(region.slug) ?? []));
  }
  return out.sort((a, b) => a.title.localeCompare(b.title));
}

/** Everything in a region that currently has stock — the Now Open rack. */
export async function productsInOpenRegions(
  storefront: Storefront,
  limit = 12,
): Promise<SouvenirCard[]> {
  const {byRegion} = await loadDerivedCatalog(storefront);
  const out: SouvenirCard[] = [];
  for (const bucket of byRegion.values()) {
    if (bucket[0]) out.push(bucket[0]);
    if (out.length >= limit) break;
  }
  return out;
}
