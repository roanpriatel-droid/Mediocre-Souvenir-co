import {useMemo} from 'react';
import {Link, redirect, useLoaderData, useSearchParams} from 'react-router';
import {getPaginationVariables, useNonce} from '@shopify/hydrogen';
import type {Route} from './+types/collections.$handle';
import {SouvenirProductCard} from '~/components/SouvenirCard';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {RegionWaitlist} from '~/components/RegionWaitlist';
import {CountryTownFinder} from '~/components/CountryTownFinder';
import {Reveal} from '~/components/Reveal';
import {DISPLAY_PRICE, type Region} from '~/lib/catalog';
import {
  COLLECTION_REDIRECTS,
  countryCollectionHandle,
  UTILITY_COLLECTIONS,
  isRegionOpen,
  loadCollectionPage,
  loadRegionStatus,
  regionForCollectionHandle,
  type SouvenirCard,
} from '~/lib/shopify-collections';
import {
  derivedRack,
  loadNewestProducts,
  PRINT_STYLES,
  productsInOpenRegions,
} from '~/lib/shopify-catalog';
import {
  regionDescription,
  regionMetaDescription,
  regionMetaTitle,
} from '~/lib/region-copy';
import {SITE_NAME} from '~/lib/seo';

/**
 * Every collection page in the store.
 *
 * Resolution order, and the reason for it:
 *   1. **Shopify collection.** The 69 smart collections are the merchandising
 *      spine — regions, countries, All Souvenirs, New Arrivals, Now Open.
 *   2. **Local curated rack.** The template/colorway/town-size racks are
 *      derived from the town catalog and have no Shopify equivalent.
 *   3. **Region with no collection yet.** Still renders — as the waitlist.
 *
 * The rule that governs the whole file: a region handle *always* produces a
 * page. Empty collection, missing collection, Storefront outage — all three
 * land on the waitlist state, which is a designed surface, not a failure.
 */

const SORTS = {
  featured: 'Featured',
  'a-z': 'A to Z',
  'z-a': 'Z to A',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
} as const;

type SortKey = keyof typeof SORTS;

/** Our sort labels mapped onto ProductCollectionSortKeys. */
const SORT_VARIABLES: Record<
  SortKey,
  {sortKey: string; reverse: boolean}
> = {
  featured: {sortKey: 'COLLECTION_DEFAULT', reverse: false},
  'a-z': {sortKey: 'TITLE', reverse: false},
  'z-a': {sortKey: 'TITLE', reverse: true},
  'price-asc': {sortKey: 'PRICE', reverse: false},
  'price-desc': {sortKey: 'PRICE', reverse: true},
};

export const meta: Route.MetaFunction = ({data}) => {
  if (!data) return [{title: `Collections | ${SITE_NAME}`}];
  const {title, description, canonical} = data.seo;
  return [
    {title},
    {name: 'description', content: description},
    {tagName: 'link', rel: 'canonical', href: canonical},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
  ];
};

