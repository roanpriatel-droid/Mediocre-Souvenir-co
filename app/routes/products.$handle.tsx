import {useEffect, useRef, useState} from 'react';
import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {Analytics, useNonce} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {ShirtMockup} from '~/components/ShirtMockup';
import {ProductLadderStrip} from '~/components/CollectLadder';
import {RackGrid} from '~/components/TownRackCard';
import {SizeTable} from '~/components/SizeGuide';
import {useAside} from '~/components/Aside';
import {
  COLORWAY_LABELS,
  DISPLAY_PRICE,
  getRegion,
  getTownByHandle,
  getTownsByRegion,
  localeFor,
  PRICE,
  PURCHASABLE_STANDIN_QUERY,
  regionPath,
  SIZES,
  TIER_LABELS,
  type Size,
  type TownProduct,
} from '~/lib/catalog';
import {
  townDescription,
  townH1,
  townJsonLd,
  townPitch,
  townTitle,
} from '~/lib/seo';

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
    neighbours: getTownsByRegion(town.provinceSlug)
      .filter((t) => t.handle !== town.handle)
      .slice(0, 4),
    origin: new URL(request.url).origin,
  };
}

export default function TownProductPage() {
  const {town, standInVariant, neighbours, origin} =
    useLoaderData<typeof loader>();
  const [size, setSize] = useState<Size | null>(null);
  const nonce = useNonce();
  const {open} = useAside();
  const sizeGuideRef = useRef<HTMLDialogElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // sticky bar shows once the primary add-to-cart scrolls out of view
  const atcSentinelRef = useRef<HTMLDivElement>(null);
  const [mainAtcVisible, setMainAtcVisible] = useState(true);
  useEffect(() => {
    const el = atcSentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) =>
      setMainAtcVisible(entry.isIntersecting),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cartLines =
    standInVariant && size
      ? [
          {
            merchandiseId: standInVariant.id,
            quantity: 1,
            attributes: [
              {key: 'Town', value: town.city},
              {key: 'Province', value: town.provinceState},
              {key: 'Size', value: size},
              {key: 'Colorway', value: COLORWAY_LABELS[town.colorway]},
            ],
          },
        ]
      : [];

  const purchasable = Boolean(standInVariant?.availableForSale);

  return (
    <>
      <div className="product">
        <ProductGallery town={town} />
        <div className="product-main">
          <nav className="product-breadcrumb" aria-label="Breadcrumb">
            <Link to="/shop">Shop</Link>
            {' / '}
            <Link to={regionUrl(town)}>{town.provinceState}</Link>
            {' / '}
            {town.city}
          </nav>
          <h1>{townH1(town)}</h1>
          <p className="msc-kicker msc-kicker--navy">
            Genuine souvenir · {town.provinceState}, {town.country}
          </p>
          <div className="product-price-row">
            <span className="product-price">{DISPLAY_PRICE}</span>
            <span className="product-price-note">
              CAD in Canada · USD in the US · Comfort Colors 1717 ·{' '}
              {COLORWAY_LABELS[town.colorway]}
            </span>
          </div>

          <p className="product-pitch">{townPitch(town)}</p>

          <div className="product-options" ref={optionsRef}>
            <div className="product-options-header">
              <span className="msc-label" style={{marginBottom: 0}}>
                Size — unisex{size ? `: ${size}` : ''}
              </span>
              <button
                type="button"
                className="product-size-guide-link"
                onClick={() => sizeGuideRef.current?.showModal()}
              >
                Size guide
              </button>
            </div>
            <div className="product-options-grid">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="product-options-item"
                  data-selected={size === s}
                  aria-pressed={size === s}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div ref={atcSentinelRef}>
            <AddToCartButton
              disabled={!size || !purchasable}
              onClick={() => open('cart')}
              lines={cartLines}
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
              {!purchasable
                ? 'Temporarily off the rack'
                : size
                  ? 'Add to your souvenirs'
                  : 'Pick a size'}
            </AddToCartButton>
          </div>

          <ProductLadderStrip />

          <div className="product-accordions">
            <details className="msc-accordion" open>
              <summary>Details &amp; fit</summary>
              <div className="msc-accordion-body">
                <p>
                  Unisex classic-relaxed fit, true to size — your usual size
                  gives the fit the shirt intends; one size up gives the
                  vintage-find drape. Shoulders sit at the shoulder, sleeves
                  hit mid-bicep.
                </p>
                <p>
                  Certificate of Souvenir printed per town: population{' '}
                  {town.population.toLocaleString(localeFor(town.country))}{' '}
                  (approx.), established {town.estYear}, classification{' '}
                  {TIER_LABELS[town.populationTier]}. Known for:{' '}
                  {town.knownFor.toLowerCase()}.
                </p>
              </div>
            </details>
            <details className="msc-accordion">
              <summary>Materials &amp; care</summary>
              <div className="msc-accordion-body">
                <p>
                  Comfort Colors 1717 — heavyweight 6.1 oz, 100% ring-spun
                  cotton, garment-dyed so the fade is structural, not
                  printed. Taped shoulders, double-needle hems.
                </p>
                <p>
                  Machine wash cold, inside out. Hang dry if you love it. It
                  has already been through the dye tank; it has seen worse.
                  Full instructions in the <Link to="/care">Care Guide</Link>{' '}
                  and <Link to="/materials">Materials</Link>.
                </p>
              </div>
            </details>
            <details className="msc-accordion">
              <summary>Shipping &amp; returns</summary>
              <div className="msc-accordion-body">
                <p>
                  Printed to order in North America — allow 5–10 business
                  days. Free shipping over $75, Canada and the US. Genuine
                  takes time.
                </p>
                <p>
                  Returns: 30 days, no interrogation. Exchanges for size work
                  the same way.
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>

      {neighbours.length > 0 && (
        <section className="msc-section msc-page" aria-labelledby="nearby">
          <div className="msc-section-rule">
            <h2 id="nearby">Complete the collection</h2>
            <Link className="msc-section-note" to={regionUrl(town)}>
              All {town.provinceState} towns →
            </Link>
          </div>
          <RackGrid towns={neighbours} />
          <p
            className="msc-kicker msc-kicker--navy"
            style={{marginTop: '18px', textAlign: 'center'}}
          >
            Two towns save 15% · Three save 20% · Automatic at checkout
          </p>
        </section>
      )}

      {/* sticky add-to-cart — appears when the primary button scrolls away */}
      <div
        className="sticky-atc"
        data-visible={!mainAtcVisible}
        aria-hidden={mainAtcVisible}
      >
        <div className="sticky-atc-info">
          <strong>{town.city} T-Shirt</strong>
          <span>
            {DISPLAY_PRICE}
            {size ? ` · ${size}` : ''}
          </span>
        </div>
        {size && purchasable ? (
          <AddToCartButton
            lines={cartLines}
            onClick={() => open('cart')}
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
            Add to cart
          </AddToCartButton>
        ) : (
          <button
            type="button"
            className="msc-button"
            disabled={!purchasable}
            onClick={() =>
              optionsRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              })
            }
          >
            {purchasable ? 'Pick a size' : 'Off the rack'}
          </button>
        )}
      </div>

      {/* size guide modal */}
      <dialog
        className="msc-modal"
        ref={sizeGuideRef}
        aria-label="Size guide"
      >
        <div className="msc-modal-header">
          <h3>Size &amp; fit</h3>
          <button
            type="button"
            className="msc-modal-close"
            onClick={() => sizeGuideRef.current?.close()}
            aria-label="Close size guide"
          >
            &times;
          </button>
        </div>
        <SizeTable />
        <p style={{fontSize: '14px', marginTop: '12px'}}>
          Between sizes? Usual size for the honest fit, one up for the
          vintage-find drape. Full guide at{' '}
          <Link to="/size-guide">/size-guide</Link>.
        </p>
      </dialog>

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

/** Gallery: front / print detail / certificate — swipe on mobile, thumbs on desktop. */
function ProductGallery({town}: {town: TownProduct}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const labels = ['Front', 'Print detail', 'Certificate'];

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({left: i * track.clientWidth, behavior: 'smooth'});
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <div className="product-gallery">
      <div
        className="product-gallery-track"
        ref={trackRef}
        onScroll={onScroll}
        aria-label={`${town.city} T-Shirt gallery`}
      >
        <div className="product-gallery-slide">
          <ShirtMockup town={town} />
        </div>
        <div className="product-gallery-slide">
          <ShirtMockup town={town} view="detail" />
        </div>
        <div className="product-gallery-slide product-gallery-slide--cert">
          <CertificateOfSouvenir town={town} />
        </div>
      </div>
      <div className="product-gallery-nav" role="tablist" aria-label="Gallery views">
        {labels.map((label, i) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={index === i}
            data-active={index === i}
            onClick={() => goTo(i)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="product-gallery-dots" aria-hidden="true">
        {labels.map((label, i) => (
          <span key={label} data-active={index === i} />
        ))}
      </div>
    </div>
  );
}

/** Region landing URL for a town — /provinces/... or /states/... by kind. */
function regionUrl(town: TownProduct): string {
  const region = getRegion(town.provinceSlug);
  return region ? regionPath(region) : '/provinces';
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
          <dd>
            {town.population.toLocaleString(localeFor(town.country))} (approx.)
          </dd>
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
      <div className="msc-stamp" style={{alignSelf: 'flex-end'}}>
        Genuine
        <br />
        Souvenir
        <br />★ ★ ★
      </div>
    </div>
  );
}
