import {Form, Link, redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/search';
import {SouvenirGrid} from '~/components/SouvenirCard';
import {Reveal} from '~/components/Reveal';
import {regionPath, REGIONS, type Region} from '~/lib/catalog';
import {searchProducts} from '~/lib/shopify-search';
import {type SouvenirCard} from '~/lib/shopify-collections';
import {ARTICLES, type Article} from '~/lib/journal';
import {searchSitePages, type SitePage} from '~/lib/site-pages';
import {SITE_NAME} from '~/lib/seo';
import {loadTowns, townPath, type Town} from '~/lib/towns';

/**
 * Site search.
 *
 * Products come from the Storefront API — ranking, matching and stock are
 * Shopify's job and it does them across the whole catalogue. Regions, guides,
 * policies and journal articles are this site's own navigation and are matched
 * locally, because that is where they actually live.
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
        'Search every souvenir on the rack, plus regions, guides, and the ' +
        'journal.',
    },
    // Result pages are thin and endless — follow the links, index none of them.
    {name: 'robots', content: 'noindex, follow'},
  ];
};

const MAX_RESULTS = 24;

export async function loader({request, context}: Route.LoaderArgs) {
  const term = (new URL(request.url).searchParams.get('q') ?? '').trim();

  if (!term) {
    return {
      term: '',
      products: [] as SouvenirCard[],
      totalCount: 0,
      regions: [] as Region[],
      articles: [] as Article[],
      pages: [] as SitePage[],
      towns: [] as {slug: string; place: string}[],
      total: 0,
    };
  }

  const q = term.toLowerCase();

  // Town names. Typing a town is the main thing people do here, so an exact,
  // unambiguous match ("moose jaw", "Akron, OH", "akron oh") goes straight to
  // that town's page; names shared by several towns are listed instead.
  const normal = (text: string) =>
    text.toLowerCase().replace(/[.,]/g, '').replace(/\s+/g, ' ').trim();
  const wanted = normal(term);
  const allTowns = [
    ...(
      await loadTowns(context.storefront).catch(() => new Map<string, Town>())
    ).values(),
  ];
  const exact = allTowns.filter(
    (town) => normal(town.name) === wanted || normal(town.place) === wanted,
  );
  if (exact.length === 1) throw redirect(townPath(exact[0].slug));
  const towns = (
    exact.length
      ? exact
      : allTowns.filter((town) => normal(town.place).includes(wanted))
  )
    .slice(0, 12)
    .map((town) => ({slug: town.slug, place: town.place}));

  // Products come from the store. Regions, guides and the journal are this
  // site's own navigation and genuinely do live in the repo.
  const [{products, totalCount}] = await Promise.all([
    searchProducts(context.storefront, term, MAX_RESULTS),
  ]);

  const regions = REGIONS.filter(
    (region) =>
      region.name.toLowerCase().includes(q) ||
      region.abbrev.toLowerCase() === q,
  ).slice(0, 6);
  const articles = ARTICLES.filter((article) =>
    `${article.title} ${article.dek} ${article.body.join(' ')}`
      .toLowerCase()
      .includes(q),
  ).slice(0, 4);
  const pages = searchSitePages(term);

  return {
    term,
    products,
    totalCount,
    regions,
    articles,
    pages,
    towns,
    total:
      products.length +
      regions.length +
      articles.length +
      pages.length +
      towns.length,
  };
}

export default function SearchPage() {
  const {term, products, totalCount, regions, articles, pages, towns, total} =
    useLoaderData<typeof loader>();

  return (
    <div className="msc-page" style={{paddingBottom: '88px'}}>
      <div className="province-header">
        <span className="msc-kicker">The card catalog</span>
        <h1>Search</h1>
        <p className="province-copy">
          Every souvenir in the shop, every region, and everything written about
          them. Type a place — yours, ideally.
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

          {products.length > 0 && (
            <section className="search-section">
              <h2 className="search-section-head">
                Souvenirs
                <span>
                  {totalCount > products.length
                    ? `showing ${products.length} of ${totalCount}`
                    : `${products.length} on the rack`}
                </span>
              </h2>
              <SouvenirGrid products={products} eagerCount={4} />
            </section>
          )}

          {towns.length > 0 && (
            <ResultList title="Towns">
              {towns.map((town) => (
                <ResultRow
                  key={town.slug}
                  to={townPath(town.slug)}
                  title={town.place}
                  meta="Every print of this town"
                />
              ))}
            </ResultList>
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
              <Link className="msc-button" to="/request-a-town">
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
        Or start from the <Link to="/collections/all-souvenirs">full rack</Link>
        , the <Link to="/collections">collections</Link>, or{' '}
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
          to={`/request-a-town?town=${encodeURIComponent(term)}`}
        >
          Request {term}
        </Link>
        <Link
          className="msc-button msc-button--ghost"
          to="/collections/all-souvenirs"
        >
          Browse all souvenirs
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

function ResultRow({
  to,
  title,
  meta,
}: {
  to: string;
  title: string;
  meta: string;
}) {
  return (
    <Link className="search-result-row" to={to} prefetch="intent">
      <span className="search-result-title">{title}</span>
      <span className="search-result-meta">{meta}</span>
    </Link>
  );
}
