import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {SouvenirCard} from '~/lib/shopify-collections';
import type {Region} from '~/lib/catalog';
import {townNameFrom} from '~/lib/town-copy';

/**
 * The hero.
 *
 * ── Why it looks like this ────────────────────────────────────────────
 *
 * Measuring the real photography settled the design. Every product image is
 * the same mockup: a grey tee on pure white, 36.9% ink, identical bounding box
 * to the pixel. Two different products differ over **1.5% of the frame** — a
 * chest print at x 34–65%, y 28–53%. So the store has one photograph repeated
 * 2,150 times, and the only unique content is that small rectangle.
 *
 * Tiling whole product shots would therefore produce a grid of identical grey
 * t-shirts, which would make the catalogue look smaller rather than larger.
 * Instead the wall shows only the cropped prints — eighteen different town
 * graphics drawn from eighteen different regions.
 *
 * The blend is the trick that makes it feel printed rather than pasted: the
 * photography is on pure white, and `mix-blend-mode: multiply` maps white onto
 * whatever is behind it. On the cream paper the white simply disappears and
 * the artwork reads as ink on the page — no masking, no cut-outs, no new
 * assets. It is the faux-vintage effect for free.
 *
 * Above it: GREETINGS FROM and the visitor's own region, the most recognisable
 * souvenir object there is, with the off-register dual-colour text-shadow
 * BRAND.md specifies for hero display type.
 */

/** Measured print box, with padding. See the crop maths in app.css. */
export function HomeHero({
  region,
  city,
  spotlight,
  spotlightTotal,
  wall,
  totalProducts,
  openRegions,
}: {
  region: Region | null;
  city: string | null;
  spotlight: SouvenirCard[];
  spotlightTotal: number;
  /** Decoration only — trimmed to what the tiles actually render. */
  wall: {id: string; featuredImage: SouvenirCard['featuredImage']}[];
  totalProducts: number;
  openRegions: number;
}) {
  const personalised = Boolean(region && spotlight.length);
  const place = region?.name ?? 'Nowhere in particular';
  const lead = spotlight[0];

  // Long names step down so "Newfoundland and Labrador" does not swamp the
  // card and wrap to three lines.
  const scale =
    place.length > 18 ? 'long' : place.length > 12 ? 'medium' : 'short';

  const tiles = wall.length
    ? wall
    : spotlight.map((p) => ({id: p.id, featuredImage: p.featuredImage}));

  return (
    <section className="hero" aria-label="Greetings">
      {/* ── the wall: cropped town prints, multiplied onto the paper ── */}
      {tiles.length > 0 && (
        <div className="hero-wall" aria-hidden="true">
          {tiles.slice(0, 30).map((product, i) => (
            <div className="hero-wall-cell" key={product.id}>
              {product.featuredImage && (
                <Image
                  data={product.featuredImage}
                  alt=""
                  sizes="180px"
                  loading={i < 6 ? 'eager' : 'lazy'}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="hero-inner">
        <div className="hero-copy">
          <p className="hero-greeting">Greetings from</p>

          <h1 className="hero-place" data-scale={scale}>
            {place}
          </h1>

          <p className="hero-sub">
            {personalised ? (
              <>
                <strong>{spotlightTotal}</strong> souvenirs for a place that has
                never once been called a destination.
              </>
            ) : (
              <>
                <strong>{totalProducts.toLocaleString('en-CA')}</strong>{' '}
                souvenirs for towns that never got one.
              </>
            )}
          </p>

          <div className="hero-actions">
            <Link
              className="msc-button"
              to={
                region
                  ? `/collections/${region.slug}`
                  : '/collections/all-souvenirs'
              }
            >
              {region ? `Shop ${region.name}` : 'Shop all souvenirs'}
            </Link>
            <Link className="msc-button msc-button--ghost" to="/towns">
              {region ? 'Somewhere else' : 'The directory'}
            </Link>
          </div>
        </div>

        {/* The stamp: one real shirt, full colour, postmarked. */}
        {lead && (
          <div className="hero-stamp-block">
            <div className="hero-postmark" aria-hidden="true">
              <span>{city ?? 'PARTS UNKNOWN'}</span>
              <span className="hero-postmark-rule" />
              <span>EST. 2026</span>
            </div>

            <Link
              className="hero-stamp"
              to={`/products/${lead.handle}`}
              prefetch="intent"
            >
              {lead.featuredImage ? (
                <Image
                  data={lead.featuredImage}
                  alt={lead.featuredImage.altText || lead.title}
                  aspectRatio="1/1"
                  sizes="(min-width: 1000px) 320px, 55vw"
                  loading="eager"
                  decoding="sync"
                />
              ) : (
                <div className="rack-card-art-empty">
                  <span>{lead.title.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
              <span className="hero-stamp-label">
                {townNameFrom(lead.title, lead.handle)}
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* Back of the card — the numbers, as address lines. */}
      <div className="hero-back">
        <span>{totalProducts.toLocaleString('en-CA')} souvenirs</span>
        <span>{openRegions} regions</span>
        <span>0 famous ones</span>
        <span>Free shipping over $75</span>
      </div>
    </section>
  );
}
