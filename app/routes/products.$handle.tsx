import {useEffect, useMemo, useRef, useState} from 'react';
import {Link, redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {Analytics, Image, useNonce} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {ProductLadderStrip} from '~/components/CollectLadder';
import {SouvenirGrid} from '~/components/SouvenirCard';
import {SizeTable} from '~/components/SizeGuide';
import {useAside} from '~/components/Aside';
import {
  COLORWAY_LABELS,
  DISPLAY_PRICE,
  getRegion,
  getTownByHandle,
  localeFor,
  PRICE,
  SIZES,
  TIER_LABELS,
  type TownProduct,
} from '~/lib/catalog';
import {
  formatMoney,
  loadProduct,
  sizeOptionName,
  variantForSize,
  type LiveProduct,
} from '~/lib/shopify-product';
import {
  loadCollectionProducts,
  regionForCollectionHandle,
  type SouvenirCard,
} from '~/lib/shopify-collections';
import {townDescription, townH1, townPitch, townTitle} from '~/lib/seo';

/**
 * The product page.
 *
 * Two sources, cleanly divided. The store owns commerce — variants, prices,
 * stock, photography — and the town catalog owns the story: population, est.
 * year, the one thing the place is known for, and the generative artwork that
 * carried the site before there were photographs. A product that exists in
 * both gets both. A product that exists in only one still renders.
 */

export const meta: Route.MetaFunction = ({data}) => {
  if (!data) return [{title: 'Not found'}];
  const {town, live, origin, handle} = data;
  const title = town ? townTitle(town) : `${live?.title ?? 'Souvenir'} | Mediocre Souvenir Co.`;
  const description = town
    ? townDescription(town)
    : live?.description?.slice(0, 300) ||
      'A genuine faux-vintage souvenir t-shirt for a town that never got one.';
  return [
    {title},
    {name: 'description', content: description},
    {tagName: 'link', rel: 'canonical', href: `${origin}/products/${handle}`},
    ...(live?.featuredImage
      ? [{property: 'og:image', content: live.featuredImage.url}]
      : []),
  ];
};

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle) throw new Error('Expected product handle to be defined');

  const live = await loadProduct(context.storefront, handle);
  const town = getTownByHandle(handle);

  // A product page must be a real, purchasable product. There is no stand-in
  // any more: this used to check out against a mock.shop variant, which meant
  // a page could look buyable while being attached to nothing.
  if (!live) {
    // Never a dead end. If the store cannot give us this product — whether the
    // handle is wrong or the Storefront is not answering — send the reader to
    // the most specific rack we can name rather than 404ing them.
    console.warn(`[msc:product] "${handle}" not returned by the Storefront API`);
    const fallbackRegion = town ? getRegion(town.provinceSlug) : undefined;
    throw redirect(
      fallbackRegion
        ? `/collections/${fallbackRegion.slug}`
        : '/collections/all-souvenirs',
      302,
    );
  }

  // "More from [region]" — the region collection when we can identify it,
  // otherwise the catalog's neighbours in the same province.
  const regionSlug =
    town?.provinceSlug ??
    live?.collections.find((c) => regionForCollectionHandle(c.handle))?.handle;
  const region = regionSlug ? getRegion(regionSlug) : undefined;

  let moreFromRegion: SouvenirCard[] = [];
  if (region) {
    moreFromRegion = (
      await loadCollectionProducts(context.storefront, region.slug, 5)
    ).filter((product) => product.handle !== handle);
    moreFromRegion = moreFromRegion.slice(0, 4);
  }

  return {
    handle,
    town: town ?? null,
    live,
    region: region ?? null,
    moreFromRegion,
    origin: new URL(request.url).origin,
  };
}

