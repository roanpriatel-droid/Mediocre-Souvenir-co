import {Link, useLoaderData} from 'react-router';
import {useNonce} from '@shopify/hydrogen';
import type {Route} from './+types/collections._index';
import {Reveal} from '~/components/Reveal';
import {getRegionsByCountry, type Region} from '~/lib/catalog';
import {
  loadRegionStatus,
  UTILITY_COLLECTIONS,
} from '~/lib/shopify-collections';
import {regionNote} from '~/lib/region-copy';
import {SITE_NAME} from '~/lib/seo';

/**
 * Index of the store's collections.
 *
 * This used to list racks derived from the local town catalog — by colorway,
 * by design template, by size of the place. Those were invented here and had
 * no counterpart in the store, so with a real catalogue they were a parallel
 * shop competing with the actual one. The collections are the store's now.
 */

export const meta: Route.MetaFunction = ({data}) => [
  {title: `Collections — Every Rack in the Shop | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'Every collection in the shop: all souvenirs, new arrivals, what is ' +
      'open now, and one rack per province and state.',
  },
  ...(data
    ? [
        {
          tagName: 'link' as const,
          rel: 'canonical',
          href: `${data.origin}/collections`,
        },
      ]
    : []),
];

const UTILITY_CARDS = [
  {
    handle: UTILITY_COLLECTIONS.allSouvenirs,
    title: 'All souvenirs',
    blurb: 'Everything we make, every region we have reached, on one rack.',
  },
  {
    handle: UTILITY_COLLECTIONS.nowOpen,
    title: 'Now open',
    blurb: 'The regions we have actually gotten to. Start here.',
  },
  {
    handle: UTILITY_COLLECTIONS.newArrivals,
    title: 'New arrivals',
    blurb: 'The latest towns to be taken as seriously as they always should have been.',
  },
  {
    handle: UTILITY_COLLECTIONS.canada,
    title: 'Canada',
    blurb: 'Thirteen provinces and territories, most of them overlooked on purpose by everyone else.',
  },
  {
    handle: UTILITY_COLLECTIONS.unitedStates,
    title: 'United States',
    blurb: 'Fifty states, and the towns in them nobody prints a shirt for.',
  },
  {
    handle: UTILITY_COLLECTIONS.comingInDueTime,
    title: 'Coming in due time',
    blurb: 'What is on the route but not yet on the rack.',
  },
];

export async function loader({context, request}: Route.LoaderArgs) {
  const status = await loadRegionStatus(context.storefront);
  return {
    open: status.open,
    live: status.live,
    origin: new URL(request.url).origin,
  };
}

export default function CollectionsIndex() {
  const {open, live, origin} = useLoaderData<typeof loader>();
  const nonce = useNonce();
  const openCount = Object.values(open).filter(Boolean).length;

  return (
    <div className="msc-page" style={{paddingBottom: '88px'}}>
      <div className="province-header">
        <span className="msc-kicker">The filing system</span>
        <h1>Collections</h1>
        <p className="province-copy">
          Six ways through the shop, and one rack for every province and state.
          {live && openCount > 0
            ? ` ${openCount} regions are open; the rest take a waitlist.`
            : ' Every region goes somewhere.'}
        </p>
      </div>

      <section className="collection-group">
        <div className="collection-group-head">
          <h2>The whole shop</h2>
          <p>Start wide, then narrow by where the place actually is.</p>
        </div>
        <div className="collection-index-grid">
          {UTILITY_CARDS.map((card, i) => (
            <Reveal key={card.handle} delay={(i % 3) as 0 | 1 | 2}>
              <Link
                className="collection-card"
                to={`/collections/${card.handle}`}
                prefetch="intent"
              >
                <h3>{card.title}</h3>
                <p>{card.blurb}</p>
                <span className="collection-card-more">See the rack →</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <RegionColumn
        label="Canada"
        regions={getRegionsByCountry('Canada')}
        open={open}
        live={live}
      />
      <RegionColumn
        label="United States"
        regions={getRegionsByCountry('United States')}
        open={open}
        live={live}
      />

      <Reveal>
        <div className="msc-form-success" style={{marginTop: '48px'}}>
          <h2>Not seeing your region open?</h2>
          <p style={{maxWidth: '46ch'}}>
            Every closed region takes a waitlist, and the waitlist is the whole
            roadmap. We do not pick by market size. We pick by who asked.
          </p>
          <div className="route-error-actions">
            <Link className="msc-button" to="/request-a-town">
              Name your town
            </Link>
            <Link className="msc-button msc-button--ghost" to="/provinces">
              The region map
            </Link>
          </div>
        </div>
      </Reveal>

      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Collections',
            url: `${origin}/collections`,
            isPartOf: {'@type': 'WebSite', name: SITE_NAME, url: origin},
          }),
        }}
      />
    </div>
  );
}

function RegionColumn({
  label,
  regions,
  open,
  live,
}: {
  label: string;
  regions: Region[];
  open: Record<string, boolean>;
  live: boolean;
}) {
  return (
    <section className="collection-group">
      <div className="collection-group-head">
        <h2>{label}</h2>
        <p>One rack per region. Open racks have shirts; the rest take names.</p>
      </div>
      <div className="region-grid">
        {regions.map((region) => {
          const isOpen = live ? Boolean(open[region.slug]) : undefined;
          return (
            <Link
              key={region.slug}
              className="region-card"
              data-open={isOpen || undefined}
              to={`/collections/${region.slug}`}
              prefetch="intent"
              title={`${region.name} — ${regionNote(region)}`}
            >
              <span className="region-card-name">{region.name}</span>
              <span className="region-card-count">
                {isOpen === undefined ? (
                  'View →'
                ) : isOpen ? (
                  <span className="region-card-badge">Now open</span>
                ) : (
                  'In due time'
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
