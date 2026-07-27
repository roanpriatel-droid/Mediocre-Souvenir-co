import type {Route} from './+types/api.storefront-status';
import {REGIONS} from '~/lib/catalog';
import {UTILITY_COLLECTIONS} from '~/lib/shopify-collections';

/**
 * Storefront diagnostic — what the Storefront API actually returns.
 *
 * The site is built to degrade rather than break: a collection that comes back
 * empty falls through to the local town catalog. That is right for shoppers
 * and wrong for debugging, because a store that is misconfigured looks exactly
 * like a store that is fine. This route removes the guesswork by asking the
 * API directly and reporting the raw answer.
 *
 * Deliberately does NOT use the helpers in shopify-collections.ts — if the bug
 * were in those helpers, reusing them would hide it.
 *
 * Exposes no secrets: the store domain is already in every page's HTML and
 * collection handles are public. No API token is read or returned.
 */

const DIAGNOSTIC_QUERY = `#graphql
  query StorefrontDiagnostic($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      name
      primaryDomain {
        url
      }
    }
    collections(first: 250) {
      nodes {
        handle
        title
        products(first: 3) {
          nodes {
            handle
            title
            featuredImage {
              url
            }
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
      }
    }
    products(first: 5) {
      nodes {
        handle
        title
        featuredImage {
          url
        }
      }
    }
  }
` as const;

/**
 * Same shape, no `@inContext`. Comparing the two answers is how we tell a
 * market-catalog problem (products exist, this market cannot see them) from a
 * sales-channel problem (nothing is published at all).
 */
const NEUTRAL_QUERY = `#graphql
  query StorefrontDiagnosticNeutral {
    collections(first: 250) {
      nodes {
        handle
        products(first: 1) {
          nodes {
            handle
          }
        }
      }
    }
    products(first: 5) {
      nodes {
        handle
      }
    }
  }
` as const;

