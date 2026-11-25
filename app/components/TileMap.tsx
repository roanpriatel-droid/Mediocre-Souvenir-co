import {Link} from 'react-router';
import {REGIONS} from '~/lib/catalog';

/**
 * North America as a tile map: one square per state, province and territory,
 * placed roughly where it sits, shaded by how many shirts it has. Every tile
 * links to its rack. It is the store's whole catalogue in one picture, and a
 * faster way to find home than a list of sixty-three names.
 */

/** Column, row. Canada on the top two rows, the US below. */
const GRID: Record<string, [number, number]> = {
  // Canada
  YT: [1, 0], NT: [2, 0], NU: [4, 0], NL: [10, 0],
  BC: [1, 1], AB: [2, 1], SK: [3, 1], MB: [4, 1], ON: [6, 1], QC: [8, 1],
  NB: [9, 1], NS: [10, 1], PE: [11, 1],
  // United States
  AK: [0, 2], ME: [11, 2],
  WI: [6, 3], VT: [10, 3], NH: [11, 3],
  WA: [1, 4], ID: [2, 4], MT: [3, 4], ND: [4, 4], MN: [5, 4], IL: [6, 4],
  MI: [7, 4], NY: [9, 4], MA: [10, 4],
  OR: [1, 5], NV: [2, 5], WY: [3, 5], SD: [4, 5], IA: [5, 5], IN: [6, 5],
  OH: [7, 5], PA: [8, 5], NJ: [9, 5], CT: [10, 5], RI: [11, 5],
  CA: [1, 6], UT: [2, 6], CO: [3, 6], NE: [4, 6], MO: [5, 6], KY: [6, 6],
  WV: [7, 6], VA: [8, 6], MD: [9, 6], DE: [10, 6],
  AZ: [2, 7], NM: [3, 7], KS: [4, 7], AR: [5, 7], TN: [6, 7], NC: [7, 7],
  SC: [8, 7],
  OK: [4, 8], LA: [5, 8], MS: [6, 8], AL: [7, 8], GA: [8, 8],
  HI: [0, 9], TX: [4, 9], FL: [9, 9],
};

export function TileMap({counts}: {counts: Record<string, number>}) {
  const max = Math.max(1, ...Object.values(counts));
  const tiles = REGIONS.map((region) => ({
    region,
    at: GRID[region.abbrev.toUpperCase()],
    count: counts[region.slug] ?? 0,
  })).filter((tile) => tile.at);

  return (
    <div className="tilemap" role="list" aria-label="Shop by state or province">
      {tiles.map(({region, at, count}) => {
        // Shade from light to full by depth of the rack.
        const depth = count ? 0.25 + 0.75 * (count / max) : 0;
        return (
          <Link
            key={region.slug}
            role="listitem"
            to={`/collections/${region.slug}`}
            className="tilemap-tile"
            data-country={region.country === 'Canada' ? 'ca' : 'us'}
            style={
              {
                gridColumn: at[0] + 1,
                gridRow: at[1] + 1,
                '--depth': depth.toFixed(2),
              } as React.CSSProperties
            }
            title={`${region.name}: ${count} souvenirs`}
            prefetch="intent"
          >
            <span className="tilemap-abbrev">{region.abbrev.toUpperCase()}</span>
            <span className="tilemap-count">{count}</span>
            <span className="tilemap-name">{region.name}</span>
          </Link>
        );
      })}
      <span className="tilemap-legend tilemap-legend--ca" aria-hidden="true">
        Canada
      </span>
      <span className="tilemap-legend tilemap-legend--us" aria-hidden="true">
        United States
      </span>
    </div>
  );
}
