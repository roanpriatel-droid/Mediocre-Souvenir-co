import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {SouvenirCard} from '~/lib/shopify-collections';
import type {HeroSlide} from '~/lib/shopify-catalog';
import {townNameFrom} from '~/lib/town-copy';

/**
 * The hero.
 *
 * ── The wall ──────────────────────────────────────────────────────────
 *
 * Measuring the real photography settled the design. Every product image is
 * the same mockup: a grey tee on pure white, 36.9% ink, identical bounding box
 * to the pixel. Two different products differ over **1.5% of the frame** — a
 * chest print at x 34–65%, y 28–53%. So the store has one photograph repeated
 * 2,150 times, and the only unique content is that small rectangle.
 *
 * Tiling whole product shots would therefore produce a grid of identical grey
 * t-shirts, which would make the catalogue look smaller rather than larger.
 * Instead the wall shows only the cropped prints, and `mix-blend-mode:
 * multiply` maps their white ground onto the cream so the artwork reads as ink
 * printed on the page rather than photographs pasted over it.
 *
 * ── The rotation ──────────────────────────────────────────────────────
 *
 * The whole card — greeting, place name, stock count, buttons and shirt —
 * cycles through eleven regions: the visitor's own first where the edge can
 * place them, then ten more. One region above the fold sold one region; eleven
 * sells a continental catalogue without asking anyone to scroll.
 *
 * Two things that would otherwise make a rotating hero worse than a static one
 * are handled explicitly:
 *
 * **The CTA must not move under the cursor.** Rotation pauses on hover and on
 * focus-within, so a hand already travelling toward "Shop Ontario" still lands
 * on Ontario.
 *
 * **Layout must not shift.** Every slide occupies the same grid cell, so the
 * hero is as tall as its tallest slide from first paint and never reflows —
 * the cycling is pure opacity. "Utah" and "Prince Edward Island" swap without
 * moving a pixel of the page below.
 *
 * Only the first slide is focusable; the rest keep tabindex="-1" so the hero
 * costs two tab stops rather than twenty-two, while still being real links a
 * screen reader can reach and a mouse can click. Hidden slides are
 * `visibility: hidden`, so they cannot intercept a click meant for the one
 * that is showing.
 */

/** Seconds each slide holds, and the crossfade either side of it. */
const HOLD = 5;
const FADE = 0.55;

/** Five full rows of seven. A ragged last row reads as a mistake. */
const WALL_TILES = 35;

/**
 * A 13/7 centre-cropped CDN variant — the coarse half of the wall's crop.
 *
 * Asking for this aspect rather than a square returns full width and the
 * middle 54% of the height, which is where every chest print lives, for a
 * third of the pixels. The stylesheet then does the fine crop; see the wall
 * comment in app.css for the arithmetic that ties the two together.
 */
function tileSrc(url: string, width: number): string {
  const next = new URL(url);
  next.searchParams.set('width', String(width));
  next.searchParams.set('height', String(Math.round((width * 7) / 13)));
  next.searchParams.set('crop', 'center');
  return next.toString();
}

