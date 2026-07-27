import type {Storefront} from '@shopify/hydrogen';
import {REGIONS, type Region} from './catalog';
import {regionForProduct} from './town-copy';
export {regionForProduct};

import {
  PRODUCT_CARD_FRAGMENT,
  type SouvenirCard,
} from './shopify-collections';

/**
 * Region merchandising derived from products, not collections.
 *
 * The store's 69 smart collections are not published to the headless sales
 * channel — the Storefront API sees exactly one collection ("frontpage") while
 * every product is visible. Publishing them is a one-off admin action and
 * remains the right fix; this keeps the shop working until it happens.
 *
 * ── Why this is split into an index and a card fetch ────────────────────
 *
 * The first version answered every question by sweeping the whole catalogue as
 * full product cards: up to 8 sequential pages of 250 objects, each carrying
 * images, price ranges, compare-at ranges and variants. That sweep sat on the
 * blocking path of the homepage, /towns, /provinces and /collections — all four
 * primary navigation pages — and of every PDP's "More from" row, which needed
 * four cards and paid for sixteen hundred.
 *
 * Now there are two tiers:
 *
 *  1. **The index** — handle and title only, which is all that region grouping
 *     and open/closed status require. Same page count, a fraction of the bytes,
 *     and memoised per isolate so it is fetched once rather than once per call.
 *  2. **Card hydration** — one batched `products(query: "handle:a OR ...")` for
 *     only the products actually about to be rendered.
 *
 * A region page therefore costs two small round trips instead of eight large
 * ones, and the four navigation pages cost one.
 */

const MAX_PAGES = 8;
const PAGE_SIZE = 250;

/** How long an isolate may reuse its in-memory index. */
const INDEX_TTL_MS = 5 * 60 * 1000;

/** Cap on cards hydrated in one batch — Storefront query strings are finite. */
const MAX_BATCH = 40;

/** Handle and title. Everything the region index needs and nothing else. */
const PRODUCT_INDEX_QUERY = `#graphql
  query SouvenirProductIndex($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: TITLE) {
      nodes {
        handle
        title
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
` as const;

