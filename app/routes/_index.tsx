import {siteOrigin} from '~/lib/site-origin';
import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import type {Route} from './+types/_index';
import {HeroRack} from '~/components/HeroRack';
import {loadRackCards} from '~/lib/hero-rack';
import {Reveal} from '~/components/Reveal';
import {TrustBar} from '~/components/Strips';
import {RegionBrowse} from '~/components/RegionBrowse';
import {RegionMap} from '~/components/RegionMap';
import {CollectLadder} from '~/components/CollectLadder';
import {
  GiftBlock,
  HomeFaq,
  HowItWorks,
  OrderIncludes,
  PrintStyles,
} from '~/components/HomeSections';
import {StickyShopBar} from '~/components/StickyShopBar';
import {SouvenirGrid, SouvenirGridSkeleton} from '~/components/SouvenirCard';
import {loadRegionStatus, wornImage} from '~/lib/shopify-collections';
import {
  loadDerivedCatalog,
  productsInOpenRegions,
  regionSpotlight,
} from '~/lib/shopify-catalog';
import {REGIONS} from '~/lib/catalog';
import {buyerCity, buyerRegion} from '~/lib/geo';
import {ARTICLES} from '~/lib/journal';
import {SITE_NAME, SITE_TAGLINE} from '~/lib/seo';
import {productsByHandle} from '~/lib/shopify-search';
import {loadTowns, type Town} from '~/lib/towns';
import {TownTicker} from '~/components/TownTicker';

const STYLE_SHOT_HANDLES: Record<string, string> = {
  varsity: 'duluth-mn-varsity',
  greetings: 'gander-nl-greetings',
  'i-heart': 'butte-mt-i-heart',
  tour: 'fargo-nd-tour',
  gift: 'trail-bc-greetings',
};

const FEATURED_HANDLES = [
  'toledo-oh-varsity',
  'moose-jaw-sk-greetings',
  'scranton-pa-i-heart',
  'duluth-mn-tour',
  'medicine-hat-ab-varsity',
  'buffalo-ny-greetings',
  'sudbury-on-i-heart',
  'fargo-nd-tour',
];

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${SITE_NAME} — ${SITE_TAGLINE}`},
  {tagName: 'link', rel: 'canonical', href: `${data?.origin ?? ''}/`},
  {
    name: 'description',
    content:
      'Faux-vintage souvenir t-shirts for overlooked towns across Canada and ' +
      'the US, shipped worldwide. Sixty-three regions, one rack each, and a ' +
      'certificate that claims nothing. Souvenirs from places you have ' +
      'technically been.',
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

  // The hero's photos, the product index (for counts) and the town list.
  const [rackCards, styleProducts, {entries, byRegion}, towns] =
    await Promise.all([
      loadRackCards(context.storefront),
      productsByHandle(context.storefront, Object.values(STYLE_SHOT_HANDLES)),
      loadDerivedCatalog(context.storefront),
      loadTowns(context.storefront).catch(() => new Map<string, Town>()),
    ]);

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
      regionStatus.counts[region.slug] ??
      byRegion.get(region.slug)?.length ??
      0;
    if (n > 0) counts[region.slug] = n;
  }

  /*
   * The visitor's own rack. The hero says "108 souvenirs for British Columbia"
   * and then showed them none of them; this is the row that follows through.
   * Falls back to the best-stocked regions when the edge cannot place anyone.
   */
  const spotlight = region
    ? await regionSpotlight(context.storefront, region, 8)
    : {products: await productsInOpenRegions(context.storefront, 8), total: 0};

  return {
    origin: siteOrigin(request),
    city,
    region,
    rackCards,
    styleShots: Object.fromEntries(
      Object.entries(STYLE_SHOT_HANDLES).map(([style, handle]) => {
        const product = styleProducts.find((p) => p.handle === handle);
        return [style, product ? wornImage(product) : null];
      }),
    ),
    townCount: towns.size,
    // Every sixteenth town, for the ticker: about forty, spread A to Z.
    tickerTowns: [...towns.values()]
      .filter((_, index) => index % 16 === 0)
      .map((town) => ({slug: town.slug, place: town.place})),
    counts,
    spotlight: spotlight.products,
    spotlightTotal:
      spotlight.total || (region ? (counts[region.slug] ?? 0) : 0),
    totalProducts: entries.length,
    regionStatus,
    // Hand-picked: towns a stranger has heard of, spread across all four
    // prints and both countries. An alphabetical rack opened on six
    // Aberdeens.
    featured: productsByHandle(context.storefront, FEATURED_HANDLES),
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
    rackCards,
    styleShots,
    townCount,
    tickerTowns,
    counts,
    spotlight,
    spotlightTotal,
    totalProducts,
    regionStatus,
    featured,
    postcards,
  } = loaderData;
  const openCount = Object.values(regionStatus.open).filter(Boolean).length;

  return (
    <div className="home">
      {/* 1 · HERO — one headline, one action, real shirts on real people */}
      <HeroRack
        cards={rackCards}
        totalProducts={totalProducts}
        townCount={townCount}
        regionName={region?.name ?? null}
        regionSlug={region?.slug ?? null}
        regionCount={region ? (counts[region.slug] ?? 0) : 0}
      />

      <TownTicker towns={tickerTowns} />

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
              to={
                region
                  ? `/collections/${region.slug}`
                  : '/collections/all-souvenirs'
              }
            >
              {region && spotlightTotal > 0
                ? `All ${spotlightTotal} →`
                : 'See all →'}
            </Link>
          </div>
          <SouvenirGrid products={spotlight} eagerCount={4} />
        </section>
      )}

      {/* 4 · SHOP BY PRINT — the same towns, four ways to say them */}
      <section
        className="msc-section msc-page msc-block msc-block--navy"
        aria-labelledby="by-print"
      >
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
          <PrintStyles shots={styleShots} />
        </Reveal>
      </section>

      {/* FEATURED — towns people recognise, one per print style */}
      <section className="msc-section msc-page" aria-labelledby="now-open">
        <div className="msc-section-rule">
          <h2 id="now-open">Worth the detour</h2>
          <Link className="msc-section-note" to="/collections/all-souvenirs">
            All 2,154 →
          </Link>
        </div>
        <Suspense fallback={<SouvenirGridSkeleton count={8} />}>
          <Await resolve={featured} errorElement={<RowFallback />}>
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

      {/* 4 · THE REGION GRID — navigation and waitlist engine in one */}
      <section className="msc-section msc-page" aria-labelledby="browse-region">
        <div className="msc-section-rule">
          <h2 id="browse-region">Browse by region</h2>
          <Link className="msc-section-note" to="/towns">
            Full directory →
          </Link>
        </div>
        <RegionMap counts={counts} />
        <details className="region-list-toggle">
          <summary>List every state and province</summary>
          <RegionBrowse
            open={regionStatus.open}
            live={regionStatus.live}
            counts={counts}
          />
        </details>
      </section>

      {/* 11 · COLLECT LADDER */}
      <section className="msc-section msc-page msc-block msc-block--mustard">
        <CollectLadder />
      </section>

      {/* 7 · HOW IT WORKS — what happens after the button */}
      <section className="msc-section msc-page" aria-labelledby="how-it-works">
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
        className="msc-section msc-page msc-block msc-block--brick"
        aria-labelledby="gift"
      >
        <Reveal>
          <GiftBlock shot={styleShots.gift} />
        </Reveal>
      </section>

      {/* 12 · EDITORIAL TEASER — Postcards From Nowhere */}
      <section
        className="msc-section msc-section--band msc-page"
        aria-labelledby="postcards"
      >
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
