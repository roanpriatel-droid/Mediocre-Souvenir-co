import {REGIONS, type Region} from './catalog';

/**
 * Where the visitor is, according to the edge.
 *
 * Oxygen sets `oxygen-buyer-region` to the ISO subdivision code — "OH", "BC",
 * "TX" — which maps directly onto our region abbreviations. For a store whose
 * entire premise is place, greeting somebody with their own state is the one
 * personalisation nobody else can do.
 *
 * Everything here is best-effort. A visitor behind a VPN, a bot, or a local
 * dev request simply gets no region, and every consumer renders the generic
 * version. Nothing is gated on it and nothing breaks without it.
 */

const byAbbrev = new Map(
  REGIONS.map((region) => [region.abbrev.toUpperCase(), region]),
);
const byName = new Map(
  REGIONS.map((region) => [region.name.toLowerCase(), region]),
);

export function buyerRegion(request: Request): Region | undefined {
  // Oxygen sends BOTH: `oxygen-buyer-region-code` is "BC", while
  // `oxygen-buyer-region` is the full name "British Columbia". An earlier
  // version read only the latter and expected a two-letter code, so it never
  // matched and the personalised hero never fired. Try the code first, then
  // fall back to matching the name.
  const code = request.headers
    .get('oxygen-buyer-region-code')
    ?.split('-')
    .pop()
    ?.trim()
    .toUpperCase();

  let region = code && code.length === 2 ? byAbbrev.get(code) : undefined;

  if (!region) {
    const name = request.headers.get('oxygen-buyer-region')?.trim();
    if (name) region = byName.get(name.toLowerCase());
  }

  if (!region) return undefined;

  // Guard against a country/region mismatch — "ON" is Ontario, but only if the
  // buyer is actually in Canada.
  const country = request.headers.get('oxygen-buyer-country')?.toUpperCase();
  if (country === 'CA' && region.country !== 'Canada') return undefined;
  if (country === 'US' && region.country !== 'United States') return undefined;

  return region;
}

export function buyerCity(request: Request): string | undefined {
  const city = request.headers.get('oxygen-buyer-city')?.trim();
  if (!city) return undefined;
  // Edge values arrive upper-cased often enough to be worth normalising.
  return city
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
