import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {SouvenirCard} from '~/lib/shopify-collections';
import type {Region} from '~/lib/catalog';
import {townNameFrom} from '~/lib/town-copy';

/**
 * The hero, as a postcard.
 *
 * The previous version was a stack of eight elements — badge, eyebrow,
 * headline, paragraph, two buttons, a search field, then a 2×2 tile grid and a
 * stats table. It ran 956px on a phone, which is more than a full viewport
 * before the page even starts, and the four small tiles read as search results
 * rather than a shop window.
 *
 * This is the most recognisable souvenir object there is: GREETINGS FROM in an
 * arc over an enormous place name, a postmark, and the shirt itself. It suits
 * the brand because the brand *is* a 1978 gift shop, BRAND.md specifically
 * calls for off-register dual-colour text-shadow on hero display type, and —
 * the part that makes it work — the store already sells the "Greetings from…"
 * shirt, so the graphic and the product are the same object.
 *
 * The place name is the biggest thing on the page and it is the visitor's own
 * region, taken from the Oxygen edge. When geo is unavailable it addresses
 * "Somewhere" instead, which is on-brand rather than broken.
 */
export function HomeHero({
  region,
  city,
  spotlight,
  spotlightTotal,
  totalProducts,
  openRegions,
}: {
  region: Region | null;
  city: string | null;
  spotlight: SouvenirCard[];
  spotlightTotal: number;
  totalProducts: number;
  openRegions: number;
}) {
  const personalised = Boolean(region && spotlight.length);
  const place = region?.name ?? 'Nowhere in particular';
  const lead = spotlight[0];
  const rest = spotlight.slice(1, 4);

  // Long names ("Newfoundland and Labrador") need to step down a size or they
  // wrap into three lines and swamp the card.
  const scale =
    place.length > 18 ? 'long' : place.length > 12 ? 'medium' : 'short';

  return (
    <section className="postcard-hero" aria-label="Greetings">
      <div className="postcard-hero-card">
        {/* ── front of the card ─────────────────────────────────────── */}
        <div className="postcard-hero-front">
          <p className="postcard-hero-greeting">Greetings from</p>

          <h1 className="postcard-hero-place" data-scale={scale}>
            {place}
          </h1>

          <p className="postcard-hero-sub">
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

          <div className="postcard-hero-actions">
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

        {/* ── the stamp block: postmark + the actual shirt ───────────── */}
        <div className="postcard-hero-stamp-block">
          <div className="postcard-hero-postmark" aria-hidden="true">
            <span>{city ?? 'PARTS UNKNOWN'}</span>
            <span className="postcard-hero-postmark-rule" />
            <span>EST. 2026</span>
          </div>

          {lead ? (
            <Link
              className="postcard-hero-shirt"
              to={`/products/${lead.handle}`}
              prefetch="intent"
            >
              {lead.featuredImage ? (
                <Image
                  data={lead.featuredImage}
                  alt={lead.featuredImage.altText || lead.title}
                  aspectRatio="1/1"
                  sizes="(min-width: 1000px) 380px, 60vw"
                  loading="eager"
                  decoding="sync"
                />
              ) : (
                <div className="rack-card-art-empty">
                  <span>{lead.title.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
              <span className="postcard-hero-shirt-label">
                {townNameFrom(lead.title, lead.handle)}
              </span>
            </Link>
          ) : null}
        </div>
      </div>

      {/* ── back of the card: the address lines carry the numbers ───── */}
      <div className="postcard-hero-back">
        <div className="postcard-hero-meta">
          <span>{totalProducts.toLocaleString('en-CA')} souvenirs</span>
          <span>{openRegions} regions</span>
          <span>0 famous ones</span>
          <span>Free shipping over $75</span>
        </div>

        {rest.length > 0 && (
          <div className="postcard-hero-more">
            <span className="postcard-hero-more-label">
              {region ? `Also from ${region.name}` : 'Also on the rack'}
            </span>
            <ul>
              {rest.map((product) => (
                <li key={product.id}>
                  <Link to={`/products/${product.handle}`} prefetch="intent">
                    {townNameFrom(product.title, product.handle)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
