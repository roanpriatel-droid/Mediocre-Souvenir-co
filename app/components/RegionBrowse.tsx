import {Link} from 'react-router';
import {getRegionsByCountry, type Region} from '~/lib/catalog';
import {regionNote} from '~/lib/region-copy';

/**
 * The region grid — 63 tiles, and every one of them goes somewhere.
 *
 * This used to be half a navigation: British Columbia was a link and the other
 * 62 regions were dead grey cards announcing their own absence. Now each tile
 * links to its region collection, which either shows the shirts or runs the
 * waitlist. The grid is the top of the demand funnel, not a status board.
 *
 * `open` maps region slug → whether that collection currently holds products.
 * It comes from a single Storefront query in the route loader; when that
 * lookup fails the map is empty and we fall back to the region's configured
 * status, so the grid always renders.
 */
export function RegionBrowse({
  open = {},
  live = false,
  counts = {},
}: {
  open?: Record<string, boolean>;
  live?: boolean;
  /** Region slug → how many souvenirs it actually holds. */
  counts?: Record<string, number>;
}) {
  // When the store answered, trust it completely. When it did not, say
  // nothing about status rather than falling back to the hand-maintained
  // config — that config only ever listed British Columbia as open, which is
  // how 62 regions with real stock ended up reading "in due time".
  const statusFor = (region: Region): 'open' | 'closed' | 'unknown' => {
    if (!live) return 'unknown';
    return open[region.slug] ? 'open' : 'closed';
  };

  return (
    <div className="region-browse">
      <RegionGroup
        label="Canada"
        countryHandle="canada"
        regions={getRegionsByCountry('Canada')}
        statusFor={statusFor}
        counts={counts}
      />
      <RegionGroup
        label="United States"
        countryHandle="united-states"
        regions={getRegionsByCountry('United States')}
        statusFor={statusFor}
        counts={counts}
      />
      <div className="region-grid" style={{marginTop: '16px'}}>
        <Link className="region-card region-card--request" to="/request-a-town" prefetch="intent">
          <span className="region-card-name">Somewhere else?</span>
          <span className="region-card-count">Name your town →</span>
        </Link>
      </div>
    </div>
  );
}

function RegionGroup({
  label,
  countryHandle,
  regions,
  statusFor,
  counts,
}: {
  label: string;
  countryHandle: string;
  regions: Region[];
  statusFor: (region: Region) => 'open' | 'closed' | 'unknown';
  counts: Record<string, number>;
}) {
  const openCount = regions.filter((r) => statusFor(r) === 'open').length;
  return (
    <section aria-label={label} style={{marginBottom: '28px'}}>
      <div className="region-group-head">
        <p className="msc-kicker msc-kicker--navy">{label}</p>
        <Link className="region-group-all" to={`/collections/${countryHandle}`}>
          {openCount > 0
            ? `${openCount} open · see all →`
            : 'see all →'}
        </Link>
      </div>
      <div className="region-grid">
        {regions.map((region) => (
          <RegionCard
            key={region.slug}
            region={region}
            status={statusFor(region)}
            count={counts[region.slug] ?? 0}
          />
        ))}
      </div>
    </section>
  );
}

function RegionCard({
  region,
  status,
  count,
}: {
  region: Region;
  status: 'open' | 'closed' | 'unknown';
  count: number;
}) {
  return (
    <Link
      className="region-card"
      data-open={status === 'open' || undefined}
      to={`/collections/${region.slug}`}
      prefetch="intent"
      title={`${region.name} — ${regionNote(region)}`}
    >
      <span className="region-card-name">{region.name}</span>
      {/*
        A real number beats a status word. "Now open" told a visitor nothing
        about whether their province held six shirts or ninety-four; sixty-three
        tiles all saying the same two words read as a template rather than a
        catalogue. The count is already in the loader's hands.
      */}
      <span className="region-card-count">
        {count > 0 ? (
          <span className="region-card-badge">{count} souvenirs</span>
        ) : status === 'open' ? (
          <span className="region-card-badge">Now open</span>
        ) : status === 'closed' ? (
          'In due time'
        ) : (
          'View →'
        )}
      </span>
    </Link>
  );
}
