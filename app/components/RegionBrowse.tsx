import {Link} from 'react-router';
import {
  getRegionsByCountry,
  getTownsByRegion,
  regionPath,
  type Region,
} from '~/lib/catalog';

/**
 * Browse by region — the real navigation. Renders every province and state
 * from the catalog config, grouped by country, so new regions appear here
 * without a redesign. Launch order: BC, then Alberta, then east, then south.
 */
export function RegionBrowse() {
  return (
    <div className="region-browse">
      <RegionGroup label="Canada" regions={getRegionsByCountry('Canada')} />
      <RegionGroup
        label="United States"
        regions={getRegionsByCountry('United States')}
      />
      <div className="region-grid" style={{marginTop: '16px'}}>
        <Link className="region-card" to="/request-your-town" prefetch="intent">
          <span className="region-card-name">Somewhere else?</span>
          <span className="region-card-count">Request your town</span>
        </Link>
      </div>
    </div>
  );
}

function RegionGroup({label, regions}: {label: string; regions: Region[]}) {
  return (
    <section aria-label={label} style={{marginBottom: '28px'}}>
      <p className="msc-kicker msc-kicker--navy" style={{marginBottom: '12px'}}>
        {label}
      </p>
      <div className="region-grid">
        {regions.map((region) => (
          <RegionCard key={region.slug} region={region} />
        ))}
      </div>
    </section>
  );
}

function RegionCard({region}: {region: Region}) {
  if (region.status === 'open') {
    const count = getTownsByRegion(region.slug).length;
    return (
      <Link className="region-card" to={regionPath(region)} prefetch="intent">
        <span className="region-card-name">{region.name}</span>
        <span className="region-card-count">{count} towns · Now open</span>
      </Link>
    );
  }
  return (
    <div
      className="region-card region-card--soon"
      aria-label={`${region.name} — coming soon`}
    >
      <span className="region-card-name">{region.name}</span>
      <span className="region-card-count">
        {region.status === 'next' ? 'Up next' : 'In due time'}
      </span>
    </div>
  );
}
