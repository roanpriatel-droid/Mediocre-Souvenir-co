import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {getTownByHandle, TIER_LABELS} from '~/lib/catalog';
import {cardPriceLabel, type SouvenirCard as CardData} from '~/lib/shopify-collections';
import {ShirtMockup} from '~/components/ShirtMockup';

/**
 * A Shopify product on the rack tag.
 *
 * Two sources meet here. The price, availability, and photography come from
 * the store; the sub-line comes from the local town catalog when the handle
 * matches a town we know, so a real product keeps its population tier and
 * province rather than falling back to a vendor name. When the store has no
 * photograph yet, the generative mockup stands in — the catalog was drawing
 * these long before there were photos, and a rack with art on it beats a rack
 * of grey boxes.
 */
export function SouvenirProductCard({
  product,
  loading = 'lazy',
}: {
  product: CardData;
  loading?: 'eager' | 'lazy';
}) {
  const town = getTownByHandle(product.handle);
  const onSale =
    Number(product.compareAtPriceRange?.minVariantPrice?.amount ?? 0) >
    Number(product.priceRange.minVariantPrice.amount);

  const subtitle = town
    ? `${town.provinceState} · ${TIER_LABELS[town.populationTier]}`
    : 'Genuine souvenir';

  return (
    <Link className="rack-card" to={`/products/${product.handle}`} prefetch="intent">
      <div className="rack-card-art">
        {product.featuredImage ? (
          <Image
            data={product.featuredImage}
            alt={product.featuredImage.altText || product.title}
            aspectRatio="1/1"
            sizes="(min-width: 1100px) 260px, (min-width: 700px) 33vw, 50vw"
            loading={loading}
          />
        ) : town ? (
          <ShirtMockup town={town} />
        ) : (
          <div className="rack-card-art-empty" aria-hidden="true">
            <span>MSC</span>
          </div>
        )}
      </div>
      <div className="rack-card-town">{cardTitle(product.title, town?.city)}</div>
      <div className="rack-card-meta">{subtitle}</div>
      <div className="rack-card-price">
        <span>{product.availableForSale ? 'Genuine souvenir' : 'Off the rack'}</span>
        <strong data-sale={onSale || undefined}>{cardPriceLabel(product)}</strong>
      </div>
    </Link>
  );
}

/**
 * Store titles tend to read "Trail T-Shirt — Mediocre Souvenir Co."; the rack
 * only has room for the town. Falls back to the full title when we cannot do
 * better than the store did.
 */
function cardTitle(title: string, city?: string): string {
  if (city) return city;
  return title.split(/\s+[—–|]\s+/)[0].replace(/\s+t-?shirt$/i, '').trim() || title;
}

export function SouvenirGrid({
  products,
  eagerCount = 4,
}: {
  products: CardData[];
  eagerCount?: number;
}) {
  return (
    <div className="rack-grid">
      {products.map((product, i) => (
        <SouvenirProductCard
          key={product.id}
          product={product}
          loading={i < eagerCount ? 'eager' : 'lazy'}
        />
      ))}
    </div>
  );
}

/** Placeholder rack while a collection streams in. Same geometry, no content. */
export function SouvenirGridSkeleton({count = 8}: {count?: number}) {
  return (
    <div className="rack-grid" aria-hidden="true">
      {Array.from({length: count}, (_, i) => (
        <div className="rack-card rack-card--skeleton" key={i}>
          <div className="rack-card-art skeleton-block" />
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-line--short" />
        </div>
      ))}
    </div>
  );
}
