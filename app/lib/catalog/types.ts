/**
 * Catalog domain model for Mediocre Souvenir Co.
 *
 * The catalog is the product: every SKU is a real, overlooked town.
 * The whole navigation and SEO layer keys off the fields below, so a new
 * town added to a data file is a fully SEO-complete landing page with zero
 * manual work.
 *
 * Data source today: local data files + a mock.shop variant as the
 * purchasable unit. When the real Shopify + Printify store exists, only
 * `resolvePurchasableVariant` in index.ts needs to change — these types and
 * every consumer stay put.
 */

export type PopulationTier =
  | 'village' // < 5,000
  | 'small-town' // 5,000 – 25,000
  | 'proper-town' // 25,000 – 100,000
  | 'technically-a-city'; // 100,000+

/** The three repeatable shirt design templates from the brand doc. */
export type ShirtStyle = 'classic-varsity' | 'retro-postcard' | 'faded-slogan';

/**
 * Comfort Colors 1717 garment-dyed colorways in the faded house palette.
 * The blank itself does the vintage work.
 */
export type Colorway = 'ivory' | 'butter' | 'blue-jean' | 'brick' | 'sage';

export interface TownProduct {
  /** URL handle, always `[city-slug]-t-shirt` */
  handle: string;
  city: string;
  /** Slug of the parent region, e.g. `british-columbia` */
  provinceSlug: string;
  provinceState: string;
  provinceAbbrev: string;
  country: 'Canada' | 'United States';
  /** Approximate population — printed on the Certificate of Souvenir */
  population: number;
  populationTier: PopulationTier;
  /** Year of incorporation, printed as EST. XXXX */
  estYear: number;
  /** The one thing. Deadpan, affectionate, never mean. */
  knownFor: string;
  style: ShirtStyle;
  colorway: Colorway;
  /** Faded Slogan template text (style C towns only) */
  slogan?: {lead: string; big: string; tail: string; marker?: string};
  /** Curated into the MOST OVERLOOKED rack on the homepage */
  mostOverlooked?: boolean;
  /** Current launch batch — the NEW ARRIVALS rack */
  newArrival?: boolean;
}

export interface Region {
  slug: string;
  name: string;
  abbrev: string;
  country: 'Canada' | 'United States';
  /** Determines the URL prefix: /provinces/... or /states/... (territories ride with provinces) */
  kind: 'province' | 'state';
  status: 'open' | 'next' | 'someday';
}

/**
 * One price, one currency: $36 USD to both markets. The store's currency is
 * USD and USD is its only presentment currency, so a Canadian buyer is quoted
 * and charged US dollars too — say so wherever a number appears, because "$36"
 * reads as CAD in Canada and a surprise at checkout is how you earn a
 * chargeback. (Selling CAD at home would mean changing the shop currency and
 * adding a fixed-price USD catalogue for the US market.)
 */
export const PRICE = {amount: '36.00', currencyCode: 'USD'} as const;
export const DISPLAY_PRICE = '$36 USD';

export function localeFor(country: Region['country']): string {
  return country === 'United States' ? 'en-US' : 'en-CA';
}

export const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'] as const;
export type Size = (typeof SIZES)[number];

/** Collect-more ladder. Honored by a Shopify automatic discount at checkout. */
export const LADDER = [
  {qty: 1, label: '1 Souvenir', deal: 'Full price', discount: 0},
  {qty: 2, label: '2+ Souvenirs', deal: 'Save 15%', discount: 0.15},
  {qty: 3, label: '3+ Souvenirs', deal: 'Save 20%', discount: 0.2},
] as const;

export const COLORWAY_LABELS: Record<Colorway, string> = {
  ivory: 'Ivory',
  butter: 'Butter',
  'blue-jean': 'Blue Jean',
  brick: 'Brick',
  sage: 'Sage',
};

export const TIER_LABELS: Record<PopulationTier, string> = {
  village: 'Village',
  'small-town': 'Small Town',
  'proper-town': 'Proper Town',
  'technically-a-city': 'Technically a City',
};

export function populationTierFor(population: number): PopulationTier {
  if (population < 5_000) return 'village';
  if (population < 25_000) return 'small-town';
  if (population < 100_000) return 'proper-town';
  return 'technically-a-city';
}
