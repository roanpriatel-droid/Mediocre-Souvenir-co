import type {ReactNode} from 'react';
import {Link} from 'react-router';
import {townPath} from '~/lib/towns';

/**
 * The header of a region or town page: the place's map across the full width
 * of the screen, with the title on a postcard-style label over the water on
 * the left. It replaces a two-column banner whose short title sat centred
 * next to a tall map, which left a large empty gap above the heading.
 */
export function PlaceBand({
  kicker,
  title,
  lede,
  stats,
  map,
  children,
  headingLevel = 1,
}: {
  kicker: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  stats?: ReactNode[];
  /** The map itself (RegionLocator). */
  map: ReactNode;
  /** Extra content under the stats, e.g. buttons. */
  children?: ReactNode;
  /** 2 when the band sits lower on a page that already has its own H1. */
  headingLevel?: 1 | 2;
}) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <header className="pband">
      <div className="pband-map">{map}</div>
      <div className="pband-label">
        <span className="pband-kicker">{kicker}</span>
        <Heading className="pband-title">{title}</Heading>
        {lede ? <p className="pband-lede">{lede}</p> : null}
        {stats && stats.length > 0 ? (
          <ul className="pband-stats">
            {stats.map((stat, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={index}>{stat}</li>
            ))}
          </ul>
        ) : null}
        {children}
      </div>
    </header>
  );
}

/** A sideways-scrolling row of every town in a region. */
export function TownStrip({
  heading,
  towns,
  current,
}: {
  heading: ReactNode;
  towns: {slug: string; name: string}[];
  current?: string;
}) {
  if (towns.length < 2) return null;
  const sorted = [...towns].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <nav className="town-strip" aria-label="Towns in this region">
      <span className="town-strip-heading">{heading}</span>
      <ul className="town-strip-list">
        {sorted.map((town) => (
          <li key={town.slug}>
            <Link
              to={townPath(town.slug)}
              prefetch="intent"
              aria-current={town.slug === current ? 'page' : undefined}
            >
              {town.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** The first sentence of a paragraph, for a short lede over the map. */
export function firstSentence(text: string): string {
  const match = /^(.+?[.!?])(\s|$)/.exec(text.trim());
  return match ? match[1] : text;
}