export async function loader({context}: Route.LoaderArgs) {
  const storeDomain = context.env.PUBLIC_STORE_DOMAIN ?? '(not set)';
  const expected = [
    ...Object.values(UTILITY_COLLECTIONS),
    ...REGIONS.map((region) => region.slug),
  ];

  const report: Record<string, unknown> = {
    checkedAt: new Date().toISOString(),
    storeDomain,
    isMockShop: storeDomain.includes('mock.shop'),
    storefrontApiTokenPresent: Boolean(
      context.env.PUBLIC_STOREFRONT_API_TOKEN,
    ),
    expectedCollections: expected.length,
  };

  try {
    const data = await context.storefront.query(DIAGNOSTIC_QUERY, {
      cache: context.storefront.CacheNone(),
    });

    const nodes: any[] = data?.collections?.nodes ?? [];
    const visible = new Map(nodes.map((n) => [n.handle, n]));

    const withProducts = nodes.filter(
      (n) => (n.products?.nodes?.length ?? 0) > 0,
    );

    // Do the products that exist actually carry images? This is the
    // difference between "no products" and "products with no photography",
    // which look identical on the site because the mockups fill the gap.
    const sampleProducts = nodes
      .flatMap((n) => n.products?.nodes ?? [])
      .slice(0, 10)
      .map((p: any) => ({
        handle: p.handle,
        title: p.title,
        hasImage: Boolean(p.featuredImage?.url),
        imageUrl: p.featuredImage?.url ?? null,
        price: p.variants?.nodes?.[0]?.price ?? null,
        variantId: p.variants?.nodes?.[0]?.id ?? null,
      }));

    report.shopName = data?.shop?.name ?? null;
    report.primaryDomain = data?.shop?.primaryDomain?.url ?? null;
    report.collectionsVisibleToStorefrontApi = nodes.length;
    report.collectionsWithAtLeastOneProduct = withProducts.length;
    report.productsVisibleToStorefrontApi = (data?.products?.nodes ?? []).length;
    report.anyProductsAtAll = (data?.products?.nodes ?? []).map((p: any) => ({
      handle: p.handle,
      hasImage: Boolean(p.featuredImage?.url),
    }));

    report.expectedButMissing = expected.filter((h) => !visible.has(h));
    report.expectedAndPresent = expected.filter((h) => visible.has(h));
    report.presentButUnexpected = nodes
      .map((n) => n.handle)
      .filter((h) => !expected.includes(h));

    report.keyCollections = [
      UTILITY_COLLECTIONS.allSouvenirs,
      UTILITY_COLLECTIONS.nowOpen,
      UTILITY_COLLECTIONS.newArrivals,
      UTILITY_COLLECTIONS.canada,
      UTILITY_COLLECTIONS.unitedStates,
      'british-columbia',
    ].map((handle) => {
      const node = visible.get(handle);
      return {
        handle,
        visible: Boolean(node),
        title: node?.title ?? null,
        productsReturned: node?.products?.nodes?.length ?? 0,
        firstProduct: node?.products?.nodes?.[0]
          ? {
              handle: node.products.nodes[0].handle,
              hasImage: Boolean(node.products.nodes[0].featuredImage?.url),
            }
          : null,
      };
    });

    report.sampleProducts = sampleProducts;
    report.productsWithoutImages = sampleProducts.filter((p) => !p.hasImage)
      .length;

    // Cross-check against the shop's default catalog.
    try {
      const neutral = await context.storefront.query(NEUTRAL_QUERY, {
        cache: context.storefront.CacheNone(),
      });
      const neutralNodes: any[] = neutral?.collections?.nodes ?? [];
      report.neutralContext = {
        buyerCountryInUse: context.storefront.i18n?.country ?? null,
        collectionsVisible: neutralNodes.length,
        collectionsWithProducts: neutralNodes.filter(
          (n) => (n.products?.nodes?.length ?? 0) > 0,
        ).length,
        productsVisible: (neutral?.products?.nodes ?? []).length,
      };
    } catch (error) {
      report.neutralContext = {
        failed: true,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // ── Derived-catalogue diagnostics ──────────────────────────────────
    // The site runs off a product index because the collections are not
    // published. When a region page renders empty while /towns says that
    // region is open, the disagreement is in here.
    try {
      const {loadProductIndex, groupByRegion, hydrateCards} = await import(
        '~/lib/shopify-catalog'
      );
      const entries = await loadProductIndex(context.storefront);
      const {byRegion} = groupByRegion(entries);

      const counts: Record<string, number> = {};
      for (const [slug, bucket] of byRegion) counts[slug] = bucket.length;

      // Round-trip a real region through hydrateCards to see whether the
      // batched handle lookup returns what the index promised.
      const probeSlug = byRegion.has('british-columbia')
        ? 'british-columbia'
        : [...byRegion.keys()][0];
      const probeEntries = (byRegion.get(probeSlug) ?? []).slice(0, 25);
      const hydrated = await hydrateCards(context.storefront, probeEntries);

      report.derivedCatalog = {
        indexSize: entries.length,
        regionsWithProducts: Object.keys(counts).length,
        firstTitles: entries.slice(0, 3).map((e) => e.title),
        lastTitles: entries.slice(-3).map((e) => e.title),
        counts,
        probe: {
          region: probeSlug,
          indexSaysEntries: probeEntries.length,
          hydrateCardsReturned: hydrated.length,
          requestedHandles: probeEntries.slice(0, 5).map((e) => e.handle),
          returnedHandles: hydrated.slice(0, 5).map((p) => p.handle),
        },
      };
    } catch (error) {
      report.derivedCatalog = {
        failed: true,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    report.verdict = buildVerdict(report);
  } catch (error) {
    report.queryFailed = true;
    report.error = error instanceof Error ? error.message : String(error);
    report.verdict =
      'The Storefront API call threw. Most often that is a missing or invalid ' +
      'PUBLIC_STOREFRONT_API_TOKEN, or the storefront is not linked to this ' +
      'Oxygen deployment. See `error` above.';
  }

  return new Response(JSON.stringify(report, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

/** Turns the numbers into the one sentence that explains the symptom. */
function buildVerdict(report: Record<string, unknown>): string {
  if (report.isMockShop) {
    return (
      'This deployment is talking to mock.shop, not your store. None of the 69 ' +
      'collections exist there, so every collection resolves empty and the site ' +
      'falls back to the local town catalog — which is exactly the BC placeholder ' +
      'artwork you are seeing. Fix: link the storefront so Oxygen injects ' +
      'PUBLIC_STORE_DOMAIN and PUBLIC_STOREFRONT_API_TOKEN.'
    );
  }

  // A market mismatch is the highest-signal finding: the catalog is there,
  // the buyer's market just cannot see it.
  const neutral = report.neutralContext as
    | {collectionsWithProducts?: number; buyerCountryInUse?: string}
    | undefined;
  const contextualWithProducts =
    (report.collectionsWithAtLeastOneProduct as number) ?? 0;
  if (
    neutral?.collectionsWithProducts &&
    neutral.collectionsWithProducts > contextualWithProducts
  ) {
    return (
      `MARKET MISMATCH. Under the buyer market (${neutral.buyerCountryInUse}) ` +
      `only ${contextualWithProducts} collections have products, but the shop's ` +
      `default catalog has ${neutral.collectionsWithProducts}. The products are ` +
      'not published to that market, so every @inContext query returns empty ' +
      'and the site reads it as "not open yet". Fix: in Shopify admin → ' +
      'Settings → Markets, publish the catalog to that market — or the site now ' +
      'falls back to the default catalog automatically.'
    );
  }

  const visible = report.collectionsVisibleToStorefrontApi as number;
  const missing = (report.expectedButMissing as string[]) ?? [];
  const withProducts = report.collectionsWithAtLeastOneProduct as number;
  const noImages = (report.productsWithoutImages as number) ?? 0;
  const sampleCount = ((report.sampleProducts as unknown[]) ?? []).length;

  if (visible === 0) {
    return (
      'The API answered but returned zero collections. The collections exist in ' +
      'admin but are not published to this sales channel. Fix: Shopify admin → ' +
      'each collection → Publishing → add the Hydrogen/Headless channel. Same ' +
      'for the products.'
    );
  }

  if (missing.length === (report.expectedCollections as number)) {
    return (
      `${visible} collections are visible, but none of them are the handles this ` +
      'site expects. The handles differ from the region slugs. See ' +
      '`presentButUnexpected` for what the store actually calls them.'
    );
  }

  if (withProducts === 0) {
    return (
      `${visible} collections are visible but not one contains a product. The ` +
      'collections are published to the sales channel and the products are not. ' +
      'Fix: publish the products to the Hydrogen/Headless channel — smart ' +
      'collection rules only match products the channel can see.'
    );
  }

  if (sampleCount > 0 && noImages === sampleCount) {
    return (
      'Products ARE being returned — the store is wired correctly — but none of ' +
      'them have a featured image. The site draws its generative town artwork ' +
      'wherever a product has no photograph, which is why real Shopify products ' +
      'look like BC placeholders. Fix: add product images in Shopify (or sync ' +
      'them from Printify). Prices and stock on those cards are already live.'
    );
  }

  if (missing.length > 0) {
    return (
      `Store is wired and returning products. ${missing.length} expected ` +
      `collection handles are not visible to the Storefront API: ${missing
        .slice(0, 8)
        .join(', ')}${missing.length > 8 ? '…' : ''}. Those regions will show ` +
      'the waitlist. Publish them to the Hydrogen channel to open them.'
    );
  }

  return (
    'Everything the site expects is visible and populated. If the pages still ' +
    'look wrong, the cause is in rendering rather than data — send the URL you ' +
    'are looking at.'
  );
}
