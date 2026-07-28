import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import type {Route} from './+types/_index';
import {BadgeLogo, MSCMonogram} from '~/components/Brand';
import {Reveal} from '~/components/Reveal';
import {TownSearch} from '~/components/TownSearch';
import {MarqueeStrip, TrustBar} from '~/components/Strips';
import {RegionBrowse} from '~/components/RegionBrowse';
import {CollectLadder} from '~/components/CollectLadder';
import {Testimonials} from '~/components/Testimonials';
import {EmailCapture} from '~/components/EmailCapture';
import {SouvenirGrid, SouvenirGridSkeleton} from '~/components/SouvenirCard';
import {
  loadCollectionProducts,
  loadRegionStatus,
  UTILITY_COLLECTIONS,
} from '~/lib/shopify-collections';
import {
  loadNewestProducts,
  productsInOpenRegions,
} from '~/lib/shopify-catalog';
import {ARTICLES} from '~/lib/journal';
import {SITE_NAME, SITE_TAGLINE} from '~/lib/seo';

export const meta: Route.MetaFunction = () => [
  {title: `${SITE_NAME} — ${SITE_TAGLINE}`},
  {
    name: 'description',
    content:
      'Faux-vintage souvenir t-shirts for overlooked towns across Canada and ' +
      'the US. Sixty-three regions, one rack each, and a certificate that ' +
      'claims nothing. Souvenirs from places you have technically been.',
  },
  {property: 'og:title', content: `${SITE_NAME} — ${SITE_TAGLINE}`},
  {
    property: 'og:description',
    content: 'Souvenir tees for the towns that never got one.',
  },
  {property: 'og:type', content: 'website'},
];

export async function loader({context}: Route.LoaderArgs) {
  // Critical: the region grid is the primary navigation, so its status query
  // is awaited. The product rows sit below the fold and stream in.
  const regionStatus = await loadRegionStatus(context.storefront);

  return {
    regionStatus,
    nowOpen: loadCollectionProducts(
      context.storefront,
      UTILITY_COLLECTIONS.nowOpen,
      12,
    ).then((products) =>
      products.length ? products : productsInOpenRegions(context.storefront, 12),
    ),
    newArrivalProducts: loadCollectionProducts(
      context.storefront,
      UTILITY_COLLECTIONS.newArrivals,
      12,
    ).then((products) =>
      products.length ? products : loadNewestProducts(context.storefront, 12),
    ),
    postcards: [...ARTICLES]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3)
      .map(({slug, title, dek, readingMinutes}) => ({
        slug,
        title,
        dek,
        readingMinutes,
      })),
  };
}

