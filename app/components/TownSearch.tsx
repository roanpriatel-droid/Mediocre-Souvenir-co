import {useEffect, useRef, useState} from 'react';
import {Link, useNavigate} from 'react-router';
import {searchTowns, TIER_LABELS, type TownProduct} from '~/lib/catalog';

/**
 * "Find your town" — the single most important element on the page.
 * People arrive looking for a specific place; this is how they get there.
 * Client-side over the catalog: instant, and it scales fine past 200 SKUs.
 */
export function TownSearch({autoFocus = false}: {autoFocus?: boolean}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TownProduct[]>([]);
  const [highlighted, setHighlighted] = useState(-1);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const runSearch = (value: string) => {
    setQuery(value);
    const found = searchTowns(value);
    setResults(found);
    setHighlighted(found.length ? 0 : -1);
    setOpen(value.trim().length > 0);
  };

  const goTo = (town: TownProduct) => {
    setOpen(false);
    void navigate(`/products/${town.handle}`);
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (highlighted >= 0 && results[highlighted]) {
      goTo(results[highlighted]);
    } else if (results[0]) {
      goTo(results[0]);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open || !results.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((h) => (h + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((h) => (h - 1 + results.length) % results.length);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const showEmpty = open && query.trim().length > 1 && results.length === 0;

  return (
    <div className="town-search" ref={rootRef}>
      <form className="town-search-box" onSubmit={onSubmit} role="search">
        <input
          type="search"
          value={query}
          placeholder="Find your town…"
          aria-label="Find your town"
          autoComplete="off"
          autoFocus={autoFocus}
          onChange={(e) => runSearch(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          onKeyDown={onKeyDown}
        />
        <button type="submit">Find it</button>
      </form>
      {open && results.length > 0 && (
        <div className="town-search-results" role="listbox">
          {results.map((town, i) => (
            <Link
              key={town.handle}
              className="town-search-result"
              data-highlighted={i === highlighted}
              to={`/products/${town.handle}`}
              onClick={() => setOpen(false)}
              onMouseEnter={() => setHighlighted(i)}
            >
              <span className="town-search-result-name">
                {town.city}, {town.provinceAbbrev}
              </span>
              <span className="town-search-result-meta">
                {TIER_LABELS[town.populationTier]}
              </span>
            </Link>
          ))}
        </div>
      )}
      {showEmpty && (
        <div className="town-search-results">
          <div className="town-search-empty">
            Not on the rack yet.{' '}
            <Link to="/request-your-town" onClick={() => setOpen(false)}>
              Request your town
            </Link>{' '}
            — that&rsquo;s how towns get here.
          </div>
        </div>
      )}
      <div className="town-search-hint">
        Try &ldquo;Trail,&rdquo; &ldquo;Hope,&rdquo; or wherever you&rsquo;re
        actually from.
      </div>
    </div>
  );
}
