import {useState} from 'react';
import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {Analytics, useNonce} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {ShirtMockup} from '~/components/ShirtMockup';
import {ProductLadderStrip} from '~/components/CollectLadder';
import {RackGrid} from '~/components/TownRackCard';
import {useAside} from '~/components/Aside';
import {
  COLORWAY_LABELS,
  getTownByHandle,
  getTownsByProvince,
  PRICE,
  PURCHASABLE_STANDIN_QUERY,
  SIZES,
  TIER_LABELS,
  type Size,
  type TownProduct,
} from '~/lib/catalog';
import {townDescription, townH1, townJsonLd, townTitle} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data?.town) return [{title: 'Not found'}];
  return [
    {title: townTitle(data.town)},
    {name: 'description', content: townDescription(data.town)},
    {
      tagName: 'link',
      rel: 'canonical',
      href: `${data.origin}/products/${data.town.handle}`,
    },
  ];
};

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle) throw new Error('Expected product handle to be defined');

  // Catalog-first: every product page is a town. Handles outside the
  // catalog don't exist here — mock.shop's own products are not our merch.
  const town = getTownByHandle(handle);
  if (!town) {
    throw new Response(null, {status: 404});
  }

  // Purchasable stand-in variant (see the swap point in app/lib/catalog).
  const {product} = await context.storefront.query(PURCHASABLE_STANDIN_QUERY, {
    cache: context.storefront.CacheLong(),
  });
  const standInVariant = product?.variants.nodes[0] ?? null;

  return {
    town,
    standInVariant,
    neighbours: getTownsByProvince(town.provinceSlug)
      .filter((t) => t.handle !== town.handle)
      .slice(0, 4),
    origin: new URL(request.url).origin,
  };
}

export default function TownProduct() {
  const {town, standInVariant, neighbours, origin} =
    useLoaderData<typeof loader>();
  const [size, setSize] = useState<Size | null>(null);
  const nonce = useNonce();
  const {open} = useAside();

  return (
    <>
      <div className="product">
        <div className="product-art">
          <ShirtMockup town={town} />
        </div>
        <div className="product-main">
          <nav className="product-breadcrumb" aria-label="Breadcrumb">
            <Link to="/shop">Shop</Link>
            {' / '}
            <Link to={`/provinces/${town.provinceSlug}`}>
              {town.provinceState}
            </Link>
            {' / '}
            {town.city}
          </nav>
          <h1>{townH1(town)}</h1>
          <p className="msc-kicker msc-kicker--navy">
            Genuine souvenir · {town.provinceState}, {town.country}
          </p>
          <div className="product-price-row">
            <span className="product-price">${PRICE.amount.replace('.00', '')}</span>
            <span className="product-price-note">
              CAD · Comfort Colors 1717 · {COLORWAY_LABELS[town.colorway]}
            </span>
          </div>

          <div className="product-options">
            <span className="msc-label">
              Size — unisex{size ? `: ${size}` : ''}
            </span>
            <div className="product-options-grid">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="product-options-item"
                  data-selected={size === s}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <AddToCartButton
            disabled={!size || !standInVariant?.availableForSale}
            onClick={() => open('cart')}
            lines={
              standInVariant && size
                ? [
                    {
                      merchandiseId: standInVariant.id,
                      quantity: 1,
                      attributes: [
                        {key: 'Town', value: town.city},
                        {key: 'Province', value: town.provinceState},
                        {key: 'Size', value: size},
                        {
                          key: 'Colorway',
                          value: COLORWAY_LABELS[town.colorway],
                        },
                      ],
                    },
                  ]
                : []
            }
            analytics={{
              products: [
                {
                  id: town.handle,
                  title: `${town.city} T-Shirt`,
                  price: PRICE.amount,
                  quantity: 1,
                },
              ],
            }}
          >
            {size ? 'Add to your souvenirs' : 'Pick a size'}
          </AddToCartButton>

          <ProductLadderStrip />

          <CertificateOfSouvenir town={town} />

          <div className="product-details">
            <strong>The garment.</strong> Garment-dyed Comfort Colors 1717 —
            heavyweight 100% ring-spun cotton, dyed after it was sewn, so the
            fade is built in. The blank does the vintage work; three decades of
            sun are included at no charge.
            <ul>
              <li>Unisex fit, S–3XL</li>
              <li>
                {COLORWAY_LABELS[town.colorway]} colorway, faded house palette
              </li>
              <li>Printed to order in North America — allow 5–10 business days</li>
              <li>Machine wash cold. It has already been through worse.</li>
            </ul>
          </div>
        </div>
      </div>

      {neighbours.length > 0 && (
        <section className="msc-section msc-page" aria-labelledby="nearby">
          <div className="msc-section-rule">
            <h2 id="nearby">Also in {town.provinceState}</h2>
            <Link
              className="msc-section-note"
              to={`/provinces/${town.provinceSlug}`}
            >
              All {town.provinceState} towns →
            </Link>
          </div>
          <RackGrid towns={neighbours} />
        </section>
      )}

      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(townJsonLd(town, origin)),
        }}
      />

      {standInVariant && (
        <Analytics.ProductView
          data={{
            products: [
              {
                id: standInVariant.id,
                title: `${town.city} T-Shirt`,
                price: PRICE.amount,
                vendor: 'Mediocre Souvenir Co.',
                variantId: standInVariant.id,
                variantTitle: town.city,
                quantity: 1,
              },
            ],
          }}
        />
      )}
    </>
  );
}

/** The hangtag back, on the page: filled in per town, marker font and all. */
function CertificateOfSouvenir({town}: {town: TownProduct}) {
  return (
    <div className="product-certificate">
      <div className="product-certificate-title">Certificate of Souvenir</div>
      <dl>
        <div className="product-certificate-row">
          <dt>Town</dt>
          <dd>{town.city}</dd>
        </div>
        <div className="product-certificate-row">
          <dt>Population</dt>
          <dd>{town.population.toLocaleString('en-CA')} (approx.)</dd>
        </div>
        <div className="product-certificate-row">
          <dt>Known for</dt>
          <dd>{town.knownFor}</dd>
        </div>
        <div className="product-certificate-row">
          <dt>Established</dt>
          <dd>{town.estYear}</dd>
        </div>
        <div className="product-certificate-row">
          <dt>Classification</dt>
          <dd>{TIER_LABELS[town.populationTier]}</dd>
        </div>
      </dl>
      <p style={{fontSize: '13.5px', lineHeight: 1.5}}>
        This garment honors a real town where people live full lives, mostly
        without incident. Wear it with the quiet pride it deserves.
      </p>
    </div>
  );
}
