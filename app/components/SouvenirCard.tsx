import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {
  cardPriceLabel,
  wornImage,
  type SouvenirCard as CardData,
} from '~/lib/shopify-collections';
import {regionForProduct} from '~/lib/town-copy';
import {PRINT_STYLES, styleOfHandle} from '~/lib/shopify-catalog';

/**
 * A product tile.
 *
 * Large photo, then the place, then the print and price, the way the stores
 * this one competes with lay out a rack: the shirt does the talking. Hovering
 * (or focusing) swaps the flat shot for the photo of the shirt being worn.
 *
 * The town, region and print are parsed from the product's own title and
 * handle with the same functions the product page uses.
 */
export function SouvenirProductCard({
  product,
  loading = 'lazy',
}: {
  product: CardData;
  loading?: 'eager' | 'lazy';
}) {
  const place = product.title.split(' — ')[0]?.trim() || product.title;
  const region = regionForProduct(product);
  const style = styleOfHandle(product.handle);
  const styleLabel = PRINT_STYLES.find((s) => s.value === style)?.label;
  const worn = wornImage(product);
  const onSale =
    Number(product.compareAtPriceRange?.minVariantPrice?.amount ?? 0) >
    Number(product.priceRange.minVariantPrice.amount);
  const sizes = '(min-width: 1200px) 300px, (min-width: 760px) 30vw, 46vw';

  return (
    <Link
      className="tile"
      to={`/products/${product.handle}`}
      prefetch="intent"
      data-soldout={!product.availableForSale || undefined}
    >
      <div className="tile-media">
        {product.featuredImage ? (
          <>
            <Image
              className="tile-img"
              data={product.featuredImage}
              alt={product.featuredImage.altText || product.title}
              aspectRatio="4/5"
              crop="center"
              sizes={sizes}
              loading={loading}
            />
            {worn && (
              <Image
                className="tile-img tile-img--worn"
                data={worn}
                alt=""
                aspectRatio="4/5"
                crop="center"
                sizes={sizes}
                loading="lazy"
              />
            )}
          </>
        ) : (
          <div className="tile-empty">
            <span>{place}</span>
          </div>
        )}
        {styleLabel && <span className="tile-badge">{styleLabel}</span>}
        {!product.availableForSale && (
          <span className="tile-badge tile-badge--out">Off the rack</span>
        )}
      </div>
      <div className="tile-body">
        <span className="tile-town">{place}</span>
        <span className="tile-price" data-sale={onSale || undefined}>
          {cardPriceLabel(product)}
        </span>
      </div>
      <span className="tile-meta">
        {region ? region.name : 'Souvenir tee'}
        {styleLabel ? ` · ${styleLabel} print` : ''}
      </span>
    </Link>
  );
}

export function SouvenirGrid({
  products,
  eagerCount = 4,
}: {
  products: CardData[];
  eagerCount?: number;
}) {
  return (
    <div className="tile-grid">
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
    <div className="tile-grid" aria-hidden="true">
      {Array.from({length: count}, (_, i) => (
        <div className="tile tile--skeleton" key={i}>
          <div className="tile-media skeleton-block" />
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line skeleton-line--short" />
        </div>
      ))}
    </div>
  );
}
