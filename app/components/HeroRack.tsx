import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {TownSearch} from '~/components/TownSearch';
import type {RackCard} from '~/lib/hero-rack';

/**
 * The homepage hero.
 *
 * Left: one headline, the search, a few towns to try and the four reasons to
 * buy. Right: a postcard rack, six shirts across the vintage colours, pinned
 * at slight angles on a mustard sunburst, each a link to its shirt. It fits
 * one screen, so the search is never below the fold.
 */

const TRY_TOWNS = [
  {name: 'Moose Jaw', to: '/towns/moose-jaw-sk'},
  {name: 'Roswell', to: '/towns/roswell-nm'},
  {name: 'Thunder Bay', to: '/towns/thunder-bay-on'},
  {name: 'Hilo', to: '/towns/hilo-hi'},
  {name: 'Fargo', to: '/towns/fargo-nd'},
];

const SWATCH: Record<string, string> = {
  white: '#ffffff',
  black: '#222222',
  ivory: '#efe6d2',
  bay: '#b9c7b0',
  'blue jean': '#6d83a0',
  brick: '#9b4a52',
};

export function HeroRack({
  cards,
  totalProducts,
  townCount,
  regionName,
  regionSlug,
  regionCount,
}: {
  cards: RackCard[];
  totalProducts: number;
  townCount: number;
  regionName: string | null;
  regionSlug: string | null;
  regionCount: number;
}) {
  return (
    <section className="hr" aria-labelledby="hr-title">
      <div className="hr-copy">
        <span className="hr-kicker">
          <span className="hr-kicker-dot" aria-hidden="true" />
          Genuine merch for overlooked places
        </span>
        <h1 id="hr-title" className="hr-title">
          Every town deserves a souvenir.{' '}
          <span className="hr-title-accent">Even yours.</span>
        </h1>
        <p className="hr-lede">
          Faux-vintage tees for {townCount.toLocaleString('en-US')} towns across
          Canada and the US that never got one. Printed to order on garment-dyed
          Comfort Colors heavyweight, in six colours.
        </p>

        <div className="hr-search">
          <TownSearch />
        </div>

        <div className="hr-try">
          <span className="hr-try-label">Try</span>
          {TRY_TOWNS.map((town) => (
            <Link
              key={town.to}
              to={town.to}
              className="hr-chip"
              prefetch="intent"
            >
              {town.name}
            </Link>
          ))}
        </div>

        <div className="hr-actions">
          {regionName && regionSlug ? (
            <Link
              className="hr-button"
              to={`/collections/${regionSlug}`}
              prefetch="intent"
            >
              Shop {regionName}
              {regionCount > 0 ? ` · ${regionCount} shirts` : ''} →
            </Link>
          ) : null}
          <Link
            className={regionName ? 'hr-button hr-button--ghost' : 'hr-button'}
            to="/collections/all-souvenirs"
            prefetch="intent"
          >
            Browse all {totalProducts.toLocaleString('en-US')} →
          </Link>
        </div>

        <ul className="hr-proof">
          <li>
            <strong>$36</strong>
            <span>a shirt</span>
          </li>
          <li>
            <strong>20% off</strong>
            <span>three or more</span>
          </li>
          <li>
            <strong>Free shipping</strong>
            <span>over $60, CA &amp; US</span>
          </li>
          <li>
            <strong>30 days</strong>
            <span>free size swaps</span>
          </li>
        </ul>
      </div>

      <div className="hr-rack" data-count={cards.length}>
        <svg className="hr-sun" viewBox="-50 -50 100 100" aria-hidden="true">
          {Array.from({length: 24}, (_, index) => (
            <path
              key={index}
              d="M0 0 L-3.2 -60 L3.2 -60 Z"
              transform={`rotate(${index * 15})`}
            />
          ))}
          <circle r="13" />
        </svg>

        {cards.map((card, index) => (
          <Link
            key={card.handle}
            to={`/products/${card.handle}`}
            className={`hr-card hr-card--${index + 1}`}
            prefetch="intent"
            aria-label={`${card.place} souvenir t-shirt${card.colour ? ` in ${card.colour}` : ''}`}
          >
            <span className="hr-card-photo">
              <Image
                data={card.image}
                alt=""
                aspectRatio="1/1"
                sizes="(min-width: 1100px) 230px, 40vw"
                loading={index < 3 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
              />
            </span>
            <span className="hr-card-caption">
              <span className="hr-card-place">{card.place}</span>
              {card.colour && SWATCH[card.colour] && (
                <span
                  className="hr-card-swatch"
                  style={{background: SWATCH[card.colour]}}
                  title={card.colour}
                />
              )}
            </span>
          </Link>
        ))}

        <span className="hr-stamp" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <defs>
              <path
                id="hr-stamp-ring"
                d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"
              />
            </defs>
            <circle cx="60" cy="60" r="57" className="hr-stamp-edge" />
            <circle cx="60" cy="60" r="32" className="hr-stamp-core" />
            <text>
              <textPath href="#hr-stamp-ring">
                GENUINE SOUVENIR · EST. 2026 · ★ ·
              </textPath>
            </text>
            <text x="60" y="68" className="hr-stamp-star">
              ★
            </text>
          </svg>
        </span>
      </div>
    </section>
  );
}
