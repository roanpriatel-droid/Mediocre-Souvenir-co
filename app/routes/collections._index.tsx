import {Link, useLoaderData} from 'react-router';
import {useNonce} from '@shopify/hydrogen';
import type {Route} from './+types/collections._index';
import {Reveal} from '~/components/Reveal';
import {
  COLLECTION_GROUP_ORDER,
  collectionGroupLabel,
  getAllTowns,
  getCollectionCounts,
  getCollections,
  type CollectionGroup,
} from '~/lib/catalog';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `Collections — Every Rack in the Shop | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'The whole catalog, filed the way a gift shop would file it: by design ' +
      'template, by garment colorway, and by how big the place actually is.',
  },
  ...(data
    ? [
        {
          tagName: 'link' as const,
          rel: 'canonical',
          href: `${data.origin}/collections`,
        },
      ]
    : []),
];

export async function loader({request}: Route.LoaderArgs) {
  return {
    collections: getCollections(),
    counts: getCollectionCounts(),
    totalTowns: getAllTowns().length,
    origin: new URL(request.url).origin,
  };
}

const GROUP_NOTES: Record<CollectionGroup, string> = {
  curated: 'Racks we filed by hand, for reasons we will stand behind.',
  template:
    'Three templates, applied to every town with equal seriousness. Most people pick the one that looks like their own high school.',
  colorway:
    'Five garment-dyed Comfort Colors blanks. The blank does the vintage work, so the colour is most of the decision.',
  size: 'Filed by population, because a village and a technically-a-city are not the same joke.',
};

export default function CollectionsIndex() {
  const {collections, counts, totalTowns, origin} =
    useLoaderData<typeof loader>();
  const nonce = useNonce();

  return (
    <div className="msc-page" style={{paddingBottom: '88px'}}>
      <div className="province-header">
        <span className="msc-kicker">The filing system</span>
        <h1>Collections</h1>
        <p className="province-copy">
          A real gift shop files the same shirts three ways — by how they look,
          what colour they are, and how big the place is — and so does this.
          All {totalTowns} towns appear on more than one rack. None of them
          mind.
        </p>
      </div>

      {COLLECTION_GROUP_ORDER.map((group) => {
        const inGroup = collections.filter((c) => c.group === group);
        if (!inGroup.length) return null;
        return (
          <section key={group} className="collection-group">
            <div className="collection-group-head">
              <h2>{collectionGroupLabel(group)}</h2>
              <p>{GROUP_NOTES[group]}</p>
            </div>
            <div className="collection-index-grid">
              {inGroup.map((collection, i) => (
                <Reveal key={collection.handle} delay={(i % 3) as 0 | 1 | 2}>
                  <Link
                    className="collection-card"
                    to={`/collections/${collection.handle}`}
                    prefetch="intent"
                  >
                    <span className="msc-kicker msc-kicker--navy">
                      {counts[collection.handle] ?? 0}{' '}
                      {counts[collection.handle] === 1 ? 'town' : 'towns'}
                    </span>
                    <h3>{collection.navLabel}</h3>
                    <p>{collection.blurb}</p>
                    <span className="collection-card-more">See the rack →</span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        );
      })}

      <Reveal>
        <div className="msc-form-success" style={{marginTop: '48px'}}>
          <h2>Or take the whole rack at once.</h2>
          <p style={{maxWidth: '46ch'}}>
            The shop page filters by region, size, template, and colorway
            together — every combination the racks split apart.
          </p>
          <div className="route-error-actions">
            <Link className="msc-button" to="/shop">
              Shop all {totalTowns} towns
            </Link>
            <Link className="msc-button msc-button--ghost" to="/provinces">
              Browse by region
            </Link>
          </div>
        </div>
      </Reveal>

      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Collections',
            url: `${origin}/collections`,
            isPartOf: {'@type': 'WebSite', name: SITE_NAME, url: origin},
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: collections.length,
              itemListElement: collections.map((collection, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: collection.title,
                url: `${origin}/collections/${collection.handle}`,
              })),
            },
          }),
        }}
      />
    </div>
  );
}
