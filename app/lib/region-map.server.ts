import {geoAzimuthalEqualArea} from 'd3-geo';
import {REGIONS, type Region} from '~/lib/catalog';
import {REGION_DRAWINGS, TOWN_COORDS} from '~/lib/region-maps.server';
import type {Town} from '~/lib/towns';

/**
 * Region page maps.
 *
 * Each region's outlines are pre-drawn (region-maps.server.ts, generated from
 * Natural Earth 1:10m) and served as a long-cached SVG from /maps/{code}.svg,
 * so the outlines never travel in the page's HTML or loader data. The page
 * itself only carries what is interactive: a pin per town, placed here with
 * the same projection, and the neighbours' names as links.
 */

/** Bump when the drawings are regenerated, to bust the long cache. */
export const REGION_MAP_VERSION = '1';

export interface RegionMapPin {
  slug: string;
  place: string;
  name: string;
  prints: number;
  x: number;
  y: number;
  /** Labelled on the map without hovering, and on which side of the pin. */
  label: 'start' | 'end' | null;
}

export interface RegionMapData {
  /** On a town page, the town the page is about. */
  focus: string | null;
  width: number;
  height: number;
  src: string;
  pins: RegionMapPin[];
  /** Neighbouring regions' names, each a link to its page. */
  neighbours: {slug: string; name: string; x: number; y: number}[];
  /** Foreign countries in view: Mexico, Greenland, Cuba… */
  countries: {name: string; x: number; y: number}[];
}

/** Labels shown without hovering, at most. */
const MAX_LABELS = 16;

const BY_ABBREV = new Map(REGIONS.map((r) => [r.abbrev.toUpperCase(), r]));

export function buildRegionMap(
  region: Region,
  towns: Town[],
  /** A town page passes its own town, which is marked and labelled first. */
  focus: string | null = null,
): RegionMapData | null {
  const abbrev = region.abbrev.toUpperCase();
  const drawing = REGION_DRAWINGS[abbrev];
  if (!drawing) return null;
  const {w: width, h: height} = drawing;

  const projection = geoAzimuthalEqualArea()
    .rotate(drawing.r)
    .scale(drawing.s)
    .translate(drawing.t);

  // Pins, biggest towns first so they win the label space.
  const pins = towns
    .map((town) => {
      const coords = TOWN_COORDS[town.place];
      const point = coords ? projection([coords[0], coords[1]]) : null;
      if (!coords || !point) return null;
      return {
        slug: town.slug,
        place: town.place,
        name: town.name,
        prints: town.products.length,
        x: Math.round(point[0] * 10) / 10,
        y: Math.round(point[1] * 10) / 10,
        population: coords[2] ?? 0,
        label: null as RegionMapPin['label'],
      };
    })
    .filter((pin): pin is NonNullable<typeof pin> => pin !== null)
    .sort(
      (a, b) =>
        Number(b.slug === focus) - Number(a.slug === focus) ||
        b.population - a.population,
    );

  // Greedy label placement: right of the pin if it fits, else left, else
  // none (the name still shows on hover). Pins themselves are obstacles.
  type Box = [number, number, number, number];
  const pinBoxes: Box[] = pins.map((pin) => [
    pin.x - 6,
    pin.y - 6,
    pin.x + 6,
    pin.y + 6,
  ]);
  const labelBoxes: Box[] = [];
  const overlaps = (a: Box, b: Box) =>
    a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
  const fits = (box: Box, self: number) =>
    box[0] > 6 &&
    box[2] < width - 6 &&
    box[1] > 4 &&
    box[3] < height - 4 &&
    !labelBoxes.some((other) => overlaps(box, other)) &&
    !pinBoxes.some((other, index) => index !== self && overlaps(box, other));

  let labelled = 0;
  pins.forEach((pin, index) => {
    if (labelled >= MAX_LABELS) return;
    // The focus town is set in the display face at 18px and sits further out.
    const big = pin.slug === focus;
    const textWidth = pin.name.length * (big ? 11.5 : 7.2) + 4;
    const gap = big ? 16 : 8;
    const half = big ? 13 : 8;
    const right: Box = [
      pin.x + gap,
      pin.y - half,
      pin.x + gap + textWidth,
      pin.y + half,
    ];
    const left: Box = [
      pin.x - gap - textWidth,
      pin.y - half,
      pin.x - gap,
      pin.y + half,
    ];
    if (fits(right, index)) {
      pin.label = 'start';
      labelBoxes.push(right);
      labelled++;
    } else if (fits(left, index)) {
      pin.label = 'end';
      labelBoxes.push(left);
      labelled++;
    }
  });

  return {
    focus: pins.some((pin) => pin.slug === focus) ? focus : null,
    width,
    height,
    src: `/maps/${abbrev.toLowerCase()}.svg?v=${REGION_MAP_VERSION}`,
    pins: pins.map(({population: _population, ...pin}) => pin),
    neighbours: drawing.n
      .filter(([, , at]) => at)
      .map(([code, , at]) => ({
        slug: BY_ABBREV.get(code)?.slug ?? '',
        name: BY_ABBREV.get(code)?.name ?? code,
        x: at![0],
        y: at![1],
      }))
      // Spaced capitals run about 9.5px a letter; drop any that would be cut.
      .filter((entry) => {
        const half = (entry.name.length * 9.5) / 2;
        return entry.slug && entry.x - half > 8 && entry.x + half < width - 8;
      }),
    countries: drawing.c.map(([name, x, y]) => ({name, x, y})),
  };
}

/** The pre-drawn background for one region, as a standalone SVG document. */
export function regionMapSvg(code: string): string | null {
  const abbrev = code.toUpperCase();
  const drawing = REGION_DRAWINGS[abbrev];
  const region = BY_ABBREV.get(abbrev);
  if (!drawing || !region) return null;
  const {w, h} = drawing;
  const fill = region.country === 'Canada' ? '#b8503a' : '#2a3d52';
  const neighbours = drawing.n.map(([, d]) => d).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs><pattern id="w" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="7" stroke="rgba(42,61,82,0.07)" stroke-width="1.4"/></pattern></defs>
<rect width="${w}" height="${h}" fill="#e3d9c1"/>
<rect width="${w}" height="${h}" fill="url(#w)"/>
<path d="${drawing.g}" fill="none" stroke="rgba(42,61,82,0.22)" stroke-width="0.8" stroke-dasharray="2 4"/>
<path d="${drawing.f}" fill="#d9cfb7" stroke="rgba(42,61,82,0.28)" stroke-width="0.8" stroke-linejoin="round"/>
<path d="${neighbours}" fill="#cfc6ae" stroke="#f1e9d6" stroke-width="1.2" stroke-linejoin="round"/>
<path d="${drawing.d}" fill="rgba(42,61,82,0.22)" transform="translate(5 6)"/>
<path d="${drawing.d}" fill="${fill}" stroke="#f1e9d6" stroke-width="1.6" stroke-linejoin="round"/>
<path d="${drawing.l}" fill="#e3d9c1" stroke="rgba(42,61,82,0.35)" stroke-width="0.6"/>
</svg>`;
}