const PRODUCTS_BY_HANDLE_BATCH_QUERY = `#graphql
  query SouvenirCardsByHandle($first: Int!, $query: String!) {
    products(first: $first, query: $query) {
      nodes {
        ...SouvenirCard
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

export interface ProductIndexEntry {
  handle: string;
  title: string;
}

export interface DerivedCatalog {
  /** Every product, as index entries. */
  entries: ProductIndexEntry[];
  /** Region slug → its products, A–Z by title. */
  byRegion: Map<string, ProductIndexEntry[]>;
}

/**
 * Per-isolate memo. Oxygen isolates are short-lived and handle many requests,
 * so this collapses the sweep to once per isolate per TTL — on top of the
 * Storefront cache, which handles it across isolates.
 */
let indexMemo: {at: number; promise: Promise<ProductIndexEntry[]>} | null = null;

async function fetchProductIndex(
  storefront: Storefront,
): Promise<ProductIndexEntry[]> {
  const all: ProductIndexEntry[] = [];
  let after: string | null = null;

  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const data: any = await storefront.query(PRODUCT_INDEX_QUERY, {
        variables: {first: PAGE_SIZE, after},
        cache: storefront.CacheLong(),
      });
      const nodes = (data?.products?.nodes ?? []) as ProductIndexEntry[];
      all.push(...nodes);

      if (!data?.products?.pageInfo?.hasNextPage) break;
      after = data.products.pageInfo.endCursor;
      if (!after) break;

      if (page === MAX_PAGES - 1) {
        console.warn(
          `[msc:catalog] product index hit the ${MAX_PAGES}-page cap at ` +
            `${all.length} products; regions beyond this are not indexed`,
        );
      }
    }
  } catch (error) {
    console.error('[msc:catalog] product index failed', error);
  }

  return all;
}

export function loadProductIndex(
  storefront: Storefront,
): Promise<ProductIndexEntry[]> {
  const now = Date.now();
  if (indexMemo && now - indexMemo.at < INDEX_TTL_MS) {
    return indexMemo.promise;
  }
  const promise = fetchProductIndex(storefront);
  indexMemo = {at: now, promise};
  // A failed sweep should not be cached for five minutes.
  promise
    .then((entries) => {
      if (!entries.length) indexMemo = null;
    })
    .catch(() => {
      indexMemo = null;
    });
  return promise;
}

export function groupByRegion(entries: ProductIndexEntry[]): DerivedCatalog {
  const byRegion = new Map<string, ProductIndexEntry[]>();
  for (const entry of entries) {
    const region = regionForProduct(entry);
    if (!region) continue;
    const bucket = byRegion.get(region.slug);
    if (bucket) bucket.push(entry);
    else byRegion.set(region.slug, [entry]);
  }
  for (const bucket of byRegion.values()) {
    bucket.sort((a, b) => a.title.localeCompare(b.title));
  }
  return {entries, byRegion};
}

export async function loadDerivedCatalog(
  storefront: Storefront,
): Promise<DerivedCatalog> {
  return groupByRegion(await loadProductIndex(storefront));
}

/**
 * Turn index entries into renderable cards with one batched request.
 * Order is preserved so the caller's sort survives the round trip.
 */
export async function hydrateCards(
  storefront: Storefront,
  entries: ProductIndexEntry[],
): Promise<SouvenirCard[]> {
  const wanted = entries.slice(0, MAX_BATCH);
  if (!wanted.length) return [];

  try {
    const data = await storefront.query(PRODUCTS_BY_HANDLE_BATCH_QUERY, {
      variables: {
        first: wanted.length,
        query: wanted.map((entry) => `handle:${entry.handle}`).join(' OR '),
      },
      cache: storefront.CacheShort(),
    });
    const nodes = (data?.products?.nodes ?? []) as SouvenirCard[];
    const byHandle = new Map(nodes.map((node) => [node.handle, node]));
    return wanted
      .map((entry) => byHandle.get(entry.handle))
      .filter((node): node is SouvenirCard => Boolean(node));
  } catch (error) {
    console.error('[msc:catalog] card hydration failed', error);
    return [];
  }
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

/** Products for one region, without needing its collection published. */
export async function productsForRegion(
  storefront: Storefront,
  region: Region,
  limit = MAX_BATCH,
): Promise<SouvenirCard[]> {
  const {byRegion} = await loadDerivedCatalog(storefront);
  const entries = (byRegion.get(region.slug) ?? []).slice(0, limit);
  return hydrateCards(storefront, entries);
}

/** Region slug → has products. Index-only: no card payload at all. */
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
  limit = MAX_BATCH,
): Promise<SouvenirCard[]> {
  const {byRegion} = await loadDerivedCatalog(storefront);
  const entries: ProductIndexEntry[] = [];
  for (const region of REGIONS) {
    if (region.country !== country) continue;
    entries.push(...(byRegion.get(region.slug) ?? []));
  }
  entries.sort((a, b) => a.title.localeCompare(b.title));
  return hydrateCards(storefront, entries.slice(0, limit));
}

/** One product from each stocked region — the Now Open rack. */
export async function productsInOpenRegions(
  storefront: Storefront,
  limit = 12,
): Promise<SouvenirCard[]> {
  const {byRegion} = await loadDerivedCatalog(storefront);
  const entries: ProductIndexEntry[] = [];
  for (const bucket of byRegion.values()) {
    if (bucket[0]) entries.push(bucket[0]);
    if (entries.length >= limit) break;
  }
  return hydrateCards(storefront, entries);
}

/** Everything, hydrated, for the All Souvenirs fallback rack. */
export async function allDerivedProducts(
  storefront: Storefront,
  limit = MAX_BATCH,
): Promise<SouvenirCard[]> {
  const {entries} = await loadDerivedCatalog(storefront);
  return hydrateCards(storefront, entries.slice(0, limit));
}
