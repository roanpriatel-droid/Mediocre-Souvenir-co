import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {BadgeLogo} from '~/components/Brand';
import {TownSearch} from '~/components/TownSearch';
import type {SouvenirCard} from '~/lib/shopify-collections';
import type {Region} from '~/lib/catalog';

/**
 * The hero.
 *
 * Two problems with what was here: no product above the fold at all — the
 * first image on the page was the badge SVG — and nothing that used the one
 * advantage this store has over every other apparel shop, which is that every
 * product is a *place* and the edge already knows where the visitor is.
 *
 * So when Oxygen gives us a region, the hero addresses it directly and shows
 * four shirts from it. When it does not — VPN, bot, unknown edge — it falls
 * back to the generic headline and a rotating set from the best-stocked
 * regions. Both paths render product; neither is gated on geo.
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

  return (
    <section className="hero-v2">
      <div className="hero-v2-inner">
        <div className="hero-v2-copy">
          <BadgeLogo size={104} className="hero-v2-badge" />

          {personalised ? (
            <>
              <p className="hero-v2-eyebrow">
                {city ? `Hello, ${city}.` : 'Hello.'} You appear to be in
              </p>
              <h1 className="hero-v2-title">{region!.name}</h1>
              <p className="hero-v2-sub">
                We make <strong>{spotlightTotal}</strong> souvenirs for{' '}
                {region!.name}, a place we are certain has never been called a
                destination. Someone should commemorate it. We have.
              </p>
              <div className="hero-v2-actions">
                <Link className="msc-button" to={`/collections/${region!.slug}`}>
                  Shop {region!.name}
                </Link>
                <Link className="msc-button msc-button--ghost" to="/towns">
                  Somewhere else
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="hero-v2-eyebrow">Genuine merch for</p>
              <h1 className="hero-v2-title">Overlooked places.</h1>
              <p className="hero-v2-sub">
                Souvenir tees for towns that never got one. Find yours — it is
                almost certainly here, and almost certainly unremarkable.
              </p>
              <div className="hero-v2-actions">
                <Link className="msc-button" to="/collections/all-souvenirs">
                  Shop all souvenirs
                </Link>
                <Link className="msc-button msc-button--ghost" to="/towns">
                  The directory
                </Link>
              </div>
            </>
          )}

          <TownSearch />
        </div>

        {/* Product above the fold — four shirts, not a logo. */}
        {spotlight.length > 0 && (
          <div className="hero-v2-art" aria-label="Souvenirs from this region">
            {spotlight.slice(0, 4).map((product, i) => (
              <Link
                className="hero-v2-tile"
                key={product.id}
                to={`/products/${product.handle}`}
                prefetch="intent"
              >
                {product.featuredImage ? (
                  <Image
                    data={product.featuredImage}
                    alt={product.featuredImage.altText || product.title}
                    aspectRatio="1/1"
                    sizes="(min-width: 1000px) 220px, 45vw"
                    loading={i < 2 ? 'eager' : 'lazy'}
                  />
                ) : (
                  <div className="rack-card-art-empty">
                    <span>{product.title.slice(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <span className="hero-v2-tile-label">
                  {product.title.split('—')[0].trim()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Scale, stated plainly. The catalogue is the argument. */}
      <dl className="hero-v2-scale">
        <div>
          <dt>Souvenirs</dt>
          <dd>{totalProducts.toLocaleString('en-CA')}</dd>
        </div>
        <div>
          <dt>Regions</dt>
          <dd>{openRegions}</dd>
        </div>
        <div>
          <dt>Famous ones</dt>
          <dd>0</dd>
        </div>
        <div>
          <dt>Free shipping</dt>
          <dd>$75+</dd>
        </div>
      </dl>
    </section>
  );
}
