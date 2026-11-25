import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {TownSearch} from '~/components/TownSearch';
import {wornImage, type SouvenirCard} from '~/lib/shopify-collections';

/**
 * The homepage hero.
 *
 * One headline, one action (find your town), and real shirts on real people:
 * a collage of the worn photos of three recognisable towns. The rotating flat
 * shirt it replaces showed a small grey tee on cream, which is what made the
 * first screen look like a template.
 */
export function HeroCollage({
  products,
  totalProducts,
  townCount,
  regionName,
  regionSlug,
}: {
  products: SouvenirCard[];
  totalProducts: number;
  townCount: number;
  regionName: string | null;
  regionSlug: string | null;
}) {
  const shots = products
    .map((product) => ({product, image: wornImage(product)}))
    .filter((shot) => shot.image)
    .slice(0, 3);

  return (
    <section className="hero2" aria-labelledby="hero2-title">
      <div className="hero2-copy">
        <span className="hero2-kicker">
          Genuine merch for overlooked places · Est. 2026
        </span>
        <h1 id="hero2-title" className="hero2-title">
          Every town deserves a souvenir.
          <span className="hero2-title-accent">Even yours.</span>
        </h1>
        <p className="hero2-lede">
          Faux-vintage tees for {townCount.toLocaleString('en-US')} towns across
          Canada and the US that never got one. Printed to order on
          garment-dyed Comfort Colors heavyweight.
        </p>
        <div className="hero2-search">
          <TownSearch />
        </div>
        <div className="hero2-actions">
          {regionName && regionSlug ? (
            <Link className="hero2-link" to={`/collections/${regionSlug}`}>
              Shop {regionName} →
            </Link>
          ) : null}
          <Link className="hero2-link" to="/collections/all-souvenirs">
            Browse all {totalProducts.toLocaleString('en-US')} →
          </Link>
        </div>
        <ul className="hero2-proof">
          <li>
            <strong>$36</strong> a shirt
          </li>
          <li>
            <strong>15% off</strong> two, 20% off three
          </li>
          <li>
            <strong>Free shipping</strong> over $60 (CA &amp; US)
          </li>
        </ul>
      </div>

      <div className="hero2-collage" data-count={shots.length}>
        {shots.map(({product, image}, index) => (
          <Link
            key={product.id}
            to={`/products/${product.handle}`}
            className={`hero2-shot hero2-shot--${index + 1}`}
            prefetch="intent"
          >
            <Image
              data={image!}
              alt={`${product.title} t-shirt, worn`}
              aspectRatio="1/1"
              sizes={index === 0 ? '(min-width: 900px) 34vw, 70vw' : '(min-width: 900px) 20vw, 40vw'}
              loading="eager"
              fetchPriority={index === 0 ? 'high' : 'auto'}
            />
            <span className="hero2-tag">
              {product.title.split(' — ')[0]}
            </span>
          </Link>
        ))}
        <span className="hero2-stamp" aria-hidden="true">
          Genuine
          <br />
          Souvenir
          <br />★ ★ ★
        </span>
      </div>
    </section>
  );
}
