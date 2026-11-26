// Pre-draws every region page's map from Natural Earth 1:10m data.
//
// Each region gets its own projection, centred on it, and every outline in
// view is simplified to that zoom (about half a pixel), so Rhode Island keeps
// Narragansett Bay and Nunavut stays light. The site only adds the town pins
// at request time, using the projection parameters stored here.
//
// Inputs: d10.json (regions), l10.json (lakes), f10.json (other countries),
//         towns_geo.json (town coordinates).
// Usage:  node region_maps.mjs <out.ts>
import fs from 'node:fs';
import {
  geoAzimuthalEqualArea,
  geoCentroid,
  geoContains,
  geoGraticule,
  geoPath,
} from 'd3-geo';
import simplify from 'simplify-js';

const rewind = (data) => {
  for (const f of data.features) {
    const g = f.geometry;
    if (!g) continue;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    for (const poly of polys) for (const ring of poly) ring.reverse();
  }
  return data;
};
const load = (file) => rewind(JSON.parse(fs.readFileSync(file, 'utf8')));

const regions = load('d10.json');
const lakes = load('l10.json');
const foreign = load('f10.json');
const towns = JSON.parse(fs.readFileSync('towns_geo.json', 'utf8'));

const shapes = {};
for (const f of regions.features) shapes[f.properties.postal] = f;

const WIDTH = 800;
const PAD = 34;
const TOLERANCE = 0.8;

/** Regions whose islands would shrink the mainland to a speck. */
const FIT_BOX = {
  AK: [-169, 54, -130, 71.5],
  HI: [-160.4, 18.8, -154.7, 22.4],
};
const boxFeature = ([w, s, e, n]) => ({
  type: 'Feature',
  geometry: {
    type: 'MultiPoint',
    coordinates: [
      [w, s],
      [e, s],
      [e, n],
      [w, n],
      [(w + e) / 2, s],
      [(w + e) / 2, n],
    ],
  },
});

const r1 = (n) => Math.round(n * 10) / 10;

/** Projected, clipped, simplified SVG path data for any GeoJSON object. */
function draw(projection, object, minArea = 1.5) {
  const rings = [];
  let ring = null;
  const ctx = {
    moveTo(x, y) {
      ring = [{x, y}];
      rings.push(ring);
    },
    lineTo(x, y) {
      ring.push({x, y});
    },
    closePath() {},
    arc() {},
  };
  geoPath(projection, ctx)(object);
  let out = '';
  for (const raw of rings) {
    const pts = simplify(raw, TOLERANCE, true);
    if (pts.length < 3) continue;
    let area = 0;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      area += (pts[j].x + pts[i].x) * (pts[j].y - pts[i].y);
    }
    if (Math.abs(area / 2) < minArea) continue;
    out += 'M' + pts.map((p) => `${r1(p.x)},${r1(p.y)}`).join('L') + 'Z';
  }
  return out.replace(/\.0(?=[,LZ])/g, '');
}

