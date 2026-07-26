import {Link, useLoaderData} from 'react-router';
import {useNonce} from '@shopify/hydrogen';
import type {Route} from './+types/new-arrivals';
import {RackGrid} from '~/components/TownRackCard';
import {Reveal} from '~/components/Reveal';
import {
  DISPLAY_PRICE,
  getAllTowns,
  getMostOverlooked,
  getNewArrivals,
  getOpenRegions,
  getTownsByRegion,
  regionPath,
  REGIONS,
} from '~/lib/catalog';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => [
  {
    title: data?.towns.length
      ? `New Arrivals — ${data.towns.length} Freshly Commemorated Towns | ${SITE_NAME}`
      : `New Arrivals | ${SITE_NAME}`,
  },
  {
    name: 'description',
    content:
      'The latest overlooked towns to receive their commemorative garment — ' +
      `faux-vintage souvenir tees, ${DISPLAY_PRICE} each, faded on purpose.`,
  },
  ...(data
    ? [
        {
          tagName: 'link' as const,
          rel: 'canonical',
          href: `${data.origin}/new-arrivals`,
        },
      ]
    : []),
];

export async function loader({request}: Route.LoaderArgs) {
  const towns = getNewArrivals();
  const newHandles = new Set(towns.map((town) => town.handle));

  return {
    towns,
    // A second rack so the page is never a dead end once the batch is browsed.
    alsoWorthSeeing: getMostOverlooked()
      .filter((town) => !newHandles.has(town.handle))
      .slice(0, 4),
    openRegions: getOpenRegions().map((region) => ({
      ...region,
      path: regionPath(region),
      townCount: getTownsByRegion(region.slug).length,
    })),
    nextRegion: REGIONS.find((region) => region.status === 'next'),
    totalTowns: getAllTowns().length,
    origin: new URL(request.url).origin,
  };
}

export default function NewArrivals() {
  const {
    towns,
    alsoWorthSeeing,
    openRegions,
    nextRegion,
    totalTowns,
    origin,
  } = useLoaderData<typeof loader>();
  const nonce = useNonce();

  return (
    <div className="msc-page" style={{paddingBottom: '88px'}}>
      <div className="province-header">
        <span className="msc-kicker">Fresh off the press</span>
        <h1>New arrivals</h1>
        <p className="province-copy">
          The latest towns to be taken as seriously as they always should have
          been. Every one of them printed to order on a garment-dyed
          heavyweight, and none of them asked for this.
        </p>
        <span className="msc-kicker msc-kicker--navy">
          {towns.length} in this batch · {totalTowns} towns in all ·{' '}
          {DISPLAY_PRICE} each
        </span>
      </div>

      {towns.length > 0 ? (
        <RackGrid towns={towns} />
      ) : (
        <div className="guest-book-empty">
          <h3>Nothing new this week.</h3>
          <p>
            The current batch has been on the rack long enough to stop counting
            as new, which is its own kind of milestone. The{' '}
            <Link to="/shop">full rack</Link> has all {totalTowns} towns, and
            the next batch is drawn from{' '}
            <Link to="/request-your-town">the waitlist</Link>.
          </p>
        </div>
      )}

      {alsoWorthSeeing.length > 0 && (
        <Reveal>
          <section className="collection-siblings">
            <span className="msc-kicker msc-kicker--navy">
              While you are here — the most overlooked
            </span>
            <p style={{margin: '10px 0 20px', maxWidth: '56ch', fontSize: '15px'}}>
              Towns with the least chance of ever getting a souvenir, which is
              exactly why they have one.
            </p>
            <RackGrid towns={alsoWorthSeeing} />
            <p style={{marginTop: '18px', fontSize: '15px'}}>
              <Link to="/collections/most-overlooked">
                The whole Most Overlooked rack →
              </Link>
            </p>
          </section>
        </Reveal>
      )}

      <Reveal>
        <section className="new-arrivals-next">
          <div>
            <h2>How a town gets here</h2>
            <p>
              One region at a time, and inside a region, the waitlist sets the
              order. Enough neighbours request a place and it gets researched,
              drawn, and shelved with the rest. The catalog is written by
              homesick people, which we consider the correct authorship.
            </p>
            <div className="route-error-actions" style={{justifyContent: 'flex-start'}}>
              <Link className="msc-button" to="/request-your-town">
                Request your town
              </Link>
              <Link className="msc-button msc-button--ghost" to="/shop">
                Shop all {totalTowns}
              </Link>
            </div>
          </div>
          <div>
            <h2>Where we are up to</h2>
            <ul className="new-arrivals-regions">
              {openRegions.map((region) => (
                <li key={region.slug}>
                  <Link to={region.path}>{region.name}</Link>
                  <span>{region.townCount} towns · open</span>
                </li>
              ))}
              {nextRegion && (
                <li>
                  <span>{nextRegion.name}</span>
                  <span>Next on the route</span>
                </li>
              )}
            </ul>
            <p style={{marginTop: '14px', fontSize: '15px'}}>
              <Link to="/provinces">The full map of the route →</Link>
            </p>
          </div>
        </section>
      </Reveal>

      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'New Arrivals',
            url: `${origin}/new-arrivals`,
            isPartOf: {'@type': 'WebSite', name: SITE_NAME, url: origin},
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: towns.length,
              itemListElement: towns.map((town, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: `${town.city} T-Shirt`,
                url: `${origin}/products/${town.handle}`,
              })),
            },
          }),
        }}
      />
    </div>
  );
}
