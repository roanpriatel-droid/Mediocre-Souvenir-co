import {useState} from 'react';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {RegionMapData} from '~/lib/region-map.server';
import {wornImage, type SouvenirCard} from '~/lib/shopify-collections';
import {townPath} from '~/lib/towns';

/**
 * A region or town page's map: the state or province in its own shape with a
 * pin on every town we sell there. The neighbours' names link to their own
 * pages. Hover a pin and the card shows that town; press it to go there.
 * On a town page (map.focus) the page's own town is marked "you are here".
 * The outlines are a pre-drawn SVG (see region-map.server.ts); only the pins
 * and names are drawn here.
 */
export function RegionLocator({
  map,
  regionName,
  country,
  products,
}: {
  map: RegionMapData;
  regionName: string;
  country: string;
  products: SouvenirCard[];
}) {
  const [active, setActive] = useState<string | null>(null);
  const focus = map.focus
    ? (map.pins.find((entry) => entry.slug === map.focus) ?? null)
    : null;
  const pin =
    map.pins.find((entry) => entry.slug === active) ?? (active ? null : focus);
  const isFocus = Boolean(pin && pin === focus);
  const ca = country === 'Canada';

  // A shirt from the hovered town, from the products already on the page.
  const product = pin
    ? products.find((entry) => entry.title.startsWith(`${pin.place} —`))
    : null;
  const image = product ? (wornImage(product) ?? product.featuredImage) : null;

  return (
    <div
      className="rmap"
      data-country={ca ? 'ca' : 'us'}
      onMouseLeave={() => setActive(null)}
    >
      <svg
        className="rmap-svg"
        viewBox={`0 0 ${map.width} ${map.height}`}
        role="group"
        aria-label={`Map of ${regionName} with ${map.pins.length} towns`}
      >
        {/* Outlines, water and neighbours: a pre-drawn, long-cached file. */}
        <image
          href={map.src}
          width={map.width}
          height={map.height}
          preserveAspectRatio="none"
        />

        <g className="rmap-countries" aria-hidden="true">
          {map.countries.map((country) => (
            <text key={country.name} x={country.x} y={country.y}>
              {country.name}
            </text>
          ))}
        </g>

        <g className="rmap-neighbour-labels">
          {map.neighbours.map((other) => (
            <Link
              key={other.slug}
              to={`/collections/${other.slug}`}
              prefetch="intent"
              aria-label={`Shop ${other.name}`}
            >
              <text x={other.x} y={other.y}>
                {other.name}
              </text>
            </Link>
          ))}
        </g>

        <g className="rmap-pins">
          {map.pins.map((entry) => {
            if (entry.slug === map.focus) return null;
            const on = entry.slug === active;
            return (
              <Link
                key={entry.slug}
                to={townPath(entry.slug)}
                prefetch="intent"
                className="rmap-pin"
                data-active={on || undefined}
                aria-label={`${entry.place}: ${entry.prints} ${entry.prints === 1 ? 'print' : 'prints'}`}
                onMouseEnter={() => setActive(entry.slug)}
                onFocus={() => setActive(entry.slug)}
                onBlur={() => setActive(null)}
              >
                <circle
                  className="rmap-pin-hit"
                  cx={entry.x}
                  cy={entry.y}
                  r="11"
                />
                <circle
                  className="rmap-pin-dot"
                  cx={entry.x}
                  cy={entry.y}
                  r={on ? 7 : 4.6}
                />
                {(entry.label || on) && (
                  <text
                    className="rmap-pin-label"
                    x={
                      entry.x + ((entry.label ?? 'start') === 'start' ? 9 : -9)
                    }
                    y={entry.y}
                    textAnchor={entry.label ?? 'start'}
                  >
                    {entry.name}
                  </text>
                )}
              </Link>
            );
          })}
        </g>

        {focus && (
          <g className="rmap-here" aria-hidden="true">
            <circle
              className="rmap-here-pulse"
              cx={focus.x}
              cy={focus.y}
              r="10"
            />
            <circle
              className="rmap-here-ring"
              cx={focus.x}
              cy={focus.y}
              r="11"
            />
            <path
              className="rmap-here-star"
              transform={`translate(${focus.x} ${focus.y})`}
              d="M0,-7.5L2.2,-2.3L7.8,-2.3L3.3,1.1L5,6.5L0,3.3L-5,6.5L-3.3,1.1L-7.8,-2.3L-2.2,-2.3Z"
            />
            <text
              className="rmap-here-label"
              x={focus.x + ((focus.label ?? 'start') === 'start' ? 17 : -17)}
              y={focus.y}
              textAnchor={focus.label ?? 'start'}
            >
              {focus.name}
            </text>
          </g>
        )}
      </svg>

      <aside className="rmap-card" aria-live="polite">
        {pin ? (
          <>
            {image && (
              <Image
                data={image}
                alt=""
                aspectRatio="1/1"
                sizes="88px"
                className="rmap-card-img"
              />
            )}
            <div>
              <span className="nmap-card-kicker">
                {isFocus ? 'You are here' : regionName}
              </span>
              <strong className="rmap-card-name">{pin.name}</strong>
              <span className="nmap-card-count">
                {isFocus
                  ? `One of ${map.pins.length} towns we sell in ${regionName}`
                  : `${pin.prints} ${pin.prints === 1 ? 'print' : 'prints'} · $36 each`}
              </span>
            </div>
          </>
        ) : (
          <div>
            <span className="nmap-card-kicker">On the map</span>
            <strong className="rmap-card-name">
              {map.pins.length} {map.pins.length === 1 ? 'town' : 'towns'}
            </strong>
            <span className="nmap-card-count">
              <span className="nmap-hover-only">
                Hover a pin, click to shop it
              </span>
              <span className="nmap-touch-only">
                Tap a pin to shop that town
              </span>
            </span>
          </div>
        )}
      </aside>

      <p className="rmap-credit">
        Map data: Natural Earth · Town locations:{' '}
        <a
          href="https://www.geonames.org/"
          rel="noopener noreferrer"
          target="_blank"
        >
          GeoNames
        </a>{' '}
        (CC BY 4.0)
      </p>
    </div>
  );
}
