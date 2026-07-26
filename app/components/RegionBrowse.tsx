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
}: {
  open?: Record<string, boolean>;
  live?: boolean;
}) {
  const isOpen = (region: Region) =>
    live && region.slug in open ? open[region.slug] : region.status === 'open';

  return (
    <div className="region-browse">
      <RegionGroup
        label="Canada"
        countryHandle="canada"
        regions={getRegionsByCountry('Canada')}
        isOpen={isOpen}
      />
      <RegionGroup
        label="United States"
        countryHandle="united-states"
        regions={getRegionsByCountry('United States')}
        isOpen={isOpen}
      />
      <div className="region-grid" style={{marginTop: '16px'}}>
        <Link className="region-card region-card--request" to="/request-your-town" prefetch="intent">
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
  isOpen,
}: {
  label: string;
  countryHandle: string;
  regions: Region[];
  isOpen: (region: Region) => boolean;
}) {
  const openCount = regions.filter(isOpen).length;
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
          <RegionCard key={region.slug} region={region} open={isOpen(region)} />
        ))}
      </div>
    </section>
  );
}

function RegionCard({region, open}: {region: Region; open: boolean}) {
  return (
    <Link
      className="region-card"
      data-open={open || undefined}
      to={`/collections/${region.slug}`}
      prefetch="intent"
      title={`${region.name} — ${regionNote(region)}`}
    >
      <span className="region-card-name">{region.name}</span>
      <span className="region-card-count">
        {open ? (
          <span className="region-card-badge">Now open</span>
        ) : region.status === 'next' ? (
          'Up next'
        ) : (
          'In due time'
        )}
      </span>
    </Link>
  );
}
