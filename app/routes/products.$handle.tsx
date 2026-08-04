import {useEffect, useMemo, useRef, useState} from 'react';
import {Link, redirect, useLoaderData, useSearchParams} from 'react-router';
import type {Route} from './+types/products.$handle';
import {Analytics, useNonce} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {ProductGallery} from '~/components/ProductGallery';
import {SouvenirGrid} from '~/components/SouvenirCard';
import {SizeTable} from '~/components/SizeGuide';
import {NotifyMe} from '~/components/NotifyMe';
import {useAside} from '~/components/Aside';
import {
  formatMoney,
  loadProduct,
  sizeOptionName,
  type LiveProduct,
  type LiveVariant,
} from '~/lib/shopify-product';
import {
  loadCollectionProducts,
  regionForCollectionHandle,
  type SouvenirCard,
} from '~/lib/shopify-collections';
import {
  loadNewestProducts,
  productsForRegion,
  regionForProduct,
} from '~/lib/shopify-catalog';
import {
  buildDescription,
  CARE_LINES,
  foundedLabel,
  productMetaDescription,
  productMetaTitle,
  sellLine,
  SPEC_LINES,
  townCopyFor,
  townNameFrom,
  type TownCopy,
} from '~/lib/town-copy';
import type {Region} from '~/lib/catalog';
import {SITE_NAME} from '~/lib/seo';

/**
 * The product page.
 *
 * Every product in this store has a place attached, which is the thing an
 * ordinary PDP cannot do — so the page is built as a souvenir-stand artifact
 * for one town: a parks-sign plaque, a fact of dubious value, and apologetic
 * tourism copy, all derived from the product's own title.
 *
 * Data quirks absorbed from the live catalogue:
 *  - Titles read "Toledo, OH — Varsity"; the town is everything before the
 *    comma, the region is the two-letter code after it.
 *  - Prices come back in CAD even for US towns, so nothing formats currency by
 *    assumption — Intl does it from the variant's own currencyCode.
 *  - Only one collection is visible to the Storefront API, so "More From
 *    [Region]" falls through to the product-derived catalogue.
 *  - Some products have no images; the gallery renders regardless.
 *  - A colourway option may not exist; chips render only when it does.
 */

export const meta: Route.MetaFunction = ({data}) => {
  if (!data) return [{title: 'Not found'}];
  const {town, region, copy, live, origin, handle} = data;
  const title = `${productMetaTitle(town, region ?? undefined)} | ${SITE_NAME}`;
  const description = productMetaDescription(town, copy, region ?? undefined);
  return [
    {title},
    {name: 'description', content: description},
    {tagName: 'link', rel: 'canonical', href: `${origin}/products/${handle}`},
    {property: 'og:type', content: 'product'},
    {property: 'og:title', content: `${town} — a souvenir nobody asked for`},
    {property: 'og:description', content: description},
    ...(live.featuredImage
      ? [
          {property: 'og:image', content: live.featuredImage.url},
          // Preload the LCP element so the stage paints on the first pass.
          {
            tagName: 'link' as const,
            rel: 'preload',
            as: 'image',
            href: live.featuredImage.url,
          },
        ]
      : []),
  ];
};

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle) throw new Error('Expected product handle to be defined');

  const live = await loadProduct(context.storefront, handle);
  if (!live) {
    // Never a dead end — send the reader to the nearest real rack.
    console.warn(`[msc:product] "${handle}" not returned by the Storefront API`);
    throw redirect('/collections/all-souvenirs', 302);
  }

  const asCard = {
    id: live.id,
    handle: live.handle,
    title: live.title,
  } as SouvenirCard;

  const region =
    regionForProduct(asCard) ??
    live.collections
      .map((collection) => regionForCollectionHandle(collection.handle))
      .find(Boolean);

  const town = townNameFrom(live.title, live.handle);
  const copy = townCopyFor(handle, town, region);

  // Siblings: the region collection when published, the derived catalogue
  // when it is not.
  let siblings: SouvenirCard[] = [];
  if (region) {
    siblings = await loadCollectionProducts(context.storefront, region.slug, 5);
    if (!siblings.length) {
      siblings = await productsForRegion(context.storefront, region);
    }
    siblings = siblings.filter((p) => p.handle !== handle).slice(0, 4);
  }

  // Cross-region row — deliberately somewhere else.
  const elsewhere = (await loadNewestProducts(context.storefront, 12))
    .filter((product) => {
      if (product.handle === handle) return false;
      const other = regionForProduct(product);
      return !region || !other || other.slug !== region.slug;
    })
    .slice(0, 4);

  return {
    handle,
    live,
    town,
    region: region ?? null,
    copy,
    siblings,
    elsewhere,
    origin: new URL(request.url).origin,
  };
}

