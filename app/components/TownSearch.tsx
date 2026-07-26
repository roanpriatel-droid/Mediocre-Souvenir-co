import {useEffect, useId, useRef, useState} from 'react';
import {Link, useFetcher, useNavigate} from 'react-router';
import type {Suggestion} from '~/lib/shopify-search';

/**
 * "Find your town" — the single most important element on the page.
 *
 * People arrive looking for one specific place. This used to search the local
 * 40-town catalog, so it could not find the overwhelming majority of what the
 * store sells. It now runs against Shopify's predictive search through
 * /api/suggest, and always submits to /search as a fallback so the box works
 * with JavaScript unavailable or the request in flight.
 */
export function TownSearch({autoFocus = false}: {autoFocus?: boolean}) {
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(-1);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const fetcher = useFetcher<{suggestions: Suggestion[]}>();
  const listId = useId();

  const results = fetcher.data?.suggestions ?? [];

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Debounced so a fast typist does not open a request per keystroke.
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setOpen(false);
      return;
    }
    const timer = setTimeout(() => {
      void fetcher.load(`/api/suggest?q=${encodeURIComponent(term)}`);
      setOpen(true);
    }, 180);
    return () => clearTimeout(timer);
    // fetcher identity changes each render; depending on it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    setHighlighted(results.length ? 0 : -1);
  }, [results.length]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const chosen = highlighted >= 0 ? results[highlighted] : undefined;
    setOpen(false);
    void navigate(
      chosen
        ? `/products/${chosen.handle}`
        : `/search?q=${encodeURIComponent(query.trim())}`,
    );
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

  const searching = fetcher.state !== 'idle';
  const showEmpty =
    open && !searching && query.trim().length > 1 && results.length === 0;

  return (
    <div className="town-search" ref={rootRef}>
      <form
        className="town-search-box"
        role="search"
        action="/search"
        method="get"
        onSubmit={submit}
      >
        <input
          type="search"
          name="q"
          value={query}
          placeholder="Find your town…"
          aria-label="Find your town"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length > 1 && setOpen(true)}
          onKeyDown={onKeyDown}
        />
        <button type="submit">Find it</button>
      </form>

      {open && results.length > 0 && (
        <div className="town-search-results" id={listId} role="listbox">
          {results.map((result, i) => (
            <Link
              key={result.handle}
              className="town-search-result"
              data-highlighted={i === highlighted}
              to={`/products/${result.handle}`}
              onClick={() => setOpen(false)}
              onMouseEnter={() => setHighlighted(i)}
              role="option"
              aria-selected={i === highlighted}
            >
              <span className="town-search-result-name">{result.title}</span>
              {result.price && (
                <span className="town-search-result-meta">${result.price}</span>
              )}
            </Link>
          ))}
          <Link
            className="town-search-result town-search-result--all"
            to={`/search?q=${encodeURIComponent(query.trim())}`}
            onClick={() => setOpen(false)}
          >
            <span className="town-search-result-name">
              See everything for &ldquo;{query.trim()}&rdquo;
            </span>
          </Link>
        </div>
      )}

      {showEmpty && (
        <div className="town-search-results">
          <div className="town-search-empty">
            Not on the rack yet.{' '}
            <Link to="/request-a-town" onClick={() => setOpen(false)}>
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