export async function loader({params, context, request}: Route.LoaderArgs) {
  const handle = params.handle ?? '';
  const origin = new URL(request.url).origin;

  const redirectTo = COLLECTION_REDIRECTS[handle];
  if (redirectTo) throw redirect(redirectTo, 301);

  const region = regionForCollectionHandle(handle);

  // Sort and availability are resolved by the API. With 1,600 products a
  // client-side sort would only reorder the page you happen to be on.
  const url = new URL(request.url);
  const sort = (url.searchParams.get('sort') ?? 'featured') as SortKey;
  const availability = url.searchParams.get('availability') ?? '';
  const style = url.searchParams.get('style') ?? '';
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1) || 1);
  const paginationVariables = getPaginationVariables(request, {pageBy: 24});

  const shopifyCollection = await loadCollectionPage(context.storefront, handle, {
    ...paginationVariables,
    ...SORT_VARIABLES[sort],
    filters: availability === 'in-stock' ? [{available: true}] : undefined,
  });
  const products: SouvenirCard[] = shopifyCollection?.products.nodes ?? [];
  const connection = shopifyCollection?.products ?? null;

  // ── Region collection ────────────────────────────────────────────────
  if (region) {
    // The region's smart collection is the fast path. When it is not published
    // to the headless channel we derive the rack from the products themselves
    // rather than telling a stocked region it does not exist.
    let regionProducts = products;
    let derived: Awaited<ReturnType<typeof derivedRack>> | null = null;
    if (!regionProducts.length) {
      derived = await derivedRack(context.storefront, {region, style, page});
      regionProducts = derived.products;
    }

    const open =
      regionProducts.length > 0
        ? true
        : isRegionOpen(region, await loadRegionStatus(context.storefront));

    const description = regionDescription(region, open);
    const title = `${regionMetaTitle(region, open)} | ${SITE_NAME}`;

    return {
      kind: 'region' as const,
      connection: products.length ? connection : null,
      derived,
      handle,
      country: null,
      countryOpen: {} as Record<string, boolean>,
      countryLive: false,
      region,
      open,
      heading: shopifyCollection?.title || `${region.name}`,
      description,
      products: regionProducts,
      origin,
      seo: {
        title,
        description: regionMetaDescription(region, open, regionProducts.length),
        canonical: `${origin}/collections/${handle}`,
      },
    };
  }

  // Country racks carry a town finder, which needs to know which regions in
  // that country are open.
  const country: 'Canada' | 'United States' | null =
    handle === UTILITY_COLLECTIONS.canada
      ? 'Canada'
      : handle === UTILITY_COLLECTIONS.unitedStates
        ? 'United States'
        : null;
  const countryStatus = country
    ? await loadRegionStatus(context.storefront)
    : {open: {} as Record<string, boolean>, live: false};

  /*
   * ── Shopify non-region collection (All Souvenirs, Now Open, …) ────────
   *
   * A published-but-empty collection must not short-circuit the derived rack.
   * Publishing all seventy collections to the headless channel made
   * `new-arrivals` visible for the first time — and it holds no products, so
   * this branch started returning an empty page for a handle that is in the
   * nav on every page. Before it was published the lookup returned null and
   * the fallback below filled it. Visibility should not be able to empty a
   * shelf that was previously stocked.
   */
  const emptyUtility =
    shopifyCollection && !products.length && KNOWN_HANDLES.has(handle);

  if (shopifyCollection && !emptyUtility) {
    return {
      kind: 'shopify' as const,
      connection,
      derived: null,
      handle,
      country,
      countryOpen: countryStatus.open,
      countryLive: countryStatus.live,
      region: null,
      open: products.length > 0,
      heading: shopifyCollection.title,
      description: shopifyCollection.description,
      products,
      origin,
      seo: {
        title: `${shopifyCollection.title} — ${products.length} Souvenir T-Shirts | ${SITE_NAME}`,
        description:
          shopifyCollection.description ||
          `${shopifyCollection.title} — faux-vintage souvenir t-shirts for overlooked towns, ${DISPLAY_PRICE} each.`,
        canonical: `${origin}/collections/${handle}`,
      },
    };
  }

  // A handle the site itself publishes must never 404 just because the store
  // did not answer. These URLs are in the nav on every page; a 404 here takes
  // the whole shop down, which is exactly what removing the catalog fallback
  // did. Render the rack empty and say so instead.
  if (KNOWN_HANDLES.has(handle)) {
    const rack = await deriveUtilityRack(context.storefront, handle, style, page);
    return {
      kind: 'shopify' as const,
      connection: null,
      derived: rack,
      handle,
      country,
      countryOpen: countryStatus.open,
      countryLive: countryStatus.live,
      region: null,
      open: rack.products.length > 0,
      // Keep the store's own title and copy when the collection exists and is
      // merely empty; only invent them when it does not exist at all.
      heading: shopifyCollection?.title || titleForHandle(handle),
      description: shopifyCollection?.description || '',
      products: rack.products,
      origin,
      seo: {
        title: `${titleForHandle(handle)} | ${SITE_NAME}`,
        description:
          'Faux-vintage souvenir t-shirts for overlooked towns across Canada and the US.',
        canonical: `${origin}/collections/${handle}`,
      },
    };
  }

  throw new Response('No such collection', {status: 404});
}

/** Every collection handle this site links to. */
const KNOWN_HANDLES = new Set<string>(Object.values(UTILITY_COLLECTIONS));

/**
 * The utility racks, rebuilt from products when their collections are not
 * published. Coming In Due Time stays empty on purpose — it is a list of what
 * we do not sell yet, which cannot be derived from what we do.
 */
