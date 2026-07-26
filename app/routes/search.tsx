import {Form, Link, useLoaderData} from 'react-router';
import type {Route} from './+types/search';
import {RackGrid} from '~/components/TownRackCard';
import {Reveal} from '~/components/Reveal';
import {
  DISPLAY_PRICE,
  getAllTowns,
  getCollections,
  getOpenRegions,
  regionPath,
  REGIONS,
  TIER_LABELS,
  type CatalogCollection,
  type Region,
  type TownProduct,
} from '~/lib/catalog';
import {ARTICLES, type Article} from '~/lib/journal';
import {searchSitePages, type SitePage} from '~/lib/site-pages';
import {SITE_NAME} from '~/lib/seo';

/**
 * Site search over the local catalog.
 *
 * People arrive at this site looking for one specific place, so the town match
 * is the whole job and everything else is a courtesy. Searching runs
 * server-side over the in-memory catalog — no Storefront API round trip, and
 * it stays instant well past 200 SKUs. Ranking is deliberately blunt: an exact
 * town name beats a prefix, a prefix beats a substring, and a town beats
 * everything else on the page.
 */

export const meta: Route.MetaFunction = ({data}) => {
  const term = data?.term;
  return [
    {
      title: term
        ? `Search: ${term} | ${SITE_NAME}`
        : `Search — Find Your Town | ${SITE_NAME}`,
    },
    {
      name: 'description',
      content:
        'Search every overlooked town on the rack, plus regions, collections, ' +
        'guides, and the journal.',
    },
    // Result pages are thin and endless — follow the links, index none of them.
    {name: 'robots', content: 'noindex, follow'},
  ];
};

const MAX_TOWNS = 24;

export async function loader({request}: Route.LoaderArgs) {
  const term = (new URL(request.url).searchParams.get('q') ?? '').trim();
  const totalTowns = getAllTowns().length;

  if (!term) {
    return {
      term: '',
      towns: [] as TownProduct[],
      regions: [] as Region[],
      collections: [] as CatalogCollection[],
      articles: [] as Article[],
      pages: [] as SitePage[],
      total: 0,
      totalTowns,
    };
  }

  const q = term.toLowerCase();
  const towns = rankTowns(q).slice(0, MAX_TOWNS);
  const regions = REGIONS.filter(
    (region) =>
      region.name.toLowerCase().includes(q) || region.abbrev.toLowerCase() === q,
  ).slice(0, 6);
  const collections = getCollections()
    .filter((collection) =>
      `${collection.title} ${collection.navLabel} ${collection.blurb}`
        .toLowerCase()
        .includes(q),
    )
    .slice(0, 6);
  const articles = ARTICLES.filter((article) =>
    `${article.title} ${article.dek} ${article.body.join(' ')}`
      .toLowerCase()
      .includes(q),
  ).slice(0, 4);
  const pages = searchSitePages(term);

  return {
    term,
    towns,
    regions,
    collections,
    articles,
    pages,
    total:
      towns.length +
      regions.length +
      collections.length +
      articles.length +
      pages.length,
    totalTowns,
  };
}

