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

/*
 * The live catalogue is larger than 2,000 products — the old 8-page cap was
 * being hit exactly, silently cutting the index off at "Watertown, NY" and
 * making every alphabetically later town invisible to region grouping. Pages
 * are cheap now that the index carries only handle and title (~15 KB each),
 * and the whole sweep is memoised per isolate.
 */
const MAX_PAGES = 24;
const PAGE_SIZE = 250;

/** How long an isolate may reuse its in-memory index. */
const INDEX_TTL_MS = 5 * 60 * 1000;

/** Cap on cards hydrated in one request. nodes(ids:) accepts up to 250. */
const MAX_BATCH = 50;

/** Products per page on a derived rack. */
export const DERIVED_PER_PAGE = 24;

/** The four print styles, read off the handle suffix. */
export const PRINT_STYLES = [
  {value: 'varsity', label: 'Varsity'},
  {value: 'greetings', label: 'Greetings'},
  {value: 'i-heart', label: 'I Heart'},
  {value: 'tour', label: 'Tour'},
] as const;

export function styleOfHandle(handle: string): string | undefined {
  return PRINT_STYLES.find((s) => handle.endsWith(s.value))?.value;
}

export interface DerivedRack {
  products: SouvenirCard[];
  /** Total matching the current filter, before paging. */
  total: number;
  page: number;
  pages: number;
  /** How many exist per style, for the filter chips. */
  styleCounts: Record<string, number>;
}

/**
 * A paged, filterable rack built from the product index.
 *
 * Before this existed, the derived path returned a flat slice capped at 50 and
 * rendered no pagination — so British Columbia showed 50 of its 106 products
 * and All Souvenirs showed 40 of 2,150. Over two thousand products were
 * unreachable and therefore unbuyable.
 */
export async function derivedRack(
  storefront: Storefront,
  opts: {
    region?: Region;
    country?: Region['country'];
    style?: string;
    page?: number;
    perPage?: number;
  },
): Promise<DerivedRack> {
  const {byRegion, entries: all} = await loadDerivedCatalog(storefront);

  let entries: ProductIndexEntry[];
  if (opts.region) {
    entries = byRegion.get(opts.region.slug) ?? [];
  } else if (opts.country) {
    entries = [];
    for (const region of REGIONS) {
      if (region.country !== opts.country) continue;
      entries.push(...(byRegion.get(region.slug) ?? []));
    }
    entries.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    entries = all;
  }

  const styleCounts: Record<string, number> = {};
  for (const entry of entries) {
    const style = styleOfHandle(entry.handle);
    if (style) styleCounts[style] = (styleCounts[style] ?? 0) + 1;
  }

  const filtered = opts.style
    ? entries.filter((entry) => styleOfHandle(entry.handle) === opts.style)
    : entries;

  const perPage = Math.min(opts.perPage ?? DERIVED_PER_PAGE, MAX_BATCH);
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const page = Math.min(Math.max(1, opts.page ?? 1), pages);
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  return {
    products: await hydrateCards(storefront, slice),
    total: filtered.length,
    page,
    pages,
    styleCounts,
  };
}

