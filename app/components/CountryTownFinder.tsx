import {useEffect, useId, useMemo, useState} from 'react';
import {Link, useFetcher, useNavigate} from 'react-router';
import {getRegionsByCountry, type Region} from '~/lib/catalog';
import type {Suggestion} from '~/lib/shopify-search';

/**
 * "Find your town" on the country pages.
 *
 * A country rack holds hundreds of shirts across dozens of regions, so
 * scrolling is not a way to find Toledo. This searches two things at once and
 * keeps them visually separate, because they answer different questions:
 *
 *  - **Towns** come from Shopify predictive search (/api/suggest) and go
 *    straight to the product.
 *  - **Regions** are filtered client-side from the region registry, so typing
 *    "penn" jumps to Pennsylvania even when no product matches yet — which is
 *    the common case for the 62 regions still on a waitlist.
 *
 * Submitting without picking anything falls through to /search, so the box
 * still works with JavaScript unavailable or a request in flight.
 */
export function CountryTownFinder({
  country,
  open,
  live,
}: {
  country: Region['country'];
  open: Record<string, boolean>;
  live: boolean;
}) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const fetcher = useFetcher<{suggestions: Suggestion[]}>();
  const navigate = useNavigate();
  const listId = useId();

  const regions = useMemo(() => getRegionsByCountry(country), [country]);
  const term = query.trim();

  // Region matching is instant and local — no round trip to jump to Ohio.
  const regionMatches = useMemo(() => {
    if (term.length < 2) return [];
    const needle = term.toLowerCase();
    return regions
      .filter(
        (region) =>
          region.name.toLowerCase().includes(needle) ||
          region.abbrev.toLowerCase() === needle,
      )
      .slice(0, 6);
  }, [regions, term]);

  useEffect(() => {
    if (term.length < 2) {
      setExpanded(false);
      return;
    }
    const timer = setTimeout(() => {
      void fetcher.load(`/api/suggest?q=${encodeURIComponent(term)}`);
      setExpanded(true);
    }, 180);
    return () => clearTimeout(timer);
    // fetcher identity changes each render; depending on it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const towns = fetcher.data?.suggestions ?? [];
  const searching = fetcher.state !== 'idle';
  const nothing =
    expanded && !searching && term.length > 1 && !towns.length && !regionMatches.length;

  return (
    <section className="country-finder" aria-label={`Find a town in ${country}`}>
      <form
        role="search"
        action="/search"
        method="get"
        onSubmit={(event) => {
          event.preventDefault();
          if (!term) return;
          void navigate(`/search?q=${encodeURIComponent(term)}`);
        }}
      >
        <label className="msc-label" htmlFor={`${listId}-input`}>
          Find your town in {country}
        </label>
        <div className="country-finder-field">
          <input
            className="msc-input"
            id={`${listId}-input`}
            name="q"
            type="search"
            value={query}
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            placeholder={
              country === 'Canada'
                ? 'Try “Trail”, “Moose Jaw”, or your province'
                : 'Try “Toledo”, “Gary”, or your state'
            }
            aria-expanded={expanded}
            aria-controls={listId}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => term.length > 1 && setExpanded(true)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setExpanded(false);
            }}
          />
          <button className="msc-button" type="submit">
            Find it
          </button>
        </div>
      </form>

      {expanded && (towns.length > 0 || regionMatches.length > 0) && (
        <div className="country-finder-results" id={listId}>
          {towns.length > 0 && (
            <div className="country-finder-group">
              <span className="msc-kicker msc-kicker--navy">Towns</span>
              <ul>
                {towns.map((town) => (
                  <li key={town.handle}>
                    <Link
                      to={`/products/${town.handle}`}
                      onClick={() => setExpanded(false)}
                    >
                      <span>{town.title}</span>
                      {town.price && <em>${town.price}</em>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {regionMatches.length > 0 && (
            <div className="country-finder-group">
              <span className="msc-kicker msc-kicker--navy">
                {country === 'Canada' ? 'Provinces & territories' : 'States'}
              </span>
              <ul>
                {regionMatches.map((region) => (
                  <li key={region.slug}>
                    <Link
                      to={`/collections/${region.slug}`}
                      onClick={() => setExpanded(false)}
                    >
                      <span>{region.name}</span>
                      <em>
                        {live && open[region.slug] ? 'Now open' : 'In due time'}
                      </em>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link
            className="country-finder-all"
            to={`/search?q=${encodeURIComponent(term)}`}
            onClick={() => setExpanded(false)}
          >
            Search everything for &ldquo;{term}&rdquo; →
          </Link>
        </div>
      )}

      {nothing && (
        <div className="country-finder-results">
          <p className="country-finder-empty">
            Nothing for &ldquo;{term}&rdquo; in {country} yet — which is the
            normal condition of most towns.{' '}
            <Link to="/request-a-town">Nominate it</Link> and it moves up the
            list.
          </p>
        </div>
      )}

      <p className="country-finder-hint">
        {regions.length}{' '}
        {country === 'Canada' ? 'provinces and territories' : 'states'} ·{' '}
        <Link to="/towns">browse them all on the directory</Link>
      </p>
    </section>
  );
}

/** A note used above the fold on country pages. */
export function countryFinderNote(country: Region['country']): string {
  return country === 'Canada'
    ? 'Thirteen provinces and territories, and every town we have reached in them.'
    : 'Fifty states, and every town we have reached in them.';
}
