import {Fragment} from 'react';
import {Link, useLoaderData} from 'react-router';
import {useNonce} from '@shopify/hydrogen';
import type {Route} from './+types/towns';
import {Reveal} from '~/components/Reveal';
import {getRegionsByCountry, REGIONS, type Region} from '~/lib/catalog';
import {loadRegionStatus} from '~/lib/shopify-collections';
import {regionNote} from '~/lib/region-copy';
import {SITE_NAME} from '~/lib/seo';

/**
 * The Towns — the directory board.
 *
 * Every region we will ever cover, on one page, set like the letterboard in a
 * motel lobby that lists the ice machine and the conference room. It is the
 * site's signature page and its densest internal-link surface: 63 links to 63
 * collection pages, one hop from anywhere, which is exactly what the 69
 * collections need to get crawled.
 *
 * Sorted A–Z rather than by launch order, because a directory board that is
 * not alphabetical is a directory board nobody can use.
 */

export const meta: Route.MetaFunction = ({data}) => [
  {title: `The Towns — A Directory of 63 Overlooked Regions | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'Every province, territory and state we cover, alphabetically, with ' +
      'nothing left out. All sixty-three are open. None of them are famous.',
  },
  ...(data
    ? [
        {tagName: 'link' as const, rel: 'canonical', href: `${data.origin}/towns`},
        {property: 'og:title', content: `The Towns | ${SITE_NAME}`},
        {
          property: 'og:description',
          content: 'A directory of 63 regions, most of which you have driven through.',
        },
      ]
    : []),
];

export async function loader({context, request}: Route.LoaderArgs) {
  const status = await loadRegionStatus(context.storefront);
  return {
    open: status.open,
    live: status.live,
    origin: new URL(request.url).origin,
  };
}

export default function TownsIndex() {
  const {open, live, origin} = useLoaderData<typeof loader>();
  const nonce = useNonce();

  const isOpen = (region: Region) => live && Boolean(open[region.slug]);
  const openCount = REGIONS.filter(isOpen).length;

  const alphabetical = [...REGIONS].sort((a, b) => a.name.localeCompare(b.name));
  const letters = new Map<string, Region[]>();
  for (const region of alphabetical) {
    const letter = region.name[0].toUpperCase();
    const bucket = letters.get(letter);
    if (bucket) bucket.push(region);
    else letters.set(letter, [region]);
  }

  return (
    <div className="msc-page towns-page" style={{paddingBottom: '88px'}}>
      <nav className="msc-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">·</span>
        <span aria-current="page">The Towns</span>
      </nav>

      <header className="towns-header">
        <span className="msc-kicker">Directory</span>
        <h1>The Towns</h1>
        <p className="province-copy">
          Sixty-three provinces and states, listed the way a motel lists its
          amenities: alphabetically, in full, without enthusiasm. Every one of
          them is open, and every one of them is a link.
        </p>
        <div className="towns-legend">
          <span>
            <i className="towns-dot towns-dot--open" aria-hidden="true" />
            {live && openCount > 0 ? `${openCount} open` : 'Open'}
          </span>
          <span>
            <i className="towns-dot" aria-hidden="true" />
            Not yet drawn — tell us the town
          </span>
        </div>
      </header>

      {/* The board itself */}
      <Reveal>
        <div className="towns-board">
          <div className="towns-board-head" aria-hidden="true">
            <span>MEDIOCRE SOUVENIR CO.</span>
            <span>DIRECTORY OF PLACES</span>
            <span>VACANCY</span>
          </div>

          <div className="towns-board-body">
            {[...letters.entries()].map(([letter, regions]) => (
              <Fragment key={letter}>
                <div className="towns-letter" aria-hidden="true">
                  {letter}
                </div>
                <ul className="towns-letter-list">
                  {regions.map((region) => (
                    <li key={region.slug}>
                      <Link
                        className="towns-row"
                        to={`/collections/${region.slug}`}
                        prefetch="intent"
                        data-open={isOpen(region) || undefined}
                      >
                        <span className="towns-row-name">{region.name}</span>
                        <span className="towns-row-leader" aria-hidden="true" />
                        <span className="towns-row-note">
                          {regionNote(region)}
                        </span>
                        <span className="towns-row-status">
                          {isOpen(region) ? 'OPEN' : 'IN DUE TIME'}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Fragment>
            ))}
          </div>

          <div className="towns-board-foot" aria-hidden="true">
            <span>MANAGEMENT NOT RESPONSIBLE FOR EXPECTATIONS</span>
            <span>EST. 2026</span>
          </div>
        </div>
      </Reveal>

      {/* Country shortcuts, for people who know which half they want */}
      <section className="towns-shortcuts" aria-label="By country">
        <Link className="towns-shortcut" to="/collections/canada">
          <span className="msc-kicker msc-kicker--navy">Canada</span>
          <strong>{getRegionsByCountry('Canada').length} provinces &amp; territories</strong>
          <span>Every one of them cold for part of the year.</span>
        </Link>
        <Link className="towns-shortcut" to="/collections/united-states">
          <span className="msc-kicker msc-kicker--navy">United States</span>
          <strong>{getRegionsByCountry('United States').length} states</strong>
          <span>Fifty. We are working through them.</span>
        </Link>
        <Link className="towns-shortcut" to="/request-a-town">
          <span className="msc-kicker msc-kicker--navy">Not listed?</span>
          <strong>Nominate your hometown</strong>
          <span>The list is the roadmap. It is the only roadmap.</span>
        </Link>
      </section>

      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'The Towns',
            url: `${origin}/towns`,
            description:
              'A directory of every province and state Mediocre Souvenir Co. covers.',
            isPartOf: {'@type': 'WebSite', name: SITE_NAME, url: origin},
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: alphabetical.length,
              itemListElement: alphabetical.map((region, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: region.name,
                url: `${origin}/collections/${region.slug}`,
              })),
            },
          }),
        }}
      />
    </div>
  );
}