/** Handle and title. Everything the region index needs and nothing else. */
const PRODUCT_INDEX_QUERY = `#graphql
  query SouvenirProductIndex($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: TITLE) {
      nodes {
        id
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

/*
 * Hydration is by id, not by handle search.
 *
 * `products(query: "handle:...")` cannot be trusted here. Shopify's search
 * tokenises on hyphens and treats a leading "-" as negation, so a handle like
 * `100-mile-house-bc-greetings` is not matched as a literal — and quoting it
 * did not help either: British Columbia still returned 0 of 25, while Ohio
 * returned an arbitrary 16 of 25. A search index is the wrong tool for "give
 * me exactly these products".
 *
 * `nodes(ids:)` is an exact lookup. No parsing, no partial matches, and it
 * takes up to 250 ids per call.
 */
const PRODUCTS_BY_IDS_QUERY = `#graphql
  query SouvenirCardsByIds($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
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
  /** Storefront GID. Hydration is by id, never by handle search. */
  id: string;
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
    const data = await storefront.query(PRODUCTS_BY_IDS_QUERY, {
      variables: {ids: wanted.map((entry) => entry.id)},
      cache: storefront.CacheShort(),
    });
    const nodes = ((data?.nodes ?? []) as (SouvenirCard | null)[]).filter(
      (node): node is SouvenirCard => Boolean(node?.handle),
    );
    if (nodes.length < wanted.length) {
      console.warn(
        `[msc:catalog] hydrateCards asked for ${wanted.length} ids and got ` +
          `${nodes.length}; first was "${wanted[0].handle}"`,
      );
    }
    const byId = new Map(nodes.map((node) => [node.id, node]));
    return wanted
      .map((entry) => byId.get(entry.id))
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

/**
 * The Now Open rack — one product from each stocked region, merchandised.
 *
 * This used to take `bucket[0]` from each region in map order, which meant the
 * showcase row on the homepage was literally the alphabetically-first product
 * of the alphabetically-first regions: 100 Mile House, Aberdeen MD, Aberdeen
 * SD, Aberdeen WA, Abilene TX. It read like a database dump.
 *
 * Now: regions are ordered by how much stock they carry (a well-stocked region
 * is a better shop window), and the product within each is chosen by a seed
 * that changes daily. Deterministic per day, so the server and client agree and
 * the page can still be cached — but the row is different tomorrow.
 */
export async function productsInOpenRegions(
  storefront: Storefront,
  limit = 12,
  seed = daySeed(),
): Promise<SouvenirCard[]> {
  const {byRegion} = await loadDerivedCatalog(storefront);

  const buckets = [...byRegion.entries()]
    .filter(([, items]) => items.length > 0)
    .sort((a, b) => b[1].length - a[1].length);

  const entries: ProductIndexEntry[] = [];
  for (const [slug, items] of buckets) {
    if (entries.length >= limit) break;
    // Rotate within the region so the same town is not always the face of it.
    const pick = items[(seed + hashString(slug)) % items.length];
    if (pick) entries.push(pick);
  }
  return hydrateCards(storefront, entries);
}

/** Days since epoch — stable across a day, different the next. */
function daySeed(): number {
  return Math.floor(Date.now() / 86_400_000);
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Products for the visitor's own region, for the geo-personalised hero.
 *
 * One per TOWN, not one per product. Every town ships in four styles
 * (Greetings / I Heart / Tour / Varsity), so slicing four consecutive entries
 * returned four variants of the same place — the hero showed "Trail, BC"
 * three times, which reads as a broken grid rather than a region.
 */
/**
 * A spread of products for the hero's print wall.
 *
 * Deliberately drawn ACROSS regions rather than within one: the wall exists to
 * say "there is a shirt for everywhere", so eighteen prints from eighteen
 * different places is the whole point. One per town, so a place never repeats.
 */
export async function heroWall(
  storefront: Storefront,
  count = 18,
): Promise<SouvenirCard[]> {
  const {byRegion} = await loadDerivedCatalog(storefront);
  const buckets = [...byRegion.values()].filter((b) => b.length > 0);
  if (!buckets.length) return [];

  const seed = daySeed();
  const picked: ProductIndexEntry[] = [];
  const seenTowns = new Set<string>();

  // The four print styles look very different — Varsity is a bold town name,
  // Greetings is a light script header. Filling the wall from one style makes
  // it read as a repeating template, so cycle styles as well as regions.
  const STYLES = ['varsity', 'tour', 'i-heart', 'greetings'];
  const styleOf = (handle: string) =>
    STYLES.find((style) => handle.endsWith(style)) ?? 'other';

  for (let pass = 0; picked.length < count && pass < 8; pass++) {
    const wantStyle = STYLES[pass % STYLES.length];
    for (const bucket of buckets) {
      if (picked.length >= count) break;
      // Prefer this pass's style within the region; fall back to anything.
      const offset = (seed + pass * 7) % bucket.length;
      const rotated = [...bucket.slice(offset), ...bucket.slice(0, offset)];
      const item =
        rotated.find(
          (candidate) =>
            styleOf(candidate.handle) === wantStyle &&
            !seenTowns.has(candidate.title.split(/[—–]/)[0].trim().toLowerCase()),
        ) ?? undefined;
      if (!item) continue;
      seenTowns.add(item.title.split(/[—–]/)[0].trim().toLowerCase());
      picked.push(item);
    }
  }

  // Top up if style-cycling could not fill the wall.
  if (picked.length < count) {
    for (const bucket of buckets) {
      if (picked.length >= count) break;
      for (const item of bucket) {
        const town = item.title.split(/[—–]/)[0].trim().toLowerCase();
        if (seenTowns.has(town)) continue;
        seenTowns.add(town);
        picked.push(item);
        break;
      }
    }
  }

  return hydrateCards(storefront, picked);
}

/**
 * Regions for the hero's rotating band.
 *
 * The personalised headline shows the visitor their own region, which is the
 * strongest hook the store has but tells them nothing about the other 62. This
 * supplies the breadth signal: well-stocked regions, deliberately mixed across
 * both countries so the band reads as continental rather than as one province,
 * and excluding whichever region is already the headline.
 *
 * Ordered by stock, because a region with 100 shirts is a better advertisement
 * than one with 6, then rotated by a daily seed so the set is not identical
 * every day.
 */
export async function heroRotation(
  storefront: Storefront,
  exclude?: Region,
  count = 15,
): Promise<{slug: string; name: string; total: number}[]> {
  const {byRegion} = await loadDerivedCatalog(storefront);

  const stocked = REGIONS.filter(
    (region) =>
      region.slug !== exclude?.slug &&
      (byRegion.get(region.slug)?.length ?? 0) > 0,
  ).map((region) => ({
    slug: region.slug,
    name: region.name,
    country: region.country,
    total: byRegion.get(region.slug)!.length,
  }));

  const byStock = (a: {total: number}, b: {total: number}) => b.total - a.total;
  const canada = stocked.filter((r) => r.country === 'Canada').sort(byStock);
  const usa = stocked.filter((r) => r.country === 'United States').sort(byStock);

  const seed = daySeed();
  const take = (list: typeof canada, n: number) =>
    list.length <= n
      ? [...list]
      : Array.from({length: n}, (_, i) => list[(seed + i * 3) % list.length]);

  // Roughly a third Canadian, so the band never reads as one country.
  const wantCa = Math.min(canada.length, Math.round(count / 3));
  const caPick = take(canada, wantCa);
  const usPick = take(usa, count - wantCa);

  // Alternate the two so they interleave rather than blocking together.
  const out: {slug: string; name: string; total: number}[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < Math.max(caPick.length, usPick.length); i++) {
    for (const item of [usPick[i], caPick[i]]) {
      if (!item || seen.has(item.slug) || out.length >= count) continue;
      seen.add(item.slug);
      out.push({slug: item.slug, name: item.name, total: item.total});
    }
  }
  return out;
}

export async function regionSpotlight(
  storefront: Storefront,
  region: Region,
  limit = 4,
): Promise<{products: SouvenirCard[]; total: number}> {
  const {byRegion} = await loadDerivedCatalog(storefront);
  const items = byRegion.get(region.slug) ?? [];
  if (!items.length) return {products: [], total: 0};

  // Collapse to one entry per town, keeping index order.
  const byTown = new Map<string, ProductIndexEntry>();
  for (const item of items) {
    const town = item.title.split(/[—–]/)[0].trim().toLowerCase();
    if (!byTown.has(town)) byTown.set(town, item);
  }
  const towns = [...byTown.values()];

  const seed = daySeed() + hashString(region.slug);
  const start = towns.length > limit ? seed % (towns.length - limit + 1) : 0;
  const picked = towns.slice(start, start + limit);

  // The hero is a "Greetings from…" postcard, so lead with the Greetings
  // shirt for that town when the store has one — the graphic and the product
  // are then the same object. Falls back to whatever came first.
  const leadTown = picked[0]?.title.split(/[—–]/)[0].trim().toLowerCase();
  const greetings = leadTown
    ? items.find(
        (item) =>
          /greetings/i.test(item.handle) &&
          item.title.split(/[—–]/)[0].trim().toLowerCase() === leadTown,
      )
    : undefined;
  if (greetings && !picked.some((p) => p.id === greetings.id)) {
    picked[0] = greetings;
  }

  return {
    products: await hydrateCards(storefront, picked),
    total: items.length,
  };
}

/** Everything, hydrated, for the All Souvenirs fallback rack. */
export async function allDerivedProducts(
  storefront: Storefront,
  limit = MAX_BATCH,
): Promise<SouvenirCard[]> {
  const {entries} = await loadDerivedCatalog(storefront);
  return hydrateCards(storefront, entries.slice(0, limit));
}
