import {siteOrigin} from '~/lib/site-origin';
import {Link, useLoaderData} from 'react-router';
import {useNonce} from '@shopify/hydrogen';
import type {Route} from './+types/towns_.$slug';
import {SouvenirGrid} from '~/components/SouvenirCard';
import {PlaceBanner} from '~/components/PlaceBanner';
import {RegionLocator} from '~/components/RegionLocator';
import {PlaceBand, TownStrip} from '~/components/PlaceBand';
import {buildRegionMap, type RegionMapData} from '~/lib/region-map.server';
import {TownSet, type SetProduct} from '~/components/TownSet';
import {hydrateCards} from '~/lib/shopify-catalog';
import {loadTowns, townPath, type Town} from '~/lib/towns';
import {townCopyFor, foundedLabel, sellLine} from '~/lib/town-copy';
import {breadcrumbList} from '~/lib/schema';
import {SITE_NAME} from '~/lib/seo';

/**
 * One page per town: /towns/akron-oh.
 *
 * Every print of the town in one place, a short honest paragraph about it,
 * the nearby towns in the same state or province, and the questions people
 * ask before buying. This is the page meant to rank for "[town] shirt" and
 * "[town] souvenir"; each product page then ranks for its own print.
 */

export const meta: Route.MetaFunction = ({data}) => {
  if (!data) return [{title: 'Town not found'}];
  const {town, origin, prints} = data;
  const where = town.region ? town.region.name : 'North America';
  const title = `${town.place} T-Shirts & Souvenirs | ${SITE_NAME}`;
  const description =
    `Faux-vintage ${town.name}, ${where} souvenir t-shirts in ` +
    `${prints.length} ${prints.length === 1 ? 'print' : 'prints'}` +
    ` (${prints.join(', ')}). Garment-dyed Comfort Colors 1717, $36 USD, ` +
    `15% off two, free shipping over $60 in Canada and the US.`;
  return [
    {title},
    {name: 'description', content: description},
    {
      tagName: 'link',
      rel: 'canonical',
      href: `${origin}${townPath(town.slug)}`,
    },
    {property: 'og:title', content: `${town.place}: a souvenir, finally`},
    {property: 'og:description', content: description},
    ...(data.image ? [{property: 'og:image', content: data.image}] : []),
  ];
};

export async function loader({params, context, request}: Route.LoaderArgs) {
  const slug = (params.slug ?? '').toLowerCase();
  const towns = await loadTowns(context.storefront);
  const town = towns.get(slug);
  if (!town) throw new Response('Town not found', {status: 404});

  const [products, setProducts] = await Promise.all([
    hydrateCards(context.storefront, town.products),
    Promise.all(
      town.products.map((entry) =>
        context.storefront
          .query(TOWN_SET_QUERY, {
            variables: {handle: entry.handle},
            cache: context.storefront.CacheShort(),
          })
          .then((data) =>
            data?.product
              ? {
                  handle: data.product.handle,
                  title: data.product.title,
                  variants: data.product.variants.nodes,
                }
              : null,
          )
          .catch(() => null),
      ),
    ).then((list) => list.filter((item): item is SetProduct => Boolean(item))),
  ]);
  const prints = town.products.map(
    (entry) => entry.title.split(' — ')[1]?.trim() ?? entry.title,
  );

  // Nearby: the other towns in the same region, alphabetically around this
  // one so each page links to a different handful.
  const nearby: Pick<Town, 'slug' | 'place'>[] = [];
  if (town.region) {
    const sameRegion = [...towns.values()]
      .filter((other) => other.region?.slug === town.region?.slug)
      .sort((a, b) => a.name.localeCompare(b.name));
    const index = sameRegion.findIndex((other) => other.slug === slug);
    for (let step = 1; nearby.length < 10 && step < sameRegion.length; step++) {
      const other = sameRegion[(index + step) % sameRegion.length];
      if (other.slug !== slug)
        nearby.push({slug: other.slug, place: other.place});
    }
  }

  // The town's state or province, with this town marked and its neighbours
  // pinned. A failure only costs the picture.
  let map: RegionMapData | null = null;
  if (town.region) {
    try {
      map = buildRegionMap(
        town.region,
        [...towns.values()].filter(
          (other) => other.region?.slug === town.region?.slug,
        ),
        town.slug,
      );
    } catch (error) {
      console.error('Town map failed', error);
    }
  }

  const copy = townCopyFor(
    town.products[0]?.handle ?? slug,
    town.name,
    town.region,
  );

  return {
    origin: siteOrigin(request),
    town: {
      slug: town.slug,
      place: town.place,
      name: town.name,
      region: town.region ?? null,
    },
    prints,
    products,
    setProducts,
    nearby,
    map,
    copy,
    image: products[0]?.featuredImage?.url ?? null,
  };
}