export function HomeHero({
  slides,
  city,
  rotation,
  wall,
  totalProducts,
  openRegions,
}: {
  slides: HeroSlide[];
  city: string | null;
  /** Stocked regions for the static breadth strip under the card. */
  rotation: {slug: string; name: string; total: number}[];
  /** Decoration only — trimmed to what the tiles actually render. */
  wall: {id: string; featuredImage: SouvenirCard['featuredImage']}[];
  totalProducts: number;
  openRegions: number;
}) {
  const cycle = slides.length * HOLD;

  return (
    <section className="hero" aria-label="Greetings">
      {/* ── the wall: cropped town prints, multiplied onto the paper ── */}
      {wall.length > 0 && (
        <div className="hero-wall" aria-hidden="true">
          {wall.slice(0, WALL_TILES).map((product, i) =>
            product.featuredImage?.url ? (
              <div className="hero-wall-cell" key={product.id}>
                {/*
                  A plain <img>, deliberately, where the rest of the site uses
                  Hydrogen's <Image>. That component writes an inline
                  style="width:100%" onto the tag, and an inline style beats
                  any stylesheet — so `.hero-wall-cell img { width: 357% }`,
                  which is the entire crop mechanism, never applied. The tiles
                  rendered at cell size with the crop window landing outside
                  the image, which is why the wall has been thirty blank
                  rectangles in production since the day it shipped.
                */}
                <img
                  src={tileSrc(product.featuredImage.url, 364)}
                  alt=""
                  loading={i < 7 ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority="low"
                />
              </div>
            ) : null,
          )}
        </div>
      )}

      <div className="hero-inner">
        {slides.length > 0 ? (
          <div
            className="hero-slides"
            role="group"
            aria-roledescription="carousel"
            aria-label="Regions we make souvenirs for"
          >
            {slides.map((slide, i) => (
              <HeroCard
                key={slide.slug}
                slide={slide}
                city={i === 0 ? city : null}
                first={i === 0}
                position={i + 1}
                of={slides.length}
                /* A negative delay on the first slide starts it past its own
                   fade-in, so the hero is at full opacity in the first painted
                   frame instead of easing up out of nothing. */
                delay={i * HOLD - FADE}
                cycle={cycle}
              />
            ))}
          </div>
        ) : (
          <FallbackCard total={totalProducts} />
        )}
      </div>

      {/*
        The terms.

        $36 did not appear anywhere on this page — the first time a visitor saw
        a price was the product page, after two clicks of investment. These are
        the four facts that pre-empt the four most common exits (too expensive,
        shipping will cost more, what if it doesn't fit, is there a discount),
        and they sit outside the rotating card because they are true of every
        region and must not move.
      */}
      <p className="hero-terms">
        <span>
          <strong>$36</strong> a shirt
        </span>
        <span>Free shipping over $60</span>
        <span>30-day returns</span>
        <span>15% off two, 20% off three</span>
      </p>

      {/*
        The breadth strip.

        Fifteen stocked regions, all real links, sitting still. It used to
        cycle; now that the card above it does, a second animation in the same
        eyeline would be noise rather than information. Static also means every
        one of the fifteen is clickable at all times, which is what the
        rotating card deliberately is not, and hands the crawler fifteen more
        paths into region collections.
      */}
      {rotation.length > 0 && (
        <p className="hero-rotation">
          <span className="hero-rotation-label">Also open</span>
          <span className="hero-rotation-track">
            {rotation.map((r) => (
              <Link
                key={r.slug}
                className="hero-rotation-item"
                to={`/collections/${r.slug}`}
              >
                {r.name}
                <em>{r.total}</em>
              </Link>
            ))}
          </span>
        </p>
      )}

      {/* Back of the card — the numbers, as address lines. */}
      <div className="hero-back">
        <span>{totalProducts.toLocaleString('en-CA')} souvenirs</span>
        <span>{openRegions} regions</span>
        <span>0 famous ones</span>
        <span>Free shipping over $60</span>
      </div>
    </section>
  );
}

function HeroCard({
  slide,
  city,
  first,
  position,
  of,
  delay,
  cycle,
}: {
  slide: HeroSlide;
  city: string | null;
  first: boolean;
  position: number;
  of: number;
  delay: number;
  cycle: number;
}) {
  const Heading = first ? 'h1' : 'p';
  // Long names step down so "Newfoundland and Labrador" does not swamp the
  // card and wrap to three lines.
  const scale =
    slide.name.length > 18 ? 'long' : slide.name.length > 12 ? 'medium' : 'short';
  // Everything after the first is decoration for keyboard users: reachable and
  // clickable, but not worth eleven tab stops before the nav.
  const tab = first ? undefined : -1;

  return (
    <div
      className="hero-slide"
      role="group"
      aria-roledescription="slide"
      aria-label={`${position} of ${of}: ${slide.name}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${cycle}s`,
      }}
    >
      <div className="hero-copy">
        <p className="hero-greeting">Greetings from</p>

        <Heading className="hero-place" data-scale={scale}>
          {slide.name}
        </Heading>

        <p className="hero-sub">
          <strong>{slide.total}</strong> souvenirs for a place that has never
          once been called a destination.
        </p>

        <div className="hero-actions">
          <Link
            className="msc-button"
            to={`/collections/${slide.slug}`}
            tabIndex={tab}
            prefetch={first ? 'intent' : 'none'}
          >
            Shop {slide.name}
          </Link>
          <Link
            className="msc-button msc-button--ghost"
            to="/towns"
            tabIndex={tab}
          >
            Somewhere else
          </Link>
        </div>
      </div>

      {/* The stamp: one real shirt, full colour, postmarked. */}
      {slide.product && (
        <div className="hero-stamp-block">
          <div className="hero-postmark" aria-hidden="true">
            <span>{city ?? slide.name}</span>
            <span className="hero-postmark-rule" />
            <span>EST. 2026</span>
          </div>

          <Link
            className="hero-stamp"
            to={`/products/${slide.product.handle}`}
            tabIndex={tab}
            prefetch={first ? 'intent' : 'none'}
          >
            {slide.product.featuredImage ? (
              <Image
                data={slide.product.featuredImage}
                alt={slide.product.featuredImage.altText || slide.product.title}
                aspectRatio="1/1"
                sizes="(min-width: 1000px) 320px, 55vw"
                loading={first ? 'eager' : 'lazy'}
                decoding={first ? 'sync' : 'async'}
              />
            ) : (
              <div className="rack-card-art-empty">
                <span>{slide.name.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
            <span className="hero-stamp-label">
              {townNameFrom(slide.product.title, slide.product.handle)}
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}

/**
 * No geo and no catalogue — still sells something.
 *
 * The old headline read "Nowhere in particular", which was charming and sold
 * nothing to the sizeable share of traffic behind a VPN, a privacy browser or
 * an edge we cannot place.
 */
function FallbackCard({total}: {total: number}) {
  return (
    <div className="hero-slides">
      <div className="hero-slide hero-slide--static">
        <div className="hero-copy">
          <p className="hero-greeting">Greetings from</p>
          <h1 className="hero-place" data-scale="long">
            Everywhere you have technically been
          </h1>
          <p className="hero-sub">
            <strong>{total.toLocaleString('en-CA')}</strong> souvenirs for towns
            that never got one.
          </p>
          <div className="hero-actions">
            <Link className="msc-button" to="/collections/all-souvenirs">
              Shop all souvenirs
            </Link>
            <Link className="msc-button msc-button--ghost" to="/towns">
              The directory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
