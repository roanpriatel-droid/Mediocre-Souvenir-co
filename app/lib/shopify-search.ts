import type {Storefront} from '@shopify/hydrogen';
import type {SouvenirCard} from './shopify-collections';

/**
 * Product search against the store.
 *
 * Search used to run over the local 40-town catalog, which meant the search
 * box could not find 1,560 of the 1,600 things actually for sale. Everything
 * transactional now goes through the Storefront API; the only local knowledge
 * left in search is the site's own navigation (regions, guides, policies),
 * which genuinely does live in this repo.
 */

const SEARCH_CARD_FRAGMENT = `#graphql
  fragment SearchMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment SearchCard on Product {
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
    # The first five photos. The fifth is the white shirt on a model, which
    # the card shows on hover (and which alt text marks as "worn").
    gallery: images(first: 5) {
      nodes {
        url
        altText
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        ...SearchMoney
      }
      maxVariantPrice {
        ...SearchMoney
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...SearchMoney
      }
    }
    variants(first: 2) {
      nodes {
        id
        availableForSale
      }
    }
  }
` as const;

export const PRODUCT_SEARCH_QUERY = `#graphql
  query SouvenirSearch($query: String!, $first: Int!) {
    search(query: $query, first: $first, types: PRODUCT) {
      totalCount
      nodes {
        ...on Product {
          ...SearchCard
        }
      }
    }
  }
  ${SEARCH_CARD_FRAGMENT}
` as const;

/** Market-neutral fallback — same reason as the collection loader. */
export const PRODUCT_SEARCH_QUERY_NEUTRAL = `#graphql
  query SouvenirSearchNeutral($query: String!, $first: Int!) {
    search(query: $query, first: $first, types: PRODUCT) {
      totalCount
      nodes {
        ...on Product {
          ...SearchCard
        }
      }
    }
  }
  ${SEARCH_CARD_FRAGMENT}
` as const;

/** Look products up by handle — used by editorial that references specific towns. */
export const PRODUCT_BY_HANDLE_QUERY = `#graphql
  query SouvenirProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...SearchCard
    }
  }
  ${SEARCH_CARD_FRAGMENT}
` as const;

export const PREDICTIVE_SEARCH_QUERY = `#graphql
  query SouvenirPredictive($query: String!, $limit: Int!) {
    predictiveSearch(query: $query, limit: $limit, types: [PRODUCT]) {
      products {
        id
        handle
        title
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
` as const;

export interface SearchResult {
  products: SouvenirCard[];
  totalCount: number;
}

/** Full search. Never throws — an empty result is a designed page. */
export async function searchProducts(
  storefront: Storefront,
  query: string,
  first = 24,
): Promise<SearchResult> {
  const term = query.trim();
  if (!term) return {products: [], totalCount: 0};

  try {
    const data = await storefront.query(PRODUCT_SEARCH_QUERY, {
      variables: {query: term, first},
      cache: storefront.CacheShort(),
    });
    let nodes = (data?.search?.nodes ?? []) as SouvenirCard[];
    let totalCount = data?.search?.totalCount ?? nodes.length;

    if (!nodes.length) {
      const neutral = await storefront.query(PRODUCT_SEARCH_QUERY_NEUTRAL, {
        variables: {query: term, first},
        cache: storefront.CacheShort(),
      });
      const neutralNodes = (neutral?.search?.nodes ?? []) as SouvenirCard[];
      if (neutralNodes.length) {
        console.warn(
          `[msc:search] "${term}" found ${neutralNodes.length} results only ` +
            `outside the buyer market`,
        );
        nodes = neutralNodes;
        totalCount = neutral?.search?.totalCount ?? neutralNodes.length;
      }
    }

    return {products: nodes.filter(Boolean), totalCount};
  } catch (error) {
    console.error(`[msc:search] "${term}" failed`, error);
    return {products: [], totalCount: 0};
  }
}

/**
 * Resolve a list of product handles to real products, dropping any the store
 * does not have. Editorial can then reference a town without promising a
 * product page that may not exist.
 */
export async function productsByHandle(
  storefront: Storefront,
  handles: string[],
): Promise<SouvenirCard[]> {
  const wanted = handles.filter(Boolean);
  if (!wanted.length) return [];

  // One exact lookup per handle. The Storefront API's product search does
  // not support a handle: filter; it quietly ignores it and returns the
  // first products in the catalogue, which this function then discarded,
  // so every caller got nothing back.
  const results = await Promise.all(
    wanted.map((handle) =>
      storefront
        .query(PRODUCT_BY_HANDLE_QUERY, {
          variables: {handle},
          cache: storefront.CacheLong(),
        })
        .then((data) => (data?.product ?? null) as SouvenirCard | null)
        .catch((error: unknown) => {
          console.error(`[msc:search] handle lookup failed: ${handle}`, error);
          return null;
        }),
    ),
  );
  return results.filter((node): node is SouvenirCard => Boolean(node));
}

export interface Suggestion {
  handle: string;
  title: string;
  price: string | null;
  imageUrl: string | null;
}

/** Typeahead for the hero search box. */
export async function suggestProducts(
  storefront: Storefront,
  query: string,
  limit = 6,
): Promise<Suggestion[]> {
  const term = query.trim();
  if (term.length < 2) return [];

  try {
    const data = await storefront.query(PREDICTIVE_SEARCH_QUERY, {
      variables: {query: term, limit},
      cache: storefront.CacheShort(),
    });
    return (data?.predictiveSearch?.products ?? []).map((product: any) => ({
      handle: product.handle,
      title: product.title,
      price: product.priceRange?.minVariantPrice
        ? `${Number(product.priceRange.minVariantPrice.amount)}`
        : null,
      imageUrl: product.featuredImage?.url ?? null,
    }));
  } catch (error) {
    console.error(`[msc:suggest] "${term}" failed`, error);
    return [];
  }
}