export default function TownPage() {
  const {origin, town, prints, products, setProducts, nearby, map, copy} =
    useLoaderData<typeof loader>();
  const nonce = useNonce();
  const region = town.region;
  const countryPath =
    region?.country === 'Canada'
      ? '/collections/canada'
      : '/collections/united-states';

  const faq = [
    {
      q: `Is there a souvenir t-shirt for ${town.name}?`,
      a:
        `Yes. Mediocre Souvenir Co. makes a ${town.place} souvenir t-shirt in ` +
        `${prints.length} ${prints.length === 1 ? 'print' : 'prints'}: ` +
        `${prints.join(', ')}. Each is $36 USD on a garment-dyed Comfort ` +
        `Colors 1717 heavyweight tee.`,
    },
    {
      q: `How long does a ${town.name} shirt take to arrive?`,
      a:
        'Every shirt is printed to order in 5 to 10 business days, then ships. ' +
        'Transit is about 3 to 8 business days to the US and 6 to 12 to Canada.',
    },
    {
      q: 'Is there a discount for buying more than one?',
      a:
        'Two shirts are 15% off and three or more are 20% off, applied ' +
        'automatically at checkout. Mix any towns and prints.',
    },
    {
      q: 'What if it does not fit?',
      a: 'Returns and size exchanges are accepted within 30 days of delivery, with no restocking fee.',
    },
  ];

  const crumbs = [
    ...(region
      ? [
          {name: region.country, path: countryPath},
          {name: region.name, path: `/collections/${region.slug}`},
        ]
      : []),
    {name: town.place, path: townPath(town.slug)},
  ];

  return (
    <div className="msc-page town-page">
      <nav className="msc-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        {region && (
          <>
            <span aria-hidden="true">·</span>
            <Link to={countryPath}>{region.country}</Link>
            <span aria-hidden="true">·</span>
            <Link to={`/collections/${region.slug}`}>{region.name}</Link>
          </>
        )}
        <span aria-hidden="true">·</span>
        <span aria-current="page">{town.name}</span>
      </nav>

      {map?.focus && region ? (
        <>
          <PlaceBand
            kicker="Greetings from"
            title={town.place}
            lede={sellLine(town.name, copy)}
            stats={[
              <>
                <strong>{prints.length}</strong>{' '}
                {prints.length === 1 ? 'print' : 'prints'}
              </>,
              <>
                <strong>$36</strong> each
              </>,
              <>{foundedLabel(copy)}</>,
            ]}
            map={
              <RegionLocator
                map={map}
                regionName={region.name}
                country={region.country}
                products={products}
              />
            }
          >
            <p className="pband-deal">
              Collect 2, save 15% · Collect 3, save 20%
            </p>
          </PlaceBand>
          <TownStrip
            heading={`More of ${region.name}`}
            towns={map.pins}
            current={town.slug}
          />
        </>
      ) : (
        <PlaceBanner
          kicker="Greetings from"
          title={town.place}
          products={products}
          distinctTowns={false}
        >
          <p className="province-copy region-description">
            {sellLine(town.name, copy)} {copy.tourism}
          </p>
          <span className="msc-kicker msc-kicker--navy">
            {prints.length} {prints.length === 1 ? 'print' : 'prints'} · $36 USD
            · collect 2 and save 15% · {foundedLabel(copy)}
          </span>
        </PlaceBanner>
      )}

      <section className="msc-section" aria-labelledby="town-prints">
        <div className="msc-section-rule">
          <h2 id="town-prints">The {town.name} rack</h2>
          {region && (
            <Link
              className="msc-section-note"
              to={`/collections/${region.slug}`}
            >
              All of {region.name} →
            </Link>
          )}
        </div>
        <SouvenirGrid products={products} eagerCount={4} />
        <TownSet town={town.name} products={setProducts} />
      </section>

      {nearby.length > 0 && region && !map?.focus && (
        <section className="msc-section" aria-labelledby="town-nearby">
          <div className="msc-section-rule">
            <h2 id="town-nearby">Also in {region.name}</h2>
            <Link className="msc-section-note" to="/towns">
              Every town, A to Z →
            </Link>
          </div>
          <ul className="town-nearby">
            {nearby.map((other) => (
              <li key={other.slug}>
                <Link to={townPath(other.slug)} prefetch="intent">
                  {other.place}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {map?.focus && (
        <section className="place-about" aria-labelledby="town-about">
          <h2 id="town-about">About {town.name}</h2>
          <p>
            {sellLine(town.name, copy)} {copy.tourism}
          </p>
        </section>
      )}

      <section className="msc-section" aria-labelledby="town-faq">
        <div className="msc-section-rule">
          <h2 id="town-faq">Before you buy</h2>
          <Link className="msc-section-note" to="/faq">
            All questions →
          </Link>
        </div>
        {faq.map((item) => (
          <details key={item.q} className="msc-accordion">
            <summary>{item.q}</summary>
            <div className="msc-accordion-body">{item.a}</div>
          </details>
        ))}
      </section>

      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbList(origin, crumbs)),
        }}
      />
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${town.place} souvenir t-shirts`,
            url: `${origin}${townPath(town.slug)}`,
            about: {
              '@type': 'Place',
              name: town.place,
              ...(region
                ? {
                    containedInPlace: {
                      '@type': 'AdministrativeArea',
                      name: region.name,
                    },
                  }
                : {}),
            },
            isPartOf: {'@id': `${origin}/#website`},
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: products.length,
              itemListElement: products.map((product, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: product.title,
                url: `${origin}/products/${product.handle}`,
              })),
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faq.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: {'@type': 'Answer', text: item.a},
            })),
          }),
        }}
      />
    </div>
  );
}

const TOWN_SET_QUERY = `#graphql
  query TownSetProduct($handle: String!) {
    product(handle: $handle) {
      handle
      title
      variants(first: 60) {
        nodes {
          id
          availableForSale
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
` as const;