/** Exact name, then prefix, then substring, then anything the record mentions. */
function rankTowns(q: string): TownProduct[] {
  const exact: TownProduct[] = [];
  const prefix: TownProduct[] = [];
  const contains: TownProduct[] = [];
  const loose: TownProduct[] = [];

  for (const town of getAllTowns()) {
    const city = town.city.toLowerCase();
    if (city === q) {
      exact.push(town);
    } else if (city.startsWith(q)) {
      prefix.push(town);
    } else if (city.includes(q)) {
      contains.push(town);
    } else if (
      [
        town.provinceState,
        town.provinceAbbrev,
        town.knownFor,
        town.slogan?.big ?? '',
        town.slogan?.lead ?? '',
        town.slogan?.tail ?? '',
        TIER_LABELS[town.populationTier],
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    ) {
      loose.push(town);
    }
  }

  const byName = (a: TownProduct, b: TownProduct) => a.city.localeCompare(b.city);
  return [
    ...exact,
    ...prefix.sort(byName),
    ...contains.sort(byName),
    ...loose.sort(byName),
  ];
}

export default function SearchPage() {
  const {term, towns, regions, collections, articles, pages, total, totalTowns} =
    useLoaderData<typeof loader>();

  return (
    <div className="msc-page" style={{paddingBottom: '88px'}}>
      <div className="province-header">
        <span className="msc-kicker">The card catalog</span>
        <h1>Search</h1>
        <p className="province-copy">
          {totalTowns} towns, every region, and everything written about them.
          Type a place — yours, ideally.
        </p>

        <Form
          method="get"
          action="/search"
          className="search-page-form"
          role="search"
        >
          <label className="msc-label" htmlFor="q">
            Search the shop
          </label>
          <div className="search-page-field">
            <input
              className="msc-input"
              id="q"
              name="q"
              type="search"
              defaultValue={term}
              placeholder="Trail, Hope, sage, size chart…"
              autoComplete="off"
            />
            <button className="msc-button" type="submit">
              Find it
            </button>
          </div>
        </Form>
      </div>

      {!term ? (
        <EmptyPrompt />
      ) : total === 0 ? (
        <NoResults term={term} />
      ) : (
        <>
          <div className="shop-count">
            <span className="msc-kicker msc-kicker--navy">
              {total} {total === 1 ? 'result' : 'results'} for &ldquo;{term}
              &rdquo;
            </span>
          </div>

          {towns.length > 0 && (
            <section className="search-section">
              <h2 className="search-section-head">
                Towns
                <span>
                  {towns.length} on the rack · {DISPLAY_PRICE} each
                </span>
              </h2>
              <RackGrid towns={towns} />
            </section>
          )}

          {regions.length > 0 && (
            <ResultList title="Regions">
              {regions.map((region) => (
                <ResultRow
                  key={region.slug}
                  to={regionPath(region)}
                  title={region.name}
                  meta={REGION_STATUS_NOTE[region.status]}
                />
              ))}
            </ResultList>
          )}

          {collections.length > 0 && (
            <ResultList title="Collections">
              {collections.map((collection) => (
                <ResultRow
                  key={collection.handle}
                  to={`/collections/${collection.handle}`}
                  title={collection.title}
                  meta={collection.metaDescription}
                />
              ))}
            </ResultList>
          )}

          {pages.length > 0 && (
            <ResultList title="Guides & pages">
              {pages.map((page) => (
                <ResultRow
                  key={page.path}
                  to={page.path}
                  title={page.title}
                  meta={page.summary}
                />
              ))}
            </ResultList>
          )}

          {articles.length > 0 && (
            <ResultList title="From the Journal">
              {articles.map((article) => (
                <ResultRow
                  key={article.slug}
                  to={`/journal/${article.slug}`}
                  title={article.title}
                  meta={article.dek}
                />
              ))}
            </ResultList>
          )}

          <Reveal>
            <div className="search-footer">
              <p>
                Looking for a town that is not here? That is what the waitlist
                is for — it decides what gets printed next.
              </p>
              <Link className="msc-button" to="/request-your-town">
                Request your town
              </Link>
            </div>
          </Reveal>
        </>
      )}
    </div>
  );
}

const REGION_STATUS_NOTE: Record<Region['status'], string> = {
  open: 'Open — towns on the rack now',
  next: 'Next on the route',
  someday: 'On the route, further out',
};

function EmptyPrompt() {
  const examples = [
    {label: 'Trail', to: '/search?q=Trail'},
    {label: 'Hope', to: '/search?q=Hope'},
    {label: 'Sage', to: '/search?q=sage'},
    {label: 'Size chart', to: '/search?q=size'},
    {label: 'Returns', to: '/search?q=returns'},
  ];
  return (
    <div className="search-empty-prompt">
      <span className="msc-kicker msc-kicker--navy">Try</span>
      <div className="collection-chip-row">
        {examples.map((example) => (
          <Link key={example.label} className="collection-chip" to={example.to}>
            {example.label}
          </Link>
        ))}
      </div>
      <p style={{marginTop: '18px', maxWidth: '52ch'}}>
        Or start from the <Link to="/shop">full rack</Link>, the{' '}
        <Link to="/collections">collections</Link>, or{' '}
        <Link to="/provinces">the map of where we have gotten to</Link>.
      </p>
    </div>
  );
}

function NoResults({term}: {term: string}) {
  return (
    <div className="guest-book-empty">
      <h3>Nothing for &ldquo;{term}&rdquo;. Yet.</h3>
      <p style={{maxWidth: '50ch', margin: '0 auto'}}>
        If that was a town, it is not on the rack — which is the normal
        condition of most towns, and the entire reason this company exists. Put
        it on the waitlist and it moves up the queue every time a neighbour does
        the same.
      </p>
      <div className="route-error-actions">
        <Link
          className="msc-button"
          to={`/request-your-town?town=${encodeURIComponent(term)}`}
        >
          Request {term}
        </Link>
        <Link className="msc-button msc-button--ghost" to="/shop">
          Browse all towns
        </Link>
      </div>
    </div>
  );
}

function ResultList({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="search-section">
      <h2 className="search-section-head">{title}</h2>
      <div className="search-result-list">{children}</div>
    </section>
  );
}

function ResultRow({to, title, meta}: {to: string; title: string; meta: string}) {
  return (
    <Link className="search-result-row" to={to} prefetch="intent">
      <span className="search-result-title">{title}</span>
      <span className="search-result-meta">{meta}</span>
    </Link>
  );
}
