import {Link, redirect, useLoaderData} from 'react-router';
import {useNonce} from '@shopify/hydrogen';
import type {Route} from './+types/collections.$handle';
import {RackGrid} from '~/components/TownRackCard';
import {Reveal} from '~/components/Reveal';
import {
  COLLECTION_REDIRECTS,
  collectionGroupLabel,
  DISPLAY_PRICE,
  getCollection,
  getCollections,
  getCollectionTowns,
} from '~/lib/catalog';
import {SITE_NAME} from '~/lib/seo';

/**
 * A curated rack. Collections are derived from the local catalog
 * (app/lib/catalog/collections.ts), not from Shopify — the towns are the
 * product, so the filing system belongs with them. When the real store is
 * linked these can stay as they are; Shopify collections would only duplicate
 * them.
 */

export const meta: Route.MetaFunction = ({data}) => {
  if (!data) return [{title: `Collections | ${SITE_NAME}`}];
  const {collection, towns, origin} = data;
  return [
    {
      title: `${collection.navLabel} Souvenir T-Shirts — ${towns.length} Towns | ${SITE_NAME}`,
    },
    {
      name: 'description',
      content: `${collection.metaDescription} ${towns.length} towns on the rack, ${DISPLAY_PRICE} each.`,
    },
    {
      tagName: 'link',
      rel: 'canonical',
      href: `${origin}/collections/${collection.handle}`,
    },
  ];
};

export async function loader({params, request}: Route.LoaderArgs) {
  const handle = params.handle ?? '';

  const redirectTo = COLLECTION_REDIRECTS[handle];
  if (redirectTo) {
    throw redirect(redirectTo, 301);
  }

  const collection = getCollection(handle);
  if (!collection) {
    throw new Response('No such collection', {status: 404});
  }

  const towns = getCollectionTowns(handle);
  const siblings = getCollections().filter(
    (other) => other.group === collection.group && other.handle !== handle,
  );

  return {
    collection,
    towns,
    siblings,
    origin: new URL(request.url).origin,
  };
}

export default function CollectionPage() {
  const {collection, towns, siblings, origin} = useLoaderData<typeof loader>();
  const nonce = useNonce();

  return (
    <div className="msc-page" style={{paddingBottom: '88px'}}>
      <nav className="msc-breadcrumb" aria-label="Breadcrumb">
        <Link to="/shop">Shop</Link>
        <span aria-hidden="true">·</span>
        <Link to="/collections">Collections</Link>
        <span aria-hidden="true">·</span>
        <span aria-current="page">{collection.navLabel}</span>
      </nav>

      <div className="province-header">
        <span className="msc-kicker">{collection.kicker}</span>
        <h1>{collection.title}</h1>
        <p className="province-copy">{collection.blurb}</p>
        <span className="msc-kicker msc-kicker--navy">
          {towns.length} {towns.length === 1 ? 'town' : 'towns'} ·{' '}
          {DISPLAY_PRICE} each · collect 2 and save 15%
        </span>
      </div>

      {towns.length > 0 ? (
        <RackGrid towns={towns} />
      ) : (
        <div className="guest-book-empty">
          <h3>Nothing is filed here yet.</h3>
          <p>
            The rack is built and waiting on towns that qualify. The{' '}
            <Link to="/shop">full rack</Link> is not empty, and neither is the{' '}
            <Link to="/request-your-town">waitlist</Link>.
          </p>
        </div>
      )}

      {siblings.length > 0 && (
        <Reveal>
          <section className="collection-siblings">
            <span className="msc-kicker msc-kicker--navy">
              {collectionGroupLabel(collection.group)}
            </span>
            <div className="collection-chip-row">
              {siblings.map((sibling) => (
                <Link
                  key={sibling.handle}
                  className="collection-chip"
                  to={`/collections/${sibling.handle}`}
                >
                  {sibling.navLabel}
                </Link>
              ))}
            </div>
            <p style={{marginTop: '16px', fontSize: '15px'}}>
              Or file the whole catalog yourself on the{' '}
              <Link
                to={
                  collection.shopParams
                    ? `/shop?${collection.shopParams}`
                    : '/shop'
                }
              >
                shop page
              </Link>
              , which filters by region, size, template, and colorway at once.
            </p>
          </section>
        </Reveal>
      )}

      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: collection.title,
            description: collection.metaDescription,
            url: `${origin}/collections/${collection.handle}`,
            isPartOf: {'@type': 'WebSite', name: SITE_NAME, url: origin},
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: towns.length,
              itemListElement: towns.map((town, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: `${town.city} T-Shirt`,
                url: `${origin}/products/${town.handle}`,
              })),
            },
          }),
        }}
      />
    </div>
  );
}