export default function Homepage({loaderData}: Route.ComponentProps) {
  const {regionStatus, nowOpen, newArrivalProducts, postcards} = loaderData;
  const openCount = Object.values(regionStatus.open).filter(Boolean).length;

  return (
    <div className="home">
      {/* 1 · HERO — the CTA is a search field, not a shop button */}
      <section className="hero">
        <BadgeLogo size={210} className="hero-badge" />
        <h1>GENUINE MERCH FOR OVERLOOKED PLACES.</h1>
        <p className="hero-sub">
          Souvenir tees for the towns that never got one ·{' '}
          {openCount > 0 ? `${openCount} regions open` : 'Sixty-three regions'}
        </p>
        <TownSearch />
        <div className="hero-actions">
          <Link className="msc-button" to="/collections/now-open">
            What&rsquo;s open
          </Link>
          <Link className="msc-button msc-button--ghost" to="/towns">
            The directory
          </Link>
        </div>
      </section>

      <MarqueeStrip />

      {/* 2 · THE REGION GRID — navigation and waitlist engine in one */}
      <section className="msc-section msc-page" aria-labelledby="browse-region">
        <div className="msc-section-rule">
          <h2 id="browse-region">Browse by region</h2>
          <Link className="msc-section-note" to="/towns">
            Full directory →
          </Link>
        </div>
        <RegionBrowse open={regionStatus.open} live={regionStatus.live} />
      </section>

      {/* 3 · NOW OPEN — live products */}
      <section className="msc-section msc-page" aria-labelledby="now-open">
        <div className="msc-section-rule">
          <h2 id="now-open">Now open</h2>
          <Link className="msc-section-note" to="/collections/now-open">
            See all →
          </Link>
        </div>
        <Suspense fallback={<SouvenirGridSkeleton count={6} />}>
          <Await resolve={nowOpen} errorElement={<RowFallback />}>
            {(products) =>
              products.length > 0 ? (
                <SouvenirGrid products={products} eagerCount={4} />
              ) : (
                <RowFallback />
              )
            }
          </Await>
        </Suspense>
      </section>

      {/* 4 · RECENTLY INSULTED — new arrivals */}
      <section
        className="msc-section msc-section--band msc-page"
        aria-labelledby="recently-insulted"
      >
        <div className="msc-section-rule">
          <h2 id="recently-insulted">Recently insulted</h2>
          <Link className="msc-section-note" to="/collections/new-arrivals">
            All new arrivals →
          </Link>
        </div>
        <p className="msc-section-lede">
          The latest towns to be taken as seriously as they always should have
          been.
        </p>
        <Suspense fallback={<SouvenirGridSkeleton count={6} />}>
          <Await resolve={newArrivalProducts} errorElement={<RowFallback />}>
            {(products) =>
              products.length > 0 ? (
                <SouvenirGrid products={products} eagerCount={0} />
              ) : (
                <RowFallback />
              )
            }
          </Await>
        </Suspense>
      </section>

      {/* 5 · REQUEST A TOWN banner */}
      <section className="msc-section msc-page" aria-labelledby="request-town">
        <Reveal>
          <div className="request-banner">
            <div>
              <span className="msc-kicker">The waitlist is the roadmap</span>
              <h2 id="request-town">Nominate your mediocre hometown.</h2>
              <p>
                We do not choose regions by market size. We choose them by who
                asked. Put your town on the list and it moves up every time a
                neighbour does the same.
              </p>
            </div>
            <Link className="msc-button msc-button--navy" to="/request-a-town">
              Request a town
            </Link>
          </div>
        </Reveal>
      </section>

      {/* 6 · EDITORIAL TEASER — Postcards From Nowhere */}
      <section className="msc-section msc-section--band msc-page" aria-labelledby="postcards">
        <Reveal>
          <div className="msc-section-rule">
            <h2 id="postcards">Postcards from nowhere</h2>
            <Link className="msc-section-note" to="/postcards">
              Read them all →
            </Link>
          </div>
          <div className="postcard-teaser-row">
            {postcards.map((post) => (
              <Link
                className="postcard-teaser"
                key={post.slug}
                to={`/postcards/${post.slug}`}
                prefetch="intent"
              >
                <span className="msc-kicker msc-kicker--navy">
                  {post.readingMinutes} min
                </span>
                <h3>{post.title}</h3>
                <p>{post.dek}</p>
                <span className="collection-card-more">Read it →</span>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* 7 · THE CERTIFICATE */}
      <section className="msc-section msc-page" aria-labelledby="certificate">
        <Reveal>
          <div className="certificate-block">
            <div className="certificate-block-art" aria-hidden="true">
              <MSCMonogram size={64} />
              <span className="msc-stamp">
                Genuine
                <br />
                Souvenir
                <br />★ ★ ★
              </span>
            </div>
            <div>
              <span className="msc-kicker">Included with every order</span>
              <h2 id="certificate">A Certificate of Mediocre Authenticity.</h2>
              <p>
                A formal document, printed on card stock, certifying that your
                town is — to the best of our knowledge — a place. Distinction:
                none on record. Signed anyway.
              </p>
              <Link className="msc-button msc-button--ghost" to="/certificate">
                What it says
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 8 · COLLECT LADDER */}
      <section className="msc-section msc-page">
        <CollectLadder />
      </section>

      {/* 9 · MIDDLING PRAISE */}
      <section className="msc-section msc-page">
        <Reveal>
          <Testimonials />
        </Reveal>
      </section>

      <MarqueeStrip variant="mustard" />

      {/* 10 · TRUST */}
      <section className="msc-section" style={{paddingBottom: 0}}>
        <TrustBar />
      </section>

      {/* 11 · EMAIL CAPTURE */}
      <EmailCapture />
    </div>
  );
}

/** A streamed row that failed still shows something, not a gap. */
function RowFallback() {
  return (
    <div className="guest-book-empty">
      <h3>That rack is being restocked.</h3>
      <p>
        The shelf is there; the shirts are on their way back to it. Try{' '}
        <Link to="/collections/all-souvenirs">everything we make</Link> or{' '}
        <Link to="/towns">the directory</Link>.
      </p>
    </div>
  );
}