async function deriveUtilityRack(
  storefront: Route.LoaderArgs['context']['storefront'],
  handle: string,
  style: string,
  page: number,
) {
  const empty: Awaited<ReturnType<typeof derivedRack>> = {
    products: [],
    total: 0,
    page: 1,
    pages: 1,
    styleCounts: {},
  };
  switch (handle) {
    case UTILITY_COLLECTIONS.allSouvenirs:
      return derivedRack(storefront, {style, page});
    case UTILITY_COLLECTIONS.canada:
      return derivedRack(storefront, {country: 'Canada', style, page});
    case UTILITY_COLLECTIONS.unitedStates:
      return derivedRack(storefront, {country: 'United States', style, page});
    case UTILITY_COLLECTIONS.newArrivals: {
      const products = await loadNewestProducts(storefront, 24);
      return {...empty, products, total: products.length};
    }
    case UTILITY_COLLECTIONS.nowOpen: {
      const products = await productsInOpenRegions(storefront, 24);
      return {...empty, products, total: products.length};
    }
    default:
      return empty;
  }
}

function titleForHandle(handle: string): string {
  return handle
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function CollectionPage() {
  const data = useLoaderData<typeof loader>();
  const nonce = useNonce();
  const [params, setParams] = useSearchParams();

  const sort = (params.get('sort') ?? 'featured') as SortKey;
  const availability = params.get('availability') ?? '';
  const style = params.get('style') ?? '';

  const setParam = (key: string, value: string) =>
    setParams(
      (prev) => {
        if (value) prev.set(key, value);
        else prev.delete(key);
        // Changing a filter or sort must return to page one, or you land on
        // an out-of-range page and see an empty rack.
        if (key !== 'page') prev.delete('page');
        return prev;
      },
      {preventScrollReset: true, replace: true},
    );

  // The API already sorted and filtered; this page is exactly what to show.
  const visible = data.products;

  const isRegion = data.kind === 'region';
  const showWaitlist = isRegion && visible.length === 0;

  return (
    <div className="msc-page" style={{paddingBottom: '88px'}}>
      <Breadcrumbs region={data.region} heading={data.heading} kind={data.kind} />

      <div className="province-header">
        <span className="msc-kicker">
          {isRegion ? (data.open ? 'Now open' : 'Coming in due time') : 'The rack'}
        </span>
        <h1>{data.heading}</h1>
        {data.description && (
          <p className="province-copy region-description">{data.description}</p>
        )}
        {visible.length > 0 && (
          <span className="msc-kicker msc-kicker--navy">
            {visible.length} {visible.length === 1 ? 'souvenir' : 'souvenirs'} ·{' '}
            collect 2 and save 15%
          </span>
        )}
      </div>

      {showWaitlist ? (
        <RegionWaitlist region={data.region as Region} />
      ) : visible.length > 0 ? (
        <>
          <div className="shop-toolbar" role="group" aria-label="Filter and sort">
            <label>
              <span className="msc-label">Availability</span>
              <select
                className="msc-input"
                value={availability}
                onChange={(e) => setParam('availability', e.target.value)}
              >
                <option value="">Everything</option>
                <option value="in-stock">On the rack</option>
                <option value="sold-out">Off the rack</option>
              </select>
            </label>
            <label>
              <span className="msc-label">Sort</span>
              <select
                className="msc-input"
                value={sort}
                onChange={(e) => setParam('sort', e.target.value)}
              >
                {Object.entries(SORTS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {data.derived && Object.keys(data.derived.styleCounts).length > 1 && (
            <div className="style-filter" role="group" aria-label="Filter by print">
              <button
                type="button"
                className="collection-chip"
                data-selected={!style}
                onClick={() => setParam('style', '')}
              >
                All prints
              </button>
              {PRINT_STYLES.filter(
                (s) => (data.derived!.styleCounts[s.value] ?? 0) > 0,
              ).map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className="collection-chip"
                  data-selected={style === s.value}
                  onClick={() => setParam('style', style === s.value ? '' : s.value)}
                >
                  {s.label}
                  <em>{data.derived!.styleCounts[s.value]}</em>
                </button>
              ))}
            </div>
          )}

          <div className="shop-count">
            <span className="msc-kicker msc-kicker--navy">
              {data.derived
                ? `${data.derived.total} souvenir${data.derived.total === 1 ? '' : 's'}` +
                  (data.derived.pages > 1
                    ? ` · page ${data.derived.page} of ${data.derived.pages}`
                    : '')
                : `${visible.length} on this page`}
            </span>
            {(availability || sort !== 'featured') && (
              <button
                type="button"
                className="product-size-guide-link"
                onClick={() => setParams({}, {replace: true})}
              >
                Clear filters
              </button>
            )}
          </div>

          {data.derived && data.derived.pages > 1 && (
            <nav className="rack-pager" aria-label="Pagination">
              <button
                type="button"
                className="collection-chip"
                disabled={data.derived.page <= 1}
                onClick={() => setParam('page', String(data.derived!.page - 1))}
              >
                ← Previous
              </button>
              <span>
                Page {data.derived.page} of {data.derived.pages}
              </span>
              <button
                type="button"
                className="collection-chip"
                disabled={data.derived.page >= data.derived.pages}
                onClick={() => setParam('page', String(data.derived!.page + 1))}
              >
                Next →
              </button>
            </nav>
          )}

          {data.connection ? (
            <div className="collection-pagination">
              <PaginatedResourceSection
                connection={data.connection}
                resourcesClassName="rack-grid"
              >
                {({node, index}) => (
                  <SouvenirProductCard
                    key={node.id}
                    product={node}
                    loading={index < 4 ? 'eager' : 'lazy'}
                  />
                )}
              </PaginatedResourceSection>
            </div>
          ) : (
            <div className="rack-grid">
              {visible.map((product, i) => (
                <SouvenirProductCard
                  key={product.id}
                  product={product}
                  loading={i < 4 ? 'eager' : 'lazy'}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <EmptyRack handle={data.handle} filtered={data.products.length > 0} />
      )}

      {isRegion && visible.length > 0 && (
        <Reveal>
          <p className="collection-footnote">
            Every shirt here is a real town where people live full lives, mostly
            without incident. Not seeing yours?{' '}
            <Link to="/request-a-town">Put it on the list</Link>.
          </p>
        </Reveal>
      )}

      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: data.heading,
            description: data.seo.description,
            url: data.seo.canonical,
            isPartOf: {'@type': 'WebSite', name: SITE_NAME, url: data.origin},
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: visible.length,
              itemListElement: visible.map((product, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: product.title,
                url: `${data.origin}/products/${product.handle}`,
              })),
            },
          }),
        }}
      />
    </div>
  );
}

