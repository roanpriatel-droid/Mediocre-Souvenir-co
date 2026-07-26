import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {getTownByHandle, TIER_LABELS} from '~/lib/catalog';
import {cardPriceLabel, type SouvenirCard as CardData} from '~/lib/shopify-collections';

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
        ) : (
          /* A real product with no photograph shows as a real product with no
             photograph. Substituting the catalog's generative artwork here
             made live products look like placeholders and hid the fact that
             the store was returning them at all. */
          <div className="rack-card-art-empty">
            <span>{product.title.slice(0, 2).toUpperCase()}</span>
            <small>Photo coming</small>
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
 * Quick add.
 *
 * A tee has sizes, and guessing somebody's size is worse than one more click —
 * so quick-add only adds outright when the product genuinely has a single
 * variant. Everything else is a labelled link to the size picker, which is
 * honest about what it does rather than opening a modal that pretends.
 */
function QuickAdd({product}: {product: CardData}) {
  const {open} = useAside();
  const variants = product.variants?.nodes ?? [];
  const single = variants.length === 1 ? variants[0] : undefined;

  if (!product.availableForSale) {
    return (
      <span className="rack-card-quickadd rack-card-quickadd--out">
        Off the rack
      </span>
    );
  }

  if (single?.availableForSale) {
    return (
      <AddToCartButton
        lines={[{merchandiseId: single.id, quantity: 1}]}
        onClick={() => open('cart')}
        analytics={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: product.priceRange.minVariantPrice.amount,
              quantity: 1,
            },
          ],
        }}
      >
        Quick add
      </AddToCartButton>
    );
  }

  return (
    <Link className="rack-card-quickadd" to={`/products/${product.handle}`}>
      Pick a size →
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
        <div className="rack-cell" key={product.id}>
          <SouvenirProductCard
            product={product}
            loading={i < eagerCount ? 'eager' : 'lazy'}
          />
          <QuickAdd product={product} />
        </div>
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
