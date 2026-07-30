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
  BiggestRacks,
  BigNumbers,
  GiftBlock,
  HomeFaq,
  HowItWorks,
  Manifesto,
  OrderIncludes,
  PrintCloseUps,
  PrintStyles,
  SizeAndFit,
  TownSearchBlock,
} from '~/components/HomeSections';
import {StickyShopBar} from '~/components/StickyShopBar';
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
  regionSpotlight,
} from '~/lib/shopify-catalog';
import {REGIONS} from '~/lib/catalog';
import {townNameFrom} from '~/lib/town-copy';
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
  const [slides, rotation, wallProducts, {entries, byRegion}] = await Promise.all([
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

  /*
   * Counts per region.
   *
   * These come from the `custom.product_count` metafield on each collection,
   * which arrives with the region-status query that this page already makes —
   * one round trip for all seventy numbers. The product index is the fallback
   * for a store whose metafields have not been synced, so the grid still
   * shows real numbers either way, and it is only paid for when needed.
   */
  const counts: Record<string, number> = {};
  for (const region of REGIONS) {
    const n =
      regionStatus.counts[region.slug] ?? byRegion.get(region.slug)?.length ?? 0;
    if (n > 0) counts[region.slug] = n;
  }

  // Depth as a credibility signal — the honest version of a bestseller row.
  const biggestRacks = REGIONS.map((region) => ({
    slug: region.slug,
    name: region.name,
    total: counts[region.slug] ?? 0,
  }))
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 12);

  /*
   * The visitor's own rack. The hero says "108 souvenirs for British Columbia"
   * and then showed them none of them; this is the row that follows through.
   * Falls back to the best-stocked regions when the edge cannot place anyone.
   */
  const spotlight = region
    ? await regionSpotlight(context.storefront, region, 8)
    : {products: await productsInOpenRegions(context.storefront, 8), total: 0};

  // Four close-ups, drawn from the same wall products so nothing extra is
  // fetched. Different products from the ones on the wall's first row.
  const macro = wallProducts
    .slice(8, 20)
    .filter((product) => product.featuredImage?.url)
    .slice(0, 4)
    .map((product) => ({
      id: product.id,
      url: product.featuredImage!.url,
      handle: product.handle,
      town: townNameFrom(product.title, product.handle),
    }));

  return {
    origin: new URL(request.url).origin,
    city,
    region,
    slides,
    rotation,
    wall,
    counts,
    biggestRacks,
    macro,
    spotlight: spotlight.products,
    spotlightTotal: spotlight.total || (region ? counts[region.slug] ?? 0 : 0),
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
    region,
    slides,
    rotation,
    wall,
    counts,
    biggestRacks,
    macro,
    spotlight,
    spotlightTotal,
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

      {/* 2 · TYPE YOUR TOWN — the highest-intent action on the store */}
      <section className="msc-section msc-page" aria-labelledby="find-town">
        <TownSearchBlock total={totalProducts} />
      </section>

      {/* 3 · YOUR RACK — the shirts the hero just promised */}
      {spotlight.length > 0 && (
        <section
          className="msc-section msc-section--band msc-page"
          aria-labelledby="your-rack"
        >
          <div className="msc-section-rule">
            <h2 id="your-rack">
              {region ? `Your rack: ${region.name}` : 'Straight off the rack'}
            </h2>
            <Link
              className="msc-section-note"
              to={region ? `/collections/${region.slug}` : '/collections/all-souvenirs'}
            >
              {region && spotlightTotal > 0
                ? `All ${spotlightTotal} →`
                : 'See all →'}
            </Link>
          </div>
          <SouvenirGrid products={spotlight} eagerCount={4} />
        </section>
      )}

      {/* 4 · THE REGION GRID — navigation and waitlist engine in one */}
      <section className="msc-section msc-page" aria-labelledby="browse-region">
        <div className="msc-section-rule">
          <h2 id="browse-region">Browse by region</h2>
          <Link className="msc-section-note" to="/towns">
            Full directory →
          </Link>
        </div>
        <RegionBrowse
          open={regionStatus.open}
          live={regionStatus.live}
          counts={counts}
        />
      </section>

      {/* 5 · THE BIGGEST RACKS — depth, honestly measured */}
      <section className="msc-section msc-page" aria-labelledby="biggest">
        <div className="msc-section-rule">
          <h2 id="biggest">Where we are deepest</h2>
          <Link className="msc-section-note" to="/towns">
            The full directory →
          </Link>
        </div>
        <p className="msc-section-lede">
          No bestseller list, because we are not going to invent one. This is
          simply where the most towns have been drawn so far.
        </p>
        <Reveal>
          <BiggestRacks racks={biggestRacks} />
        </Reveal>
      </section>

      {/* 6 · NOW OPEN — live products */}
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

      {/* 8 · THE PRINT, UP CLOSE — texture from the files we already have */}
      <section className="msc-section msc-page" aria-labelledby="up-close">
        <div className="msc-section-rule">
          <h2 id="up-close">The ink, up close</h2>
          <Link className="msc-section-note" to="/materials">
            What it is printed on →
          </Link>
        </div>
        <p className="msc-section-lede">
          Heavyweight 6.1 oz cotton, garment-dyed, so the fade is in the fabric
          rather than printed on top of it. This is what that looks like from
          six inches away.
        </p>
        <Reveal>
          <PrintCloseUps tiles={macro} />
        </Reveal>
      </section>

      {/* 9 · RECENTLY INSULTED — new arrivals */}
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

      {/* 11 · THE GIFT CASE — the market this page never addressed */}
      <section
        className="msc-section msc-section--band msc-page"
        aria-labelledby="gift"
      >
        <Reveal>
          <GiftBlock />
        </Reveal>
      </section>

      {/* 12 · EDITORIAL TEASER — Postcards From Nowhere */}
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

      {/* 13 · THE MANIFESTO — why any of this exists */}
      <section className="msc-section msc-page" aria-label="Why we do this">
        <Reveal>
          <Manifesto />
        </Reveal>
      </section>

      {/* 14 · THE CERTIFICATE */}
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

      {/* 18 · THE NUMBERS — the claim, set large */}
      <section className="msc-section msc-page" aria-label="By the numbers">
        <Reveal>
          <BigNumbers total={totalProducts} regions={openCount} />
        </Reveal>
      </section>

      <MarqueeStrip variant="mustard" />

      {/* 10 · TRUST */}
      <section className="msc-section" style={{paddingBottom: 0}}>
        <TrustBar />
      </section>

      <StickyShopBar
        region={
          region && spotlightTotal > 0
            ? {slug: region.slug, name: region.name, total: spotlightTotal}
            : null
        }
        total={totalProducts}
      />

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
