import {britishColumbiaTowns} from './data.british-columbia';
import {REGIONS, regionPath} from './regions';
import type {Region, TownProduct} from './types';

export * from './types';
export {REGIONS, regionPath};

/**
 * The full catalog. Add a region by importing its data file here —
 * navigation, search, sitemaps, and SEO pick it up automatically.
 * Built to hold 200+ SKUs; everything below stays O(catalog) or better.
 */
const ALL_TOWNS: TownProduct[] = [...britishColumbiaTowns];

const byHandle = new Map(ALL_TOWNS.map((t) => [t.handle, t]));

export function getAllTowns(): TownProduct[] {
  return ALL_TOWNS;
}

export function getTownByHandle(handle: string): TownProduct | undefined {
  return byHandle.get(handle);
}

export function getTownsByRegion(regionSlug: string): TownProduct[] {
  return ALL_TOWNS.filter((t) => t.provinceSlug === regionSlug).sort((a, b) =>
    a.city.localeCompare(b.city),
  );
}

export function getRegion(
  slug: string,
  kind?: Region['kind'],
): Region | undefined {
  return REGIONS.find(
    (r) => r.slug === slug && (kind === undefined || r.kind === kind),
  );
}

export function getRegionsByCountry(country: Region['country']): Region[] {
  return REGIONS.filter((r) => r.country === country);
}

export function getOpenRegions(): Region[] {
  return REGIONS.filter((r) => r.status === 'open');
}

export function getNewArrivals(): TownProduct[] {
  return ALL_TOWNS.filter((t) => t.newArrival);
}

export function getMostOverlooked(): TownProduct[] {
  return ALL_TOWNS.filter((t) => t.mostOverlooked);
}
