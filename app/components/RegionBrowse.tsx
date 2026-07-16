import {Link} from 'react-router';
import {getTownsByProvince, PROVINCES} from '~/lib/catalog';

/**
 * Browse by province/state — the real navigation. Renders every region from
 * the catalog config, so new provinces (and eventually states) appear here
 * without a redesign.
 */
export function RegionBrowse() {
  return (
    <div className="region-grid">
      {PROVINCES.map((province) => {
        const count = getTownsByProvince(province.slug).length;
        if (province.status === 'open') {
          return (
            <Link
              key={province.slug}
              className="region-card"
              to={`/provinces/${province.slug}`}
              prefetch="intent"
            >
              <span className="region-card-name">{province.name}</span>
              <span className="region-card-count">
                {count} towns · Now open
              </span>
            </Link>
          );
        }
        return (
          <div
            key={province.slug}
            className="region-card region-card--soon"
            aria-label={`${province.name} — coming soon`}
          >
            <span className="region-card-name">{province.name}</span>
            <span className="region-card-count">
              {province.status === 'next' ? 'Up next' : 'In due time'}
            </span>
          </div>
        );
      })}
      <Link className="region-card" to="/request-your-town" prefetch="intent">
        <span className="region-card-name">Somewhere else?</span>
        <span className="region-card-count">Request your town</span>
      </Link>
    </div>
  );
}
