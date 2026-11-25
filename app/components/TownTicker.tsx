import {Link} from 'react-router';

/**
 * A slow band of town names under the hero: the catalogue's breadth in one
 * glance. Pure CSS animation, paused on hover and focus, and still for anyone
 * who prefers reduced motion. The list is rendered twice so the loop is
 * seamless; the copy is hidden from assistive technology.
 */
export function TownTicker({towns}: {towns: {slug: string; place: string}[]}) {
  if (!towns.length) return null;
  const row = (hidden: boolean) => (
    <ul className="ticker-row" aria-hidden={hidden || undefined}>
      {towns.map((town) => (
        <li key={town.slug}>
          <Link
            to={`/towns/${town.slug}`}
            tabIndex={hidden ? -1 : undefined}
            prefetch="none"
          >
            {town.place}
          </Link>
          <span className="ticker-star" aria-hidden="true">
            ★
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <section className="ticker" aria-label="Some of the towns we print">
      <div className="ticker-track">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