export default function ProductPage() {
  const {
    handle,
    town,
    live,
    region,
    moreFromRegion,
    origin,
  } = useLoaderData<typeof loader>();

  const nonce = useNonce();
  const {open} = useAside();
  const sizeGuideRef = useRef<HTMLDialogElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Live sizes when the store defines them; the catalog's S–3XL otherwise.
  const optionName = sizeOptionName(live);
  const sizes: string[] = useMemo(() => {
    if (optionName) {
      const option = live.options.find((o) => o.name === optionName);
      if (option?.values.length) return option.values;
    }
    return [...SIZES];
  }, [live, optionName]);

  const [size, setSize] = useState<string | null>(null);
  const selectedVariant = size ? variantForSize(live, optionName, size) : undefined;

  // Price follows the selection: a chosen variant's real price, else the
  // product's from-price, else the catalog's flat display price.
  const priceLabel = selectedVariant
    ? formatMoney(selectedVariant.price)
    : formatMoney(live.priceRange.minVariantPrice);
  const compareAt = selectedVariant?.compareAtPrice;
  const onSale =
    compareAt && Number(compareAt.amount) > Number(selectedVariant!.price.amount);

  const merchandiseId = selectedVariant?.id ?? null;
  const purchasable = selectedVariant
    ? selectedVariant.availableForSale
    : live.availableForSale;

  const displayTitle = town ? townH1(town) : live.title;
  const shortName = town?.city ?? live.title;

  // The variant carries size, colour and price. Town attributes are kept only
  // as order-desk context, never as the thing being bought.
  const cartLines =
    merchandiseId && size
      ? [
          {
            merchandiseId,
            quantity: 1,
            attributes: town
              ? [
                  {key: 'Town', value: town.city},
                  {key: 'Province', value: town.provinceState},
                ]
              : [],
          },
        ]
      : [];

  // Sticky bar appears once the primary add-to-cart scrolls out of view.
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

  const analyticsProduct = {
    id: handle,
    title: displayTitle,
    price: selectedVariant?.price.amount ?? PRICE.amount,
    quantity: 1,
  };

  return (
    <>
      <div className="product">
        <ProductGallery town={town} live={live} />

        <div className="product-main">
          <nav className="msc-breadcrumb" aria-label="Breadcrumb">
            <Link to="/collections/all-souvenirs">Shop</Link>
            {region && (
              <>
                <span aria-hidden="true">·</span>
                <Link
                  to={`/collections/${
                    region.country === 'Canada' ? 'canada' : 'united-states'
                  }`}
                >
                  {region.country}
                </Link>
                <span aria-hidden="true">·</span>
                <Link to={`/collections/${region.slug}`}>{region.name}</Link>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span aria-current="page">{shortName}</span>
          </nav>

          <h1>{displayTitle}</h1>
          {town && (
            <p className="msc-kicker msc-kicker--navy">
              Genuine souvenir · {town.provinceState}, {town.country}
            </p>
          )}

          <div className="product-price-row">
            <span className="product-price">{priceLabel}</span>
            {onSale && compareAt && (
              <span className="product-price-was">{formatMoney(compareAt)}</span>
            )}
            <span className="product-price-note">
              {live
                ? `${selectedVariant ? 'In your market' : 'From'} · Comfort Colors 1717`
                : 'CAD in Canada · USD in the US · Comfort Colors 1717'}
              {town ? ` · ${COLORWAY_LABELS[town.colorway]}` : ''}
            </span>
          </div>

          {town && <p className="product-pitch">{townPitch(town)}</p>}
          {!town && live?.description && (
            <p className="product-pitch">{live.description}</p>
          )}

          <div className="product-options" ref={optionsRef}>
            <div className="product-options-header">
              <span className="msc-label" style={{marginBottom: 0}}>
                {optionName ?? 'Size'} — unisex{size ? `: ${size}` : ''}
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
              {sizes.map((value) => {
                const variant = live
                  ? variantForSize(live, optionName, value)
                  : undefined;
                const soldOut = live ? !variant?.availableForSale : false;
                return (
                  <button
                    key={value}
                    type="button"
                    className="product-options-item"
                    data-selected={size === value}
                    data-soldout={soldOut || undefined}
                    aria-pressed={size === value}
                    disabled={soldOut}
                    onClick={() => setSize(value)}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            {live && size && selectedVariant?.quantityAvailable != null &&
              selectedVariant.quantityAvailable > 0 &&
              selectedVariant.quantityAvailable <= 5 && (
                <p className="product-stock-note">
                  {selectedVariant.quantityAvailable} left, which is not a
                  marketing tactic, just the number.
                </p>
              )}
          </div>

          <div ref={atcSentinelRef}>
            <AddToCartButton
              disabled={!size || !purchasable || !merchandiseId}
              onClick={() => open('cart')}
              lines={cartLines}
              analytics={{products: [analyticsProduct]}}
            >
              {!purchasable
                ? 'Temporarily off the rack'
                : size
                  ? 'Add to your souvenirs'
                  : 'Pick a size'}
            </AddToCartButton>
          </div>

          {live.rating && (
            <p className="product-rating" aria-label={`Rated ${live.rating.value} out of 5`}>
              <span className="product-rating-stars" aria-hidden="true">
                {'★'.repeat(Math.round(live.rating.value))}
                {'☆'.repeat(Math.max(0, 5 - Math.round(live.rating.value)))}
              </span>
              {live.rating.value.toFixed(1)} · {live.rating.count}{' '}
              {live.rating.count === 1 ? 'review' : 'reviews'}
            </p>
          )}

          <ProductLadderStrip />
          <TrustRow />

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
              </div>
            </details>

            {/* The hangtag back, as a detail element. */}
            <details className="msc-accordion msc-accordion--certificate">
              <summary>Certificate of Mediocre Authenticity</summary>
              <div className="msc-accordion-body">
                <CertificateOfAuthenticity town={town} title={displayTitle} />
              </div>
            </details>

            <details className="msc-accordion">
              <summary>Materials &amp; care</summary>
              <div className="msc-accordion-body">
                <p>
                  Comfort Colors 1717 — heavyweight 6.1 oz, 100% ring-spun
                  cotton, garment-dyed so the fade is structural, not printed.
                  Taped shoulders, double-needle hems.
                </p>
                <p>
                  Machine wash cold, inside out. Hang dry if you love it. Full
                  instructions in the <Link to="/care">Care Guide</Link> and{' '}
                  <Link to="/materials">Materials</Link>.
                </p>
              </div>
            </details>

            <details className="msc-accordion">
              <summary>Shipping &amp; returns</summary>
              <div className="msc-accordion-body">
                <p>
                  Printed to order in North America — allow 5–10 business days.
                  Free shipping over $75, Canada and the US. Genuine takes
                  time.
                </p>
                <p>
                  Returns: 30 days, no interrogation. Details in the{' '}
                  <Link to="/policies/refund-policy">return policy</Link>.
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* MORE FROM [REGION] */}
      {moreFromRegion.length > 0 && (
        <section className="msc-section msc-page" aria-labelledby="more-from">
          <div className="msc-section-rule">
            <h2 id="more-from">
              More from {region?.name ?? 'the rack'}
            </h2>
            <Link
              className="msc-section-note"
              to={region ? `/collections/${region.slug}` : '/collections/all-souvenirs'}
            >
              All {region?.name ?? 'souvenirs'} →
            </Link>
          </div>
          <SouvenirGrid products={moreFromRegion} eagerCount={0} />
          <p
            className="msc-kicker msc-kicker--navy"
            style={{marginTop: '18px', textAlign: 'center'}}
          >
            Two towns save 15% · Three save 20% · Automatic at checkout
          </p>
        </section>
      )}

      {/* Sticky add-to-cart — mobile-first, appears when the main one leaves */}
      <div
        className="sticky-atc"
        data-visible={!mainAtcVisible}
        aria-hidden={mainAtcVisible}
      >
        <div className="sticky-atc-info">
          <strong>{shortName}</strong>
          <span>
            {priceLabel}
            {size ? ` · ${size}` : ''}
          </span>
        </div>
        {size && purchasable && merchandiseId ? (
          <AddToCartButton
            lines={cartLines}
            onClick={() => open('cart')}
            analytics={{products: [analyticsProduct]}}
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

      {/* Size guide modal */}
      <dialog className="msc-modal" ref={sizeGuideRef} aria-label="Size guide">
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
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: displayTitle,
            description: town ? townDescription(town) : live.description,
            sku: live.handle,
            brand: {'@type': 'Brand', name: 'Mediocre Souvenir Co.'},
            ...(live.featuredImage ? {image: live.featuredImage.url} : {}),
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: live.priceRange.minVariantPrice.currencyCode,
              lowPrice: live.priceRange.minVariantPrice.amount,
              highPrice: live.priceRange.maxVariantPrice.amount,
              offerCount: live.variants.length,
              availability: live.availableForSale
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
              url: `${origin}/products/${live.handle}`,
            },
            // Only ever present when a reviews app has written real
            // aggregates. No reviews, no rating markup.
            ...(live.rating
              ? {
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: live.rating.value,
                    reviewCount: live.rating.count,
                  },
                }
              : {}),
          }),
        }}
      />

      {selectedVariant && (
        <Analytics.ProductView
          data={{
            products: [
              {
                id: live.id,
                title: displayTitle,
                price: selectedVariant.price.amount,
                vendor: live.vendor || 'Mediocre Souvenir Co.',
                variantId: selectedVariant.id,
                variantTitle: selectedVariant.title,
                quantity: 1,
              },
            ],
          }}
        />
      )}
    </>
  );
}

/** The one-line reassurance strip under the buy button. */
function TrustRow() {
  const items = [
    ['30-day returns', 'No interrogation'],
    ['Printed to order', '5–10 business days'],
    ['Free over $75', 'Canada and the US'],
  ];
  return (
    <ul className="product-trust-row">
      {items.map(([head, sub]) => (
        <li key={head}>
          <strong>{head}</strong>
          <span>{sub}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Gallery: store photography when it exists, generative mockups when it does
 * not. Both end with the certificate panel, which is the thing people
 * screenshot.
 */
function ProductGallery({
  town,
  live,
}: {
  town: TownProduct | null;
  live: LiveProduct | null;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const slides = useMemo(() => {
    const out: {key: string; label: string; node: React.ReactNode}[] = [];

    if (live?.images.length) {
      live.images.slice(0, 4).forEach((image, i) => {
        out.push({
          key: image.id ?? `img-${i}`,
          label: i === 0 ? 'Front' : `View ${i + 1}`,
          node: (
            <Image
              data={image}
              alt={image.altText || live.title}
              aspectRatio="1/1"
              sizes="(min-width: 900px) 560px, 100vw"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          ),
        });
      });
    } else {
      out.push({
        key: 'pending',
        label: 'Front',
        node: (
          <div className="product-photo-pending">
            <span>Photograph coming</span>
            <small>
              The shirt exists. The photograph of it is running late.
            </small>
          </div>
        ),
      });
    }

    if (town) {
      out.push({
        key: 'cert',
        label: 'Certificate',
        node: <CertificateOfAuthenticity town={town} title={town.city} />,
      });
    }
    return out;
  }, [live, town]);

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

  if (!slides.length) return <div className="product-gallery" />;

  return (
    <div className="product-gallery">
      <div
        className="product-gallery-track"
        ref={trackRef}
        onScroll={onScroll}
        aria-label="Product gallery"
      >
        {slides.map((slide) => (
          <div
            key={slide.key}
            className={
              slide.key === 'cert'
                ? 'product-gallery-slide product-gallery-slide--cert'
                : 'product-gallery-slide'
            }
          >
            {slide.node}
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <>
          <div
            className="product-gallery-nav"
            role="tablist"
            aria-label="Gallery views"
          >
            {slides.map((slide, i) => (
              <button
                key={slide.key}
                type="button"
                role="tab"
                aria-selected={index === i}
                data-active={index === i}
                onClick={() => goTo(i)}
              >
                {slide.label}
              </button>
            ))}
          </div>
          <div className="product-gallery-dots" aria-hidden="true">
            {slides.map((slide, i) => (
              <span key={slide.key} data-active={index === i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * The certificate. Filled in per town where we have the facts; where we do
 * not, it says so, because inventing a population would be the one genuinely
 * unforgivable thing this company could do.
 */
function CertificateOfAuthenticity({
  town,
  title,
}: {
  town: TownProduct | null;
  title: string;
}) {
  return (
    <div className="product-certificate">
      <div className="product-certificate-title">
        Certificate of Mediocre Authenticity
      </div>
      <dl>
        <div className="product-certificate-row">
          <dt>Subject</dt>
          <dd>{town?.city ?? title}</dd>
        </div>
        {town && (
          <>
            <div className="product-certificate-row">
              <dt>Population</dt>
              <dd>
                {town.population.toLocaleString(localeFor(town.country))}{' '}
                (approx.)
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
          </>
        )}
        <div className="product-certificate-row">
          <dt>Distinction</dt>
          <dd>None on record</dd>
        </div>
      </dl>
      <p style={{fontSize: '13.5px', lineHeight: 1.5}}>
        This garment honors a real place where people live full lives, mostly
        without incident. No claim is made as to its significance. Wear it with
        the quiet pride it deserves.
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
