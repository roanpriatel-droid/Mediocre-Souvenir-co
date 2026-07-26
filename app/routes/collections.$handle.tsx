import {useMemo} from 'react';
import {Link, redirect, useLoaderData, useSearchParams} from 'react-router';
import {useNonce} from '@shopify/hydrogen';
import type {Route} from './+types/collections.$handle';
import {SouvenirGrid} from '~/components/SouvenirCard';
import {RegionWaitlist} from '~/components/RegionWaitlist';
import {RackGrid} from '~/components/TownRackCard';
import {Reveal} from '~/components/Reveal';
import {
  COLLECTION_REDIRECTS,
  collectionGroupLabel,
  DISPLAY_PRICE,
  getAllTowns,
  getCollection,
  getCollections,
  getCollectionTowns,
  getNewArrivals,
  type Region,
} from '~/lib/catalog';
import {
  countryCollectionHandle,
  isRegionOpen,
  loadCollection,
  loadRegionStatus,
  regionForCollectionHandle,
  UTILITY_COLLECTIONS,
  type SouvenirCard,
} from '~/lib/shopify-collections';
import {regionDescription, regionTagline} from '~/lib/region-copy';
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
  const localCollection = getCollection(handle);

  // One Storefront round trip; failures degrade rather than throw.
  const shopifyCollection = await loadCollection(context.storefront, handle);
  const products: SouvenirCard[] = shopifyCollection?.products ?? [];

  // ── Region collection ────────────────────────────────────────────────
  if (region) {
    // Trust the products we just fetched; only ask for the wider status when
    // the region looks empty, so an open region costs a single query.
    const open =
      products.length > 0
        ? true
        : isRegionOpen(region, await loadRegionStatus(context.storefront));

    const description = regionDescription(region, open);
    const title = open
      ? `${region.name} Souvenir T-Shirts — ${products.length} Overlooked Towns | ${SITE_NAME}`
      : `${region.name} — Coming In Due Time | ${SITE_NAME}`;

    return {
      kind: 'region' as const,
      handle,
      region,
      open,
      heading: shopifyCollection?.title || `${region.name}`,
      description,
      products,
      localTowns: [],
      siblings: [],
      groupLabel: null,
      origin,
      seo: {
        title,
        description: open
          ? `${regionTagline(region)} Faux-vintage souvenir tees, ${DISPLAY_PRICE} each — collect 2 and save 15%.`
          : `${region.name} has no souvenir yet. Join the waitlist and we will tell you the day it opens.`,
        canonical: `${origin}/collections/${handle}`,
      },
    };
  }

  // ── Shopify non-region collection (All Souvenirs, Now Open, …) ────────
  if (shopifyCollection) {
    return {
      kind: 'shopify' as const,
      handle,
      region: null,
      open: products.length > 0,
      heading: shopifyCollection.title,
      description: shopifyCollection.description,
      products,
      // Two utility racks have a local equivalent. If the store answers with
      // nothing, the town catalog fills the page rather than showing an empty
      // shelf on a URL the nav links to from every page.
      localTowns: products.length === 0 ? localFallbackTowns(handle) : [],
      siblings: [],
      groupLabel: null,
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

  // ── Local curated rack ───────────────────────────────────────────────
  if (localCollection) {
    return {
      kind: 'local' as const,
      handle,
      region: null,
      open: true,
      heading: localCollection.title,
      description: localCollection.blurb,
      products: [],
      localTowns: getCollectionTowns(handle),
      siblings: getCollections()
        .filter((c) => c.group === localCollection.group && c.handle !== handle)
        .map((c) => ({handle: c.handle, navLabel: c.navLabel})),
      groupLabel: collectionGroupLabel(localCollection.group),
      origin,
      seo: {
        title: `${localCollection.navLabel} Souvenir T-Shirts | ${SITE_NAME}`,
        description: localCollection.metaDescription,
        canonical: `${origin}/collections/${handle}`,
      },
    };
  }

  // A utility handle the store has not created yet still renders from the
  // catalog — these URLs are in the nav on every page.
  const fallbackTowns = localFallbackTowns(handle);
  if (fallbackTowns.length) {
    return {
      kind: 'local' as const,
      handle,
      region: null,
      open: true,
      heading: handle === 'new-arrivals' ? 'New arrivals' : 'All souvenirs',
      description:
        handle === 'new-arrivals'
          ? 'The latest towns to be taken as seriously as they always should have been.'
          : 'Every town we have drawn so far, on one rack.',
      products: [],
      localTowns: fallbackTowns,
      siblings: [],
      groupLabel: null,
      origin,
      seo: {
        title: `${handle === 'new-arrivals' ? 'New Arrivals' : 'All Souvenirs'} | ${SITE_NAME}`,
        description:
          'Faux-vintage souvenir t-shirts for overlooked towns across Canada and the US.',
        canonical: `${origin}/collections/${handle}`,
      },
    };
  }

  throw new Response('No such collection', {status: 404});
}

/** Local stand-in content for the two utility racks that have one. */
function localFallbackTowns(handle: string) {
  if (handle === UTILITY_COLLECTIONS.newArrivals) return getNewArrivals();
  if (handle === UTILITY_COLLECTIONS.allSouvenirs) return getAllTowns();
  return [];
}

export default function CollectionPage() {
  const data = useLoaderData<typeof loader>();
  const nonce = useNonce();
  const [params, setParams] = useSearchParams();

  const sort = (params.get('sort') ?? 'featured') as SortKey;
  const availability = params.get('availability') ?? '';

  const setParam = (key: string, value: string) =>
    setParams(
      (prev) => {
        if (value) prev.set(key, value);
        else prev.delete(key);
        return prev;
      },
      {preventScrollReset: true, replace: true},
    );

  const visible = useMemo(
    () => sortProducts(filterProducts(data.products, availability), sort),
    [data.products, availability, sort],
  );

  const isRegion = data.kind === 'region';
  const showWaitlist = isRegion && visible.length === 0;

  return (
    <div className="msc-page" style={{paddingBottom: '88px'}}>
      <Breadcrumbs region={data.region} heading={data.heading} kind={data.kind} />

      <div className="province-header">
        <span className="msc-kicker">
          {isRegion
            ? data.open
              ? 'Now open'
              : 'Coming in due time'
            : data.kind === 'local'
              ? data.groupLabel
              : 'The rack'}
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

      {/* Local racks keep the town-catalog grid; Shopify racks get filters.
          A Shopify rack that came back empty but has catalog stand-ins renders
          those rather than an empty shelf. */}
      {data.kind === 'local' || data.localTowns.length > 0 ? (
        <LocalRack data={data} />
      ) : showWaitlist ? (
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

          <div className="shop-count">
            <span className="msc-kicker msc-kicker--navy">
              {visible.length} of {data.products.length}
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

          <SouvenirGrid products={visible} />
        </>
      ) : (
        <EmptyRack handle={data.handle} filtered={data.products.length > 0} />
      )}

      {isRegion && visible.length > 0 && (
        <Reveal>
          <p className="collection-footnote">
            Every shirt here is a real town where people live full lives, mostly
            without incident. Not seeing yours?{' '}
            <Link to="/request-your-town">Put it on the list</Link>.
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

function LocalRack({data}: {data: {handle: string; localTowns: any[]; siblings: {handle: string; navLabel: string}[]; groupLabel: string | null}}) {
  return (
    <>
      {data.localTowns.length > 0 ? (
        <RackGrid towns={data.localTowns} />
      ) : (
        <EmptyRack handle={data.handle} filtered={false} />
      )}
      {data.siblings.length > 0 && (
        <Reveal>
          <section className="collection-siblings">
            <span className="msc-kicker msc-kicker--navy">
              {data.groupLabel}
            </span>
            <div className="collection-chip-row">
              {data.siblings.map((sibling) => (
                <Link
                  key={sibling.handle}
                  className="collection-chip"
                  to={`/collections/${sibling.handle}`}
                >
                  {sibling.navLabel}
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
      )}
    </>
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

function filterProducts(products: SouvenirCard[], availability: string) {
  if (availability === 'in-stock') return products.filter((p) => p.availableForSale);
  if (availability === 'sold-out') return products.filter((p) => !p.availableForSale);
  return products;
}

function sortProducts(products: SouvenirCard[], sort: SortKey) {
  const price = (p: SouvenirCard) => Number(p.priceRange.minVariantPrice.amount);
  const copy = [...products];
  switch (sort) {
    case 'a-z':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'z-a':
      return copy.sort((a, b) => b.title.localeCompare(a.title));
    case 'price-asc':
      return copy.sort((a, b) => price(a) - price(b));
    case 'price-desc':
      return copy.sort((a, b) => price(b) - price(a));
    default:
      return copy; // Shopify's own collection sort order
  }
}
