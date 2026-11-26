import {useMemo, useState} from 'react';
import {Link} from 'react-router';
import {REGIONS} from '~/lib/catalog';
import {
  MAP_AREAS,
  MAP_GRATICULE,
  MAP_HEIGHT,
  MAP_LABELS,
  MAP_LAKES,
  MAP_PATHS,
  MAP_WIDTH,
} from '~/lib/map-shapes';

/**
 * North America as a real map: every state, province and territory in its
 * true shape, shaded by how many shirts it has, each one a link to its rack.
 * Hover or focus a place and the card in the North Atlantic says what is
 * there. Drawn as one inline SVG from Natural Earth outlines, so it is sharp
 * at any size and costs no image request.
 */

/** Places too small to hold their own label get one offshore, on a leader. */
const CALLOUTS: Record<string, [number, number]> = {
  VT: [822, 474],
  NH: [822, 494],
  MA: [822, 514],
  RI: [822, 534],
  CT: [822, 554],
  NJ: [822, 574],
  DE: [822, 594],
  MD: [822, 614],
  PE: [846, 398],
  NS: [862, 452],
  HI: [214, 640],
};

/** Below this projected area a label only fits in small type. */
const SMALL = 900;
const ROOMY = 2600;

export function RegionMap({counts}: {counts: Record<string, number>}) {
  const [active, setActive] = useState<string | null>(null);

  const places = useMemo(() => {
    const max = Math.max(1, ...Object.values(counts));
    return REGIONS.map((region) => {
      const abbrev = region.abbrev.toUpperCase();
      const count = counts[region.slug] ?? 0;
      return {
        region,
        abbrev,
        count,
        d: MAP_PATHS[abbrev],
        label: MAP_LABELS[abbrev],
        area: MAP_AREAS[abbrev] ?? 0,
        // A square root spreads the light end, so a 6-shirt territory still
        // reads as stocked next to a 108-shirt province.
        depth: count ? 0.28 + 0.72 * Math.sqrt(count / max) : 0,
      };
    }).filter((place) => place.d && place.label);
  }, [counts]);

  const total = places.reduce((sum, place) => sum + place.count, 0);
  const current = places.find((place) => place.abbrev === active) ?? null;
  const shadow = places.map((place) => place.d).join('');

  return (
    <div className="nmap" onMouseLeave={() => setActive(null)}>
      <svg
        className="nmap-svg"
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="group"
        aria-label="Map of Canada and the United States. Choose a state or province to shop it."
      >
        <defs>
          <pattern
            id="nmap-water"
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(35)"
          >
            <line x1="0" y1="0" x2="0" y2="7" className="nmap-hatch" />
          </pattern>
        </defs>

        <rect className="nmap-ocean" width={MAP_WIDTH} height={MAP_HEIGHT} />
        <rect
          className="nmap-ocean-hatch"
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          fill="url(#nmap-water)"
        />
        <path className="nmap-graticule" d={MAP_GRATICULE} />

        {/* The land printed twice, a little out of register, like an old
            two-colour postcard. */}
        <path className="nmap-shadow" d={shadow} transform="translate(5 6)" />

        <g className="nmap-land">
          {places.map((place) => (
            <Link
              key={place.abbrev}
              to={`/collections/${place.region.slug}`}
              prefetch="intent"
              className="nmap-place"
              data-country={place.region.country === 'Canada' ? 'ca' : 'us'}
              data-active={place.abbrev === active || undefined}
              aria-label={`${place.region.name}: ${place.count} souvenir shirts`}
              onMouseEnter={() => setActive(place.abbrev)}
              onFocus={() => setActive(place.abbrev)}
              onBlur={() => setActive(null)}
              style={{'--depth': place.depth.toFixed(2)} as React.CSSProperties}
            >
              <path d={place.d} />
            </Link>
          ))}
        </g>

        <path className="nmap-lakes" d={MAP_LAKES} />

        {/* The active place, lifted off the page above its neighbours. */}
        {current && (
          <path
            key={current.abbrev}
            className="nmap-lift"
            d={current.d}
            aria-hidden="true"
          />
        )}

        {/* Hawaii's inset frame. */}
        <g className="nmap-inset" aria-hidden="true">
          <rect x="48" y="618" width="216" height="126" rx="2" />
          <text x="58" y="732">
            Hawaii
          </text>
        </g>

        <g className="nmap-labels" aria-hidden="true">
          {places.map((place) => {
            const callout = CALLOUTS[place.abbrev];
            const [x, y] = place.label;
            const on = place.abbrev === active;
            if (callout) {
              const [cx, cy] = callout;
              return (
                <g
                  key={place.abbrev}
                  className="nmap-callout"
                  data-active={on || undefined}
                >
                  <line x1={x} y1={y} x2={cx - 4} y2={cy - 4} />
                  <circle cx={x} cy={y} r="1.8" />
                  <text x={cx} y={cy}>
                    {place.abbrev}
                    <tspan className="nmap-callout-count" dx="5">
                      {place.count}
                    </tspan>
                  </text>
                </g>
              );
            }
            const size =
              place.area < SMALL ? 'sm' : place.area < ROOMY ? 'md' : 'lg';
            return (
              <g
                key={place.abbrev}
                className="nmap-label"
                data-size={size}
                data-active={on || undefined}
              >
                <text x={x} y={y}>
                  {place.abbrev}
                </text>
                {size === 'lg' && (
                  <text className="nmap-label-count" x={x} y={y + 15}>
                    {place.count}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        <Compass x={930} y={676} />

        <text className="nmap-imprint" x={MAP_WIDTH - 16} y={MAP_HEIGHT - 12}>
          Survey of {places.length} places · Mediocre Souvenir Co.
        </text>
      </svg>

      <aside className="nmap-card" aria-live="polite">
        {current ? (
          <>
            <span className="nmap-card-kicker">{current.region.country}</span>
            <strong className="nmap-card-name">{current.region.name}</strong>
            <span className="nmap-card-count">
              {current.count} souvenir{' '}
              {current.count === 1 ? 'shirt' : 'shirts'}
            </span>
            <span className="nmap-card-cta">Click to shop →</span>
          </>
        ) : (
          <>
            <span className="nmap-card-kicker">Pick a place</span>
            <strong className="nmap-card-name">
              {total.toLocaleString('en-US')} shirts
            </strong>
            <span className="nmap-card-count">
              across {places.length} states, provinces &amp; territories
            </span>
            <span className="nmap-card-cta">
              <span className="nmap-hover-only">
                Hover the map, click to shop
              </span>
              <span className="nmap-touch-only">Tap a place to shop it</span>
            </span>
          </>
        )}
      </aside>

      <div className="nmap-legend" aria-hidden="true">
        <span className="nmap-legend-label">Fewer shirts</span>
        <span className="nmap-legend-bar nmap-legend-bar--ca" />
        <span className="nmap-legend-name">Canada</span>
        <span className="nmap-legend-bar nmap-legend-bar--us" />
        <span className="nmap-legend-name">United States</span>
        <span className="nmap-legend-label">More</span>
      </div>
    </div>
  );
}

/** A small four-point compass rose for the empty Atlantic. */
function Compass({x, y}: {x: number; y: number}) {
  return (
    <g
      className="nmap-compass"
      transform={`translate(${x} ${y})`}
      aria-hidden="true"
    >
      <circle r="34" className="nmap-compass-ring" />
      <circle r="27" className="nmap-compass-ring nmap-compass-ring--thin" />
      <path d="M0 -40 L7 -7 L0 0 Z" className="nmap-compass-dark" />
      <path d="M0 -40 L-7 -7 L0 0 Z" className="nmap-compass-light" />
      <path d="M40 0 L7 7 L0 0 Z" className="nmap-compass-dark" />
      <path d="M40 0 L7 -7 L0 0 Z" className="nmap-compass-light" />
      <path d="M0 40 L-7 7 L0 0 Z" className="nmap-compass-dark" />
      <path d="M0 40 L7 7 L0 0 Z" className="nmap-compass-light" />
      <path d="M-40 0 L-7 -7 L0 0 Z" className="nmap-compass-dark" />
      <path d="M-40 0 L-7 7 L0 0 Z" className="nmap-compass-light" />
      <text y="-46">N</text>
    </g>
  );
}
