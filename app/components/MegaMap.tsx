import {useMemo, useState} from 'react';
import {Link} from 'react-router';
import {REGIONS, type Region} from '~/lib/catalog';
import {MAP_LABELS, MAP_PATHS} from '~/lib/map-shapes';

/**
 * The mini map in the Canada and USA menus: one country's regions, each a
 * link. Loaded lazily the first time a country menu opens, so the outlines
 * never weigh on a page that does not use them.
 */
export default function MegaMap({
  country,
  onNavigate,
}: {
  country: Region['country'];
  onNavigate: () => void;
}) {
  const [active, setActive] = useState<string | null>(null);

  const {places, viewBox} = useMemo(() => {
    // Alaska and Hawaii sit far from the lower 48 and would shrink it to a
    // thumbnail; they stay in the list beside the map.
    const list = REGIONS.filter(
      (region) =>
        region.country === country &&
        MAP_PATHS[region.abbrev.toUpperCase()] &&
        !['AK', 'HI'].includes(region.abbrev.toUpperCase()),
    ).map((region) => ({
      region,
      code: region.abbrev.toUpperCase(),
      d: MAP_PATHS[region.abbrev.toUpperCase()],
    }));
    // Fit the view to the country (Alaska and Hawaii make the US wide).
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const place of list) {
      const numbers = place.d.match(/-?\d+(\.\d+)?/g) ?? [];
      for (let i = 0; i + 1 < numbers.length; i += 2) {
        const x = Number(numbers[i]);
        const y = Number(numbers[i + 1]);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    const pad = 8;
    return {
      places: list,
      viewBox: `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`,
    };
  }, [country]);

  const current = places.find((place) => place.code === active);

  return (
    <div className="megamap">
      <svg
        viewBox={viewBox}
        className="megamap-svg"
        aria-label={`Map of ${country}`}
      >
        {places.map((place) => (
          <Link
            key={place.code}
            to={`/collections/${place.region.slug}`}
            onClick={onNavigate}
            onMouseEnter={() => setActive(place.code)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(place.code)}
            aria-label={place.region.name}
            className="megamap-place"
            data-active={place.code === active || undefined}
          >
            <path d={place.d} />
          </Link>
        ))}
        {current && MAP_LABELS[current.code] && (
          <text
            className="megamap-label"
            x={MAP_LABELS[current.code][0]}
            y={MAP_LABELS[current.code][1]}
          >
            {current.code}
          </text>
        )}
      </svg>
      <span className="megamap-caption">
        {current ? `Shop ${current.region.name} →` : 'Pick a place on the map'}
      </span>
    </div>
  );
}
