// Projects the simplified Natural Earth shapes into SVG paths for the site.
// Inputs (from mapshaper): shapes.json, labels.json, hi.json, lakes.json.
// Usage: node project.mjs <out.ts>
import fs from 'node:fs';
import {geoAzimuthalEqualArea, geoPath} from 'd3-geo';

const read = (file) => {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  // GeoJSON rings run anticlockwise; d3-geo wants clockwise exteriors.
  for (const f of data.features) {
    const g = f.geometry;
    if (g.type !== 'Polygon' && g.type !== 'MultiPolygon') continue;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    for (const poly of polys) for (const ring of poly) ring.reverse();
  }
  return data;
};

const shapes = read('shapes.json');
const labels = read('labels.json');
const hawaii = read('hi.json').features[0];
const lakes = read('lakes.json');
const out = process.argv[2];

const W = 1000;
const H = 760;

const projection = geoAzimuthalEqualArea()
  .precision(0)
  .rotate([98, -50])
  .fitExtent(
    [
      [14, 14],
      [W - 14, H - 14],
    ],
    shapes,
  );

// Hawaii sits in an inset off the California coast, at 1.4x the scale so the
// islands are big enough to press.
const hiProjection = geoAzimuthalEqualArea()
  .precision(0)
  .rotate([157.3, -20.6])
  .scale(projection.scale() * 1.4)
  .translate([150, H - 62]);

const round = (d) =>
  d.replace(/(-?\d+)\.(\d)\d*/g, (m, a, b) => (b === '0' ? a : `${a}.${b}`));
const pt = ([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10];

const paths = {};
const points = {};
const areas = {};
for (const f of shapes.features) {
  const p = f.properties.postal;
  const path = geoPath(projection);
  paths[p] = round(path(f));
  areas[p] = Math.round(path.area(f));
}
paths.HI = round(geoPath(hiProjection)(hawaii));
areas.HI = Math.round(geoPath(hiProjection).area(hawaii));
for (const f of labels.features) {
  points[f.properties.postal] = pt(projection(f.geometry.coordinates));
}
points.HI = pt(hiProjection([-157.95, 21.45]));

const lakePath = round(geoPath(projection)(lakes));

const graticule = round(
  geoPath(projection)({
    type: 'MultiLineString',
    coordinates: [
      ...[30, 40, 50, 60, 70, 80].map((lat) =>
        Array.from({length: 141}, (_, i) => [-180 + i, lat]),
      ),
      ...[-160, -140, -120, -100, -80, -60].map((lon) =>
        Array.from({length: 66}, (_, i) => [lon, 20 + i]),
      ),
    ],
  }),
);

const body = `/* Generated from Natural Earth 1:50m admin-1 and lakes (public domain).
 * Azimuthal equal-area projection centred on 98°W 50°N, simplified with
 * mapshaper; Hawaii is an inset off California. Regenerate, do not hand-edit. */

export const MAP_WIDTH = ${W};
export const MAP_HEIGHT = ${H};

/** SVG path data, keyed by postal abbreviation. */
export const MAP_PATHS: Record<string, string> = ${JSON.stringify(paths)};

/** A point well inside each shape, for its label. */
export const MAP_LABELS: Record<string, [number, number]> = ${JSON.stringify(points)};

/** Projected area in square map units, to decide which labels fit. */
export const MAP_AREAS: Record<string, number> = ${JSON.stringify(areas)};

/** The Great Lakes and the big northern lakes, drawn as water. */
export const MAP_LAKES = ${JSON.stringify(lakePath)};

/** Parallels every 10° and meridians every 20°. */
export const MAP_GRATICULE = ${JSON.stringify(graticule)};
`;
fs.writeFileSync(out, body);
console.log(out, body.length, 'bytes', Object.keys(paths).length, 'shapes');
console.log(
  Object.entries(areas)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 16)
    .map(([k, v]) => `${k}:${v}`)
    .join(' '),
);
