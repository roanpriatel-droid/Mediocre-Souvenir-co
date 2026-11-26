import {useState} from 'react';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {RegionMapData} from '~/lib/region-map.server';
import {wornImage, type SouvenirCard} from '~/lib/shopify-collections';
import {townPath} from '~/lib/towns';

/**
 * A region page's map: the state or province in its own shape with a pin on
 * every town we sell there. The neighbours' names link to their own pages. Hover a pin and the card shows that town's shirt; press it to go to
 * the town. The outlines are a pre-drawn SVG (see region-map.server.ts);
 * only the pins and names are drawn here.
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
  const pin = map.pins.find((entry) => entry.slug === active) ?? null;
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
              <span className="nmap-card-kicker">{regionName}</span>
              <strong className="rmap-card-name">{pin.name}</strong>
              <span className="nmap-card-count">
                {pin.prints} {pin.prints === 1 ? 'print' : 'prints'} · $36 each
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
