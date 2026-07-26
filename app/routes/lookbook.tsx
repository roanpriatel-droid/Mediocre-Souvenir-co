import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/lookbook';
import {Reveal} from '~/components/Reveal';
import {ShirtMockup} from '~/components/ShirtMockup';
import {getTownByHandle, TIER_LABELS} from '~/lib/catalog';
import {productsByHandle} from '~/lib/shopify-search';
import {cardPriceLabel} from '~/lib/shopify-collections';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `The Lookbook — Highway 1 and Onward | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'A road trip through the British Columbia collection — Tofino to ' +
      'Trail, one overlooked town at a time, every stop shoppable.',
  },
  {tagName: 'link', rel: 'canonical', href: `${data?.origin ?? ''}/lookbook`},
];

/** The route, in driving order — a scrolling visual story per collection. */
const STOPS: {handle: string; km: string; note: string}[] = [
  {
    handle: 'tofino-t-shirt',
    km: 'KM 0',
    note: 'Start where the road literally ends. Surfers in the fog like commuters. The shirt is sage because everything here is.',
  },
  {
    handle: 'port-alberni-t-shirt',
    km: 'KM 126',
    note: 'The canal is an inlet and nobody local will let you say otherwise. Respect it. Buy the shirt. Keep moving.',
  },
  {
    handle: 'hope-t-shirt',
    km: 'KM 421',
    note: 'Every highway in the province makes up its mind here. Good sandwich town. All your hopes, etc.',
  },
  {
    handle: 'merritt-t-shirt',
    km: 'KM 536',
    note: 'Country music capital of Canada, briefly. The "briefly" is doing reverent work in that sentence.',
  },
  {
    handle: 'revelstoke-t-shirt',
    km: 'KM 781',
    note: 'Snow, then more snow. The slogan tee runs at 88% ink because the town has been through two hundred washes.',
  },
  {
    handle: 'trail-t-shirt',
    km: 'KM 1,014',
    note: 'End of the line: a very large smelter, operating since 1901, entirely unbothered by your opinion of it. The perfect souvenir.',
  },
];

export async function loader({context, request}: Route.LoaderArgs) {
  // The road trip is editorial and the towns are real, but a stop only becomes
  // a shoppable link when the store actually carries that shirt.
  const products = await productsByHandle(
    context.storefront,
    STOPS.map((stop) => stop.handle),
  );
  const byHandle = new Map(products.map((product) => [product.handle, product]));

  const stops = STOPS.map((stop) => ({
    ...stop,
    town: getTownByHandle(stop.handle),
    product: byHandle.get(stop.handle) ?? null,
  })).filter((s) => s.town !== undefined);
  return {stops, origin: new URL(request.url).origin};
}

export default function Lookbook() {
  const {stops} = useLoaderData<typeof loader>();
  return (
    <div style={{paddingBottom: '80px'}}>
      <header className="article-header">
        <span className="msc-kicker">The lookbook · British Columbia</span>
        <h1>One province. One tank of gas. Six souvenirs.</h1>
        <p style={{fontSize: '18px', maxWidth: '52ch'}}>
          A road trip through the collection, in driving order. Every stop is
          real, every shirt is on the rack, and the smelter is exactly where
          we said it would be.
        </p>
      </header>
      <div>
        {stops.map((stop, i) => (
          <div key={stop.handle}>
            {i > 0 && (
              <div className="lookbook-divider" aria-hidden="true">
                onward
              </div>
            )}
            <Reveal className="lookbook-stop">
              <div className="lookbook-art">
                <ShirtMockup town={stop.town!} />
              </div>
              <div className="lookbook-copy">
                <span className="lookbook-km">{stop.km}</span>
                <h2>
                  {stop.town!.city}, {stop.town!.provinceAbbrev}
                </h2>
                <span className="msc-kicker msc-kicker--navy">
                  {TIER_LABELS[stop.town!.populationTier]} · Est.{' '}
                  {stop.town!.estYear}
                </span>
                <span className="msc-marker">{stop.note}</span>
                {stop.product ? (
                  <Link className="msc-button" to={`/products/${stop.product.handle}`}>
                    This stop · {cardPriceLabel(stop.product)}
                  </Link>
                ) : (
                  <Link
                    className="msc-button msc-button--ghost"
                    to="/collections/british-columbia"
                  >
                    See the BC rack
                  </Link>
                )}
              </div>
            </Reveal>
          </div>
        ))}
      </div>
      <section className="msc-section msc-page">
        <div className="msc-form-success">
          <h2>The road keeps going.</h2>
          <p style={{maxWidth: '44ch'}}>
            Thirty-four more BC towns are on the rack, and the rest of the
            continent is on the route.
          </p>
          <div className="route-error-actions">
            <Link className="msc-button" to="/provinces/british-columbia">
              The full BC collection
            </Link>
            <Link className="msc-button msc-button--ghost" to="/request-a-town">
              Request your town
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
