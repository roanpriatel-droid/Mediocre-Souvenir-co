import type {ReactNode} from 'react';
import {Image} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {wornImage, type SouvenirCard} from '~/lib/shopify-collections';

/**
 * The header of a region, collection or town page: the words on the left
 * and three of the page's own shirts, worn, on the right. Each page gets a
 * picture of what it sells instead of a heading over a blank band.
 */
export function PlaceBanner({
  kicker,
  title,
  children,
  products,
  distinctTowns = true,
  aside,
}: {
  kicker: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  products: SouvenirCard[];
  /** A town page shows one town in several prints, so it turns this off. */
  distinctTowns?: boolean;
  /** Shown on the right instead of the photos, e.g. the region's map. */
  aside?: ReactNode;
}) {
  // Three different towns where the page has them, so a region does not
  // open on the same town three times.
  const seen = new Set<string>();
  const shots: {
    product: SouvenirCard;
    image: NonNullable<ReturnType<typeof wornImage>>;
  }[] = [];
  for (const product of products) {
    const town = distinctTowns ? product.title.split(' — ')[0] : product.id;
    const image = wornImage(product);
    if (!image || seen.has(town)) continue;
    seen.add(town);
    shots.push({product, image});
    if (shots.length === 3) break;
  }

  return (
    <header
      className="place-banner"
      data-shots={aside ? 'aside' : shots.length}
    >
      <div className="place-banner-copy">
        <span className="msc-kicker">{kicker}</span>
        <h1>{title}</h1>
        {children}
      </div>
      {aside ? (
        <div className="place-banner-aside">{aside}</div>
      ) : (
        shots.length > 0 && (
          <div className="place-banner-shots">
            {shots.map(({product, image}, index) => (
              <Link
                key={product.id}
                to={`/products/${product.handle}`}
                className="place-banner-shot"
                prefetch="intent"
              >
                <Image
                  data={image}
                  alt={`${product.title} t-shirt, worn`}
                  aspectRatio="3/4"
                  sizes="(min-width: 1000px) 200px, 30vw"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                <span>{product.title.split(' — ')[0]}</span>
              </Link>
            ))}
          </div>
        )
      )}
    </header>
  );
}