export default function ProductPage() {
  const {handle, live, town, region, copy, siblings, elsewhere, origin} =
    useLoaderData<typeof loader>();
  const nonce = useNonce();
  const {open} = useAside();
  const [params, setParams] = useSearchParams();
  const sizeGuideRef = useRef<HTMLDialogElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const [sizeError, setSizeError] = useState(false);

  const sizeOption = sizeOptionName(live);
  const colorOption = useMemo(
    () =>
      live.options.find((option) => /colou?r|colorway/i.test(option.name))
        ?.name ?? null,
    [live.options],
  );

  // URL-synced selection: every option lives in the query string, so a chosen
  // colourway and size are shareable and survive a reload.
  const selected = useMemo(() => {
    const out: Record<string, string> = {};
    for (const option of live.options) {
      const value = params.get(option.name.toLowerCase());
      if (value && option.values.includes(value)) out[option.name] = value;
    }
    return out;
  }, [live.options, params]);

  const setOption = (name: string, value: string) => {
    setSizeError(false);
    setParams(
      (prev) => {
        prev.set(name.toLowerCase(), value);
        return prev;
      },
      {preventScrollReset: true, replace: true},
    );
  };

  const variant = useMemo(
    () => matchVariant(live.variants, selected, live.options),
    [live.variants, selected, live.options],
  );

  const sizeChosen = !sizeOption || Boolean(selected[sizeOption]);
  const price = variant?.price ?? live.priceRange.minVariantPrice;
  const compareAt = variant?.compareAtPrice;
  const onSale = compareAt && Number(compareAt.amount) > Number(price.amount);
  const soldOut = variant ? !variant.availableForSale : !live.availableForSale;

  const atcRef = useRef<HTMLDivElement>(null);
  const [mainVisible, setMainVisible] = useState(true);
  useEffect(() => {
    const el = atcRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) =>
      setMainVisible(entry.isIntersecting),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cartLines = variant
    ? [
        {
          merchandiseId: variant.id,
          quantity: 1,
          attributes: [
            {key: 'Town', value: town},
            ...(region ? [{key: 'Region', value: region.name}] : []),
          ],
        },
      ]
    : [];

  const nudgeSize = () => {
    setSizeError(true);
    optionsRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'});
  };

  const countryHandle = region?.country === 'Canada' ? 'canada' : 'united-states';
  const activeImageId = variant ? findImageId(live, variant) : null;

  return (
    <div className="pdp">
      <div className="pdp-main">
        <ProductGallery
          images={live.images}
          title={live.title}
          activeImageId={activeImageId}
        />

        <div className="pdp-buy">
          {/* 1 · Breadcrumb: Country → Region → product */}
          <nav className="msc-breadcrumb" aria-label="Breadcrumb">
            {region ? (
              <>
                <Link to={`/collections/${countryHandle}`}>{region.country}</Link>
                <span aria-hidden="true">·</span>
                <Link to={`/collections/${region.slug}`}>{region.name}</Link>
              </>
            ) : (
              <Link to="/collections/all-souvenirs">Shop</Link>
            )}
            <span aria-hidden="true">·</span>
            <span aria-current="page">{town}</span>
          </nav>

          {/* 2 · Title */}
          <h1 className="pdp-title">{live.title}</h1>

          {/* 3 · Review stars — the slot disappears when there is nothing real */}
          {live.rating && (
            <p className="product-rating" aria-label={`Rated ${live.rating.value} of 5`}>
              <span className="product-rating-stars" aria-hidden="true">
                {'★'.repeat(Math.round(live.rating.value))}
                {'☆'.repeat(Math.max(0, 5 - Math.round(live.rating.value)))}
              </span>
              {live.rating.value.toFixed(1)} · {live.rating.count}{' '}
              {live.rating.count === 1 ? 'review' : 'reviews'}
            </p>
          )}

          {/* 4 · The town plaque */}
          <aside className="town-plaque" aria-label={`About ${town}`}>
            <div className="town-plaque-head">
              <span>{region ? region.name.toUpperCase() : 'NORTH AMERICA'}</span>
              <span>{foundedLabel(copy)}</span>
            </div>
            <p className="town-plaque-town">{town}</p>
            <p className="town-plaque-fact">
              {town} {copy.fact}.
            </p>
          </aside>

          {/* 5 · Price */}
          <div className="pdp-price-row">
            <span className="product-price">{formatMoney(price)}</span>
            {onSale && compareAt && (
              <span className="product-price-was">{formatMoney(compareAt)}</span>
            )}
            <span className="product-price-note">
              {variant ? 'USD' : 'From, USD'} · Comfort Colors 1717 · collect 2
              save 15%
            </span>
          </div>

          <p className="pdp-sell">{sellLine(town, copy)}</p>

          {/* 6 · Colourway chips — only when the product has them */}
          {colorOption && (
            <div className="pdp-options">
              <span className="msc-label">
                {colorOption}
                {selected[colorOption] ? `: ${selected[colorOption]}` : ''}
              </span>
              <div className="pdp-chips">
                {live.options
                  .find((option) => option.name === colorOption)
                  ?.values.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className="pdp-chip"
                      data-selected={selected[colorOption] === value}
                      aria-pressed={selected[colorOption] === value}
                      onClick={() => setOption(colorOption, value)}
                    >
                      {value}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* 7 · Sizes + size guide */}
          {sizeOption && (
            <div className="pdp-options" ref={optionsRef}>
              <div className="product-options-header">
                <span className="msc-label" style={{marginBottom: 0}}>
                  {sizeOption}
                  {selected[sizeOption] ? `: ${selected[sizeOption]}` : ''}
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
                {live.options
                  .find((option) => option.name === sizeOption)
                  ?.values.map((value) => {
                    const candidate = matchVariant(
                      live.variants,
                      {...selected, [sizeOption]: value},
                      live.options,
                    );
                    const out = candidate ? !candidate.availableForSale : false;
                    return (
                      <button
                        key={value}
                        type="button"
                        className="product-options-item"
                        data-selected={selected[sizeOption] === value}
                        data-soldout={out || undefined}
                        aria-pressed={selected[sizeOption] === value}
                        onClick={() => setOption(sizeOption, value)}
                      >
                        {value}
                      </button>
                    );
                  })}
              </div>
              {sizeError && (
                <p className="pdp-size-error" role="alert">
                  Choose a size. The town would want that.
                </p>
              )}
            </div>
          )}

          {/* 8 · Add to cart, sold out, express checkout */}
          <div ref={atcRef} className="pdp-atc">
            {soldOut ? (
              <>
                <p className="pdp-soldout">Sold out. The town finally has demand.</p>
                <NotifyMe
                  handle={handle}
                  town={town}
                  regionSlug={region?.slug}
                  regionName={region?.name}
                />
              </>
            ) : sizeChosen && variant ? (
              <>
                <AddToCartButton
                  lines={cartLines}
                  onClick={() => open('cart')}
                  analytics={{
                    products: [
                      {
                        id: live.id,
                        title: live.title,
                        price: price.amount,
                        quantity: 1,
                      },
                    ],
                  }}
                >
                  Add to cart
                </AddToCartButton>
                <a className="pdp-express" href="/cart">
                  Or go straight to checkout →
                </a>
              </>
            ) : (
              <button
                type="button"
                className="msc-button msc-button--buy"
                onClick={nudgeSize}
              >
                Add to cart
              </button>
            )}
          </div>

          {/* 9 · Trust row */}
          <ul className="product-trust-row">
            <li>
              <strong>30-day returns</strong>
              <span>No interrogation</span>
            </li>
            <li>
              <strong>Printed to order</strong>
              <span>In North America</span>
            </li>
            <li>
              <strong>Certificate included</strong>
              <span>
                <Link to="/certificate">Of Mediocre Authenticity</Link>
              </span>
            </li>
          </ul>

          {/* 10 · Accordions */}
          <div className="product-accordions">
            <details className="msc-accordion" open>
              <summary>The Shirt</summary>
              <div className="msc-accordion-body">
                <dl className="pdp-spec">
                  {SPEC_LINES.map(([term, detail]) => (
                    <div key={term}>
                      <dt>{term}</dt>
                      <dd>{detail}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </details>

            <details className="msc-accordion">
              <summary>The Town</summary>
              <div className="msc-accordion-body">
                <p>{copy.tourism}</p>
                {region && (
                  <p>
                    <Link to={`/collections/${region.slug}`}>
                      Everything we make for {region.name} →
                    </Link>
                  </p>
                )}
              </div>
            </details>

            <details className="msc-accordion">
              <summary>Sizing</summary>
              <div className="msc-accordion-body">
                <p>
                  Unisex, true to size. Your usual size gives the fit the shirt
                  intends; one size up gives the thrift-store drape. The cotton
                  relaxes about half a size in the first month.
                </p>
                <p>
                  <Link to="/size-guide">Full measurements →</Link>
                </p>
              </div>
            </details>

            <details className="msc-accordion">
              <summary>Shipping &amp; care</summary>
              <div className="msc-accordion-body">
                <p>
                  Printed to order — allow 5–10 business days before it moves,
                  then transit. Free over $60. Thirty-day returns.
                </p>
                <ul className="policy-list">
                  {CARE_LINES.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p>
                  <Link to="/shipping-returns">Shipping &amp; returns →</Link>
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* ── Below the fold ────────────────────────────────────────────── */}

      <section className="msc-section msc-page" aria-labelledby="more-region">
        <div className="msc-section-rule">
          <h2 id="more-region">More from {region?.name ?? 'the rack'}</h2>
          {region && (
            <Link className="msc-section-note" to={`/collections/${region.slug}`}>
              All of {region.name} →
            </Link>
          )}
        </div>
        {siblings.length > 0 ? (
          <SouvenirGrid products={siblings} eagerCount={0} />
        ) : (
          <div className="guest-book-empty">
            <h3>This is currently the town&rsquo;s entire cultural output.</h3>
            <p>
              One shirt, no runner-up. Try somewhere adjacent —{' '}
              <Link to={`/collections/${countryHandle}`}>
                the rest of {region?.country ?? 'the country'}
              </Link>{' '}
              or <Link to="/towns">the full directory</Link>.
            </p>
          </div>
        )}
      </section>

      {elsewhere.length > 0 && (
        <section className="msc-section msc-page" aria-labelledby="elsewhere">
          <div className="msc-section-rule">
            <h2 id="elsewhere">Other towns you won&rsquo;t visit</h2>
            <Link className="msc-section-note" to="/collections/all-souvenirs">
              Everything →
            </Link>
          </div>
          <SouvenirGrid products={elsewhere} eagerCount={0} />
        </section>
      )}

      <section className="msc-section msc-page">
        <div className="request-banner">
          <div>
            <span className="msc-kicker">The waitlist is the roadmap</span>
            <h2>Your hometown worse than this?</h2>
            <p>
              Tell us. We do not choose regions by market size, we choose them
              by who asked, and the bar is lower than you think.
            </p>
          </div>
          <Link className="msc-button msc-button--navy" to="/request-a-town">
            Request a town
          </Link>
        </div>
      </section>

      <section className="msc-section msc-page" aria-labelledby="reviews">
        <div className="msc-section-rule">
          <h2 id="reviews">What people said</h2>
        </div>
        {live.rating ? (
          <p className="pdp-reviews-summary">
            {live.rating.value.toFixed(1)} out of 5, from {live.rating.count}{' '}
            {live.rating.count === 1 ? 'review' : 'reviews'}.
          </p>
        ) : (
          <div className="guest-book-empty">
            <h3>The guest book is open.</h3>
            <p>
              Nobody has reviewed {town} yet. We will print what they say when
              they do, including the unenthusiastic ones — especially those.
            </p>
          </div>
        )}
      </section>

      {/* Final CTA — the back of a postcard */}
      <section className="pdp-postcard-band">
        <div className="pdp-postcard">
          <div className="pdp-postcard-left">
            <span className="msc-kicker">Greetings from</span>
            <p className="pdp-postcard-town">{town}</p>
            <span className="msc-marker">wish you were here, more or less.</span>
          </div>
          <div className="pdp-postcard-right">
            <div className="msc-stamp">
              Genuine
              <br />
              Souvenir
              <br />★ ★ ★
            </div>
            <Link className="msc-button" to="/collections/all-souvenirs">
              Find another town
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile sticky bar — thumb-reachable, appears when the buy box leaves */}
      <div
        className="sticky-atc"
        data-visible={!mainVisible}
        aria-hidden={mainVisible}
      >
        <div className="sticky-atc-info">
          <strong>{town}</strong>
          <span>
            {formatMoney(price)}
            {sizeOption && selected[sizeOption]
              ? ` · ${selected[sizeOption]}`
              : ''}
          </span>
        </div>
        {!soldOut && sizeChosen && variant ? (
          <AddToCartButton lines={cartLines} onClick={() => open('cart')}>
            Add to cart
          </AddToCartButton>
        ) : (
          <button
            type="button"
            className="msc-button msc-button--buy"
            disabled={soldOut}
            onClick={nudgeSize}
          >
            {soldOut ? 'Sold out' : 'Choose a size'}
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
          vintage-find drape. <Link to="/size-guide">Full guide</Link>.
        </p>
      </dialog>

      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            productJsonLd({live, town, region, copy, origin}),
          ),
        }}
      />

      {variant && (
        <Analytics.ProductView
          data={{
            products: [
              {
                id: live.id,
                title: live.title,
                price: price.amount,
                vendor: live.vendor || SITE_NAME,
                variantId: variant.id,
                variantTitle: variant.title,
                quantity: 1,
              },
            ],
          }}
        />
      )}
    </div>
  );
}

/** The variant whose selectedOptions match everything currently chosen. */
function matchVariant(
  variants: LiveVariant[],
  selected: Record<string, string>,
  options: {name: string; values: string[]}[],
): LiveVariant | undefined {
  if (!options.length) return variants[0];
  if (options.some((option) => !selected[option.name])) return undefined;
  return variants.find((candidate) =>
    candidate.selectedOptions.every(
      (option) => selected[option.name] === option.value,
    ),
  );
}

/** Match a variant's image back to an id in the gallery list. */
function findImageId(live: LiveProduct, variant: LiveVariant): string | null {
  if (!variant.image?.url) return null;
  const found = live.images.find((image) => image.url === variant.image?.url);
  return found?.id ?? null;
}

/** Product structured data with one offer per real variant. */
function productJsonLd({
  live,
  town,
  region,
  copy,
  origin,
}: {
  live: LiveProduct;
  town: string;
  region: Region | null;
  copy: TownCopy;
  origin: string;
}) {
  const url = `${origin}/products/${live.handle}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: live.title,
    description: buildDescription(town, copy, region ?? undefined),
    sku: live.handle,
    url,
    brand: {'@type': 'Brand', name: SITE_NAME},
    material: '100% ring-spun cotton, garment-dyed',
    ...(live.images.length ? {image: live.images.map((image) => image.url)} : {}),
    ...(region
      ? {
          additionalProperty: [
            {'@type': 'PropertyValue', name: 'Town', value: town},
            {'@type': 'PropertyValue', name: 'Region', value: region.name},
            {'@type': 'PropertyValue', name: 'Country', value: region.country},
          ],
        }
      : {}),
    // One offer per variant — every size and colourway priced individually.
    offers: live.variants.map((variant) => ({
      '@type': 'Offer',
      sku: variant.id.split('/').pop(),
      name: variant.title,
      price: variant.price.amount,
      priceCurrency: variant.price.currencyCode,
      availability: variant.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url,
      itemCondition: 'https://schema.org/NewCondition',
    })),
    // Present only when a reviews app has written real aggregates.
    ...(live.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: live.rating.value,
            reviewCount: live.rating.count,
          },
        }
      : {}),
  };
}