/** Country → Region, as asked. Local racks breadcrumb through Collections. */
function Breadcrumbs({
  region,
  heading,
  kind,
}: {
  region: Region | null;
  heading: string;
  kind: string;
}) {
  return (
    <nav className="msc-breadcrumb" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      <span aria-hidden="true">·</span>
      {region ? (
        <>
          <Link to={`/collections/${countryCollectionHandle(region.country)}`}>
            {region.country}
          </Link>
          <span aria-hidden="true">·</span>
          <span aria-current="page">{region.name}</span>
        </>
      ) : (
        <>
          <Link to="/collections">
            {kind === 'local' ? 'Collections' : 'Shop'}
          </Link>
          <span aria-hidden="true">·</span>
          <span aria-current="page">{heading}</span>
        </>
      )}
    </nav>
  );
}

/** Non-region collection with nothing in it — honest, and still a way out. */
function EmptyRack({handle, filtered}: {handle: string; filtered: boolean}) {
  return (
    <div className="guest-book-empty">
      <h3>
        {filtered
          ? 'Nothing matches that combination.'
          : 'This rack is empty at the moment.'}
      </h3>
      <p style={{maxWidth: '50ch', margin: '0 auto'}}>
        {filtered
          ? 'Which is itself very on-brand. Try loosening a filter.'
          : 'It is built and waiting on stock. The rest of the shop is not empty.'}
      </p>
      <div className="route-error-actions">
        <Link className="msc-button" to="/collections/all-souvenirs">
          Every souvenir
        </Link>
        <Link className="msc-button msc-button--ghost" to={`/collections/${handle}`}>
          Reload the rack
        </Link>
      </div>
    </div>
  );
}