const maps = {};
for (const [abbrev, self] of Object.entries(shapes)) {
  const fitTo = FIT_BOX[abbrev] ? boxFeature(FIT_BOX[abbrev]) : self;
  const [lon, lat] = FIT_BOX[abbrev]
    ? [
        (FIT_BOX[abbrev][0] + FIT_BOX[abbrev][2]) / 2,
        (FIT_BOX[abbrev][1] + FIT_BOX[abbrev][3]) / 2,
      ]
    : geoCentroid(self);
  const rotate = [r1(-lon), r1(-lat)];

  const probe = geoAzimuthalEqualArea().rotate(rotate);
  const [[x0, y0], [x1, y1]] = geoPath(probe).bounds(fitTo);
  const aspect = (y1 - y0) / Math.max(1e-9, x1 - x0);
  const height = Math.round(
    Math.min(760, Math.max(460, (WIDTH - PAD * 2) * aspect + PAD * 2)),
  );
  const fitted = geoAzimuthalEqualArea()
    .rotate(rotate)
    .fitExtent(
      [
        [PAD, PAD],
        [WIDTH - PAD, height - PAD],
      ],
      fitTo,
    );
  const scale = Math.round(fitted.scale() * 10) / 10;
  const translate = fitted.translate().map(r1);
  const projection = geoAzimuthalEqualArea()
    .rotate(rotate)
    .scale(scale)
    .translate(translate)
    .precision(0.3)
    .clipExtent([
      [-6, -6],
      [WIDTH + 6, height + 6],
    ]);
  const measure = geoPath(projection);

  const neighbours = [];
  for (const [other, f] of Object.entries(shapes)) {
    if (other === abbrev) continue;
    const d = draw(projection, f, 8);
    if (!d) continue;
    const area = measure.area(f);
    const [cx, cy] = measure.centroid(f);
    const inside = cx > 50 && cx < WIDTH - 50 && cy > 24 && cy < height - 24;
    neighbours.push([
      other,
      d,
      area > 6000 && inside ? [Math.round(cx), Math.round(cy)] : null,
    ]);
  }

  // Name the foreign country in view, if one is.
  const countries = [];
  for (const f of foreign.features) {
    const area = measure.area(f);
    const [cx, cy] = measure.centroid(f);
    if (area > 9000 && cx > 50 && cx < WIDTH - 50 && cy > 24 && cy < height - 24) {
      const name = {MEX: 'Mexico', GRL: 'Greenland', CUB: 'Cuba', BHS: 'Bahamas', RUS: 'Russia'}[f.properties.ADM0_A3];
      if (name) countries.push([name, Math.round(cx), Math.round(cy)]);
    }
  }

  maps[abbrev] = {
    w: WIDTH,
    h: height,
    r: rotate,
    s: scale,
    t: translate,
    d: draw(projection, self, 4),
    n: neighbours,
    f: draw(projection, foreign, 8),
    c: countries,
    l: draw(projection, lakes, 10),
    g: draw(
      projection,
      geoGraticule().step([2, 2]).extent([
        [-180, 10],
        [-40, 86],
      ])(),
      -1,
    ),
  };
}

// The graticule is lines, not rings: draw it unclosed.
for (const [abbrev] of Object.entries(maps)) {
  const m = maps[abbrev];
  m.g = m.g.replace(/Z/g, '');
}

// Every town must land on its own region's land at this detail.
const moved = [];
for (const [place, coords] of Object.entries(towns)) {
  const region = place.slice(place.lastIndexOf(', ') + 2);
  const f = shapes[region];
  if (!f || geoContains(f, coords.slice(0, 2))) continue;
  let fixed = null;
  for (let r = 0.01; r <= 0.6 && !fixed; r += 0.01) {
    for (let a = 0; a < 360 && !fixed; a += 15) {
      const p = [
        coords[0] + (r * Math.cos((a * Math.PI) / 180)) / Math.cos((coords[1] * Math.PI) / 180),
        coords[1] + r * Math.sin((a * Math.PI) / 180),
      ];
      if (geoContains(f, p)) fixed = p;
    }
  }
  if (fixed) {
    coords[0] = Math.round(fixed[0] * 1000) / 1000;
    coords[1] = Math.round(fixed[1] * 1000) / 1000;
    moved.push(place);
  } else console.log('cannot place', place);
}

const body = `/* Generated by scripts/map/region_maps.mjs from Natural Earth 1:10m
 * (public domain) and GeoNames town coordinates (CC BY 4.0, geonames.org).
 * One pre-drawn map per region page; do not hand-edit. Server only. */

export interface RegionDrawing {
  /** Canvas size. */
  w: number;
  h: number;
  /** Azimuthal equal-area projection: rotate, scale, translate. */
  r: [number, number];
  s: number;
  t: [number, number];
  /** The region itself. */
  d: string;
  /** Neighbouring regions in view: postal code, path, label point. */
  n: [string, string, [number, number] | null][];
  /** Other countries, as one path, and labels for any large one in view. */
  f: string;
  c: [string, number, number][];
  /** Lakes and graticule. */
  l: string;
  g: string;
}

export const REGION_DRAWINGS: Record<string, RegionDrawing> = ${JSON.stringify(maps)};

/** "Akron, OH" → [longitude, latitude, population]. */
export const TOWN_COORDS: Record<string, [number, number, number]> = ${JSON.stringify(towns)};
`;
fs.writeFileSync(process.argv[2], body);
console.log('nudged', moved.length, 'towns onto land');
const sizes = Object.entries(maps)
  .map(([k, m]) => [k, JSON.stringify(m).length])
  .sort((a, b) => b[1] - a[1]);
console.log(process.argv[2], body.length, 'bytes; largest', sizes.slice(0, 6), 'smallest', sizes.slice(-3));
