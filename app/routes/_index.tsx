import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import type {Route} from './+types/_index';
import {MSCMonogram} from '~/components/Brand';
import {HomeHero} from '~/components/HomeHero';
import {Reveal} from '~/components/Reveal';
import {MarqueeStrip, TrustBar} from '~/components/Strips';
import {RegionBrowse} from '~/components/RegionBrowse';
import {CollectLadder} from '~/components/CollectLadder';
import {Testimonials} from '~/components/Testimonials';
import {
  HomeFaq,
  HowItWorks,
  OrderIncludes,
  PrintStyles,
  SizeAndFit,
} from '~/components/HomeSections';
import {SouvenirGrid, SouvenirGridSkeleton} from '~/components/SouvenirCard';
import {
  loadCollectionProducts,
  loadRegionStatus,
  UTILITY_COLLECTIONS,
} from '~/lib/shopify-collections';
import {
  loadDerivedCatalog,
  heroRotation,
  heroSlides,
  heroWall,
  loadNewestProducts,
  productsInOpenRegions,
} from '~/lib/shopify-catalog';
import {buyerCity, buyerRegion} from '~/lib/geo';
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

export async function loader({context, request}: Route.LoaderArgs) {
  // Where the visitor is, per the Oxygen edge. Best-effort; absence is normal.
  const region = buyerRegion(request) ?? null;
  const city = buyerCity(request) ?? null;
  // Critical: the region grid is the primary navigation, so its status query
  // is awaited. The product rows sit below the fold and stream in.
  const regionStatus = await loadRegionStatus(context.storefront);

  /*
   * The hero's three pieces, in parallel. They all read the same memoised
   * product index — which caches its in-flight promise, so concurrency costs
   * one sweep, not three — and each then makes one batched card request.
   *
   * `heroSlides` always returns eleven — the visitor's own region takes the
   * first turn where the edge placed them, and another region takes it where
   * it did not. The count is fixed because the CSS that cycles them divides
   * one loop into that many equal turns.
   */
  const [slides, rotation, wallProducts, {entries}] = await Promise.all([
    heroSlides(context.storefront, region ?? undefined, 11),
    heroRotation(context.storefront, region ?? undefined, 15),
    // The wall is decoration: 35 cropped, greyscaled, 34%-ink tiles. It needs
    // an id and an image, not price ranges, variants, tags and compare-at
    // ranges — those were ~23KB of hydration payload for pixels nobody can
    // read.
    heroWall(context.storefront, 35),
    loadDerivedCatalog(context.storefront),
  ]);

  const wall = wallProducts.map((product) => ({
    id: product.id,
    featuredImage: product.featuredImage,
  }));

  return {
    origin: new URL(request.url).origin,
    city,
    slides,
    rotation,
    wall,
    totalProducts: entries.length,
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
  const {
    origin,
    city,
    slides,
    rotation,
    wall,
    totalProducts,
    regionStatus,
    nowOpen,
    newArrivalProducts,
    postcards,
  } = loaderData;
  const openCount = Object.values(regionStatus.open).filter(Boolean).length;

  return (
    <div className="home">
      {/* 1 · HERO — geo-personalised, rotating, product above the fold */}
      <HomeHero
        slides={slides}
        city={city}
        rotation={rotation}
        wall={wall}
        totalProducts={totalProducts}
        openRegions={openCount}
      />

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

      {/* 4 · SHOP BY PRINT — the same towns, four ways to say them */}
      <section className="msc-section msc-page" aria-labelledby="by-print">
        <div className="msc-section-rule">
          <h2 id="by-print">Four prints, one rack each</h2>
          <Link className="msc-section-note" to="/collections/all-souvenirs">
            Everything we make →
          </Link>
        </div>
        <p className="msc-section-lede">
          Every town is drawn four ways. Pick the one that sounds like how you
          would describe the place out loud.
        </p>
        <Reveal>
          <PrintStyles />
        </Reveal>
      </section>

      {/* 5 · RECENTLY INSULTED — new arrivals */}
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

      {/* 7 · HOW IT WORKS — what happens after the button */}
      <section
        className="msc-section msc-page"
        aria-labelledby="how-it-works"
      >
        <div className="msc-section-rule">
          <h2 id="how-it-works">What happens after you order</h2>
          <Link className="msc-section-note" to="/shipping-returns">
            Shipping &amp; returns →
          </Link>
        </div>
        <Reveal>
          <HowItWorks />
        </Reveal>
      </section>

      {/* 8 · EDITORIAL TEASER — Postcards From Nowhere */}
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

      {/* 10 · SIZE & FIT — the last thing between a visitor and a size button */}
      <section
        className="msc-section msc-section--band msc-page"
        aria-labelledby="size-fit"
      >
        <Reveal>
          <SizeAndFit />
        </Reveal>
      </section>

      {/* 11 · COLLECT LADDER */}
      <section className="msc-section msc-page">
        <CollectLadder />
      </section>

      {/* 9 · MIDDLING PRAISE */}
      <section className="msc-section msc-page">
        <Reveal>
          <Testimonials />
        </Reveal>
      </section>

      {/* 13 · WHAT EVERY ORDER INCLUDES — risk taken off the table */}
      <section className="msc-section msc-page" aria-labelledby="included">
        <div className="msc-section-rule">
          <h2 id="included">Every order, every time</h2>
          <Link className="msc-section-note" to="/shipping-returns">
            The full policy →
          </Link>
        </div>
        <Reveal>
          <OrderIncludes />
        </Reveal>
      </section>

      {/* 14 · FAQ — the five that get emailed */}
      <section
        className="msc-section msc-section--band msc-page"
        aria-labelledby="home-faq"
      >
        <div className="msc-section-rule">
          <h2 id="home-faq">Before you ask</h2>
          <Link className="msc-section-note" to="/faq">
            All questions →
          </Link>
        </div>
        <Reveal>
          <HomeFaq origin={origin} />
        </Reveal>
      </section>

      <MarqueeStrip variant="mustard" />

      {/* 10 · TRUST */}
      <section className="msc-section" style={{paddingBottom: 0}}>
        <TrustBar />
      </section>

      {/* The newsletter lives in the footer — one capture per page, not two
          competing forms with identical headings. */}
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
