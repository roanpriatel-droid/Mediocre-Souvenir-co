import type {Region} from './types';

/**
 * Every region we will ever open, in launch order: British Columbia first,
 * then Alberta, then east across Canada, then south. Flipping a status to
 * 'open' lights up its /provinces or /states page, browse card, footer link,
 * and sitemap entry — no other change needed.
 */

const ca = (
  slug: string,
  name: string,
  abbrev: string,
  status: Region['status'] = 'someday',
  kind: Region['kind'] = 'province',
): Region => ({slug, name, abbrev, country: 'Canada', kind, status});

const us = (slug: string, name: string, abbrev: string): Region => ({
  slug,
  name,
  abbrev,
  country: 'United States',
  kind: 'state',
  status: 'someday',
});

export const REGIONS: Region[] = [
  // Canada
  ca('british-columbia', 'British Columbia', 'BC', 'open'),
  ca('alberta', 'Alberta', 'AB', 'next'),
  ca('saskatchewan', 'Saskatchewan', 'SK'),
  ca('manitoba', 'Manitoba', 'MB'),
  ca('ontario', 'Ontario', 'ON'),
  ca('quebec', 'Quebec', 'QC'),
  ca('new-brunswick', 'New Brunswick', 'NB'),
  ca('nova-scotia', 'Nova Scotia', 'NS'),
  ca('prince-edward-island', 'Prince Edward Island', 'PE'),
  ca('newfoundland-and-labrador', 'Newfoundland and Labrador', 'NL'),
  ca('yukon', 'Yukon', 'YT'),
  ca('northwest-territories', 'Northwest Territories', 'NT'),
  ca('nunavut', 'Nunavut', 'NU'),
  // United States
  us('alabama', 'Alabama', 'AL'),
  us('alaska', 'Alaska', 'AK'),
  us('arizona', 'Arizona', 'AZ'),
  us('arkansas', 'Arkansas', 'AR'),
  us('california', 'California', 'CA'),
  us('colorado', 'Colorado', 'CO'),
  us('connecticut', 'Connecticut', 'CT'),
  us('delaware', 'Delaware', 'DE'),
  us('florida', 'Florida', 'FL'),
  us('georgia', 'Georgia', 'GA'),
  us('hawaii', 'Hawaii', 'HI'),
  us('idaho', 'Idaho', 'ID'),
  us('illinois', 'Illinois', 'IL'),
  us('indiana', 'Indiana', 'IN'),
  us('iowa', 'Iowa', 'IA'),
  us('kansas', 'Kansas', 'KS'),
  us('kentucky', 'Kentucky', 'KY'),
  us('louisiana', 'Louisiana', 'LA'),
  us('maine', 'Maine', 'ME'),
  us('maryland', 'Maryland', 'MD'),
  us('massachusetts', 'Massachusetts', 'MA'),
  us('michigan', 'Michigan', 'MI'),
  us('minnesota', 'Minnesota', 'MN'),
  us('mississippi', 'Mississippi', 'MS'),
  us('missouri', 'Missouri', 'MO'),
  us('montana', 'Montana', 'MT'),
  us('nebraska', 'Nebraska', 'NE'),
  us('nevada', 'Nevada', 'NV'),
  us('new-hampshire', 'New Hampshire', 'NH'),
  us('new-jersey', 'New Jersey', 'NJ'),
  us('new-mexico', 'New Mexico', 'NM'),
  us('new-york', 'New York', 'NY'),
  us('north-carolina', 'North Carolina', 'NC'),
  us('north-dakota', 'North Dakota', 'ND'),
  us('ohio', 'Ohio', 'OH'),
  us('oklahoma', 'Oklahoma', 'OK'),
  us('oregon', 'Oregon', 'OR'),
  us('pennsylvania', 'Pennsylvania', 'PA'),
  us('rhode-island', 'Rhode Island', 'RI'),
  us('south-carolina', 'South Carolina', 'SC'),
  us('south-dakota', 'South Dakota', 'SD'),
  us('tennessee', 'Tennessee', 'TN'),
  us('texas', 'Texas', 'TX'),
  us('utah', 'Utah', 'UT'),
  us('vermont', 'Vermont', 'VT'),
  us('virginia', 'Virginia', 'VA'),
  us('washington', 'Washington', 'WA'),
  us('west-virginia', 'West Virginia', 'WV'),
  us('wisconsin', 'Wisconsin', 'WI'),
  us('wyoming', 'Wyoming', 'WY'),
];

/**
 * Where a region lives.
 *
 * Regions used to have their own landing pages under /provinces and /states.
 * They are Shopify smart collections now — one per region, handle equal to the
 * slug — so the collection page *is* the region page. The old URLs still route
 * and 301 here (see provinces.$slug.tsx), and this stays the single definition
 * so links, JSON-LD, and the sitemap cannot disagree.
 */
export function regionPath(region: Pick<Region, 'slug'>): string {
  return `/collections/${region.slug}`;
}
