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

export function buyerRegion(request: Request): Region | undefined {
  const raw = request.headers.get('oxygen-buyer-region');
  if (!raw) return undefined;

  // Some edges send "US-OH" rather than "OH".
  const code = raw.split('-').pop()?.trim().toUpperCase();
  if (!code || code.length !== 2) return undefined;

  const region = byAbbrev.get(code);
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
