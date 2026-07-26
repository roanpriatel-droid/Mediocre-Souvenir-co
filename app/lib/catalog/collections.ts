import {
  COLORWAY_LABELS,
  TIER_LABELS,
  type Colorway,
  type PopulationTier,
  type ShirtStyle,
  type TownProduct,
} from './types';

/**
 * Curated collections, derived from the catalog rather than from Shopify.
 *
 * A gift shop files the same shirts three ways — by design, by colour, by how
 * big the place is — and so does this. Every collection is a predicate over
 * TownProduct, so adding a town to a data file files it into every collection
 * it belongs in, with no manual curation and no second source of truth.
 *
 * These are the /collections/* landing pages. They exist for the shopper who
 * does not have a specific town in mind, and for the search engine that wants
 * a page for "sage souvenir t-shirt" — the /shop filters cover the same ground
 * but live behind query params, which rank for nothing.
 */

export type CollectionGroup = 'template' | 'colorway' | 'size' | 'curated';

export interface CatalogCollection {
  handle: string;
  /** H1 on the collection page. */
  title: string;
  /** Short label for grids and breadcrumbs. */
  navLabel: string;
  kicker: string;
  /** Lead paragraph on the collection page. */
  blurb: string;
  /** Meta description; the town count is appended by the route. */
  metaDescription: string;
  group: CollectionGroup;
  /** Membership test. */
  includes: (town: TownProduct) => boolean;
  /** Equivalent /shop query string, so the two systems agree. */
  shopParams?: string;
}

const GROUP_LABELS: Record<CollectionGroup, string> = {
  curated: 'Curated racks',
  template: 'By design template',
  colorway: 'By colorway',
  size: 'By size of the place',
};

export function collectionGroupLabel(group: CollectionGroup): string {
  return GROUP_LABELS[group];
}

const STYLE_COLLECTIONS: Record<
  ShirtStyle,
  {handle: string; title: string; navLabel: string; blurb: string; meta: string}
> = {
  'classic-varsity': {
    handle: 'classic-varsity',
    title: 'The Classic Varsity rack',
    navLabel: 'Classic Varsity',
    blurb:
      'Arched lettering over the landmark, est. year underneath, laid out the ' +
      'way every high school gym in North America already taught you to read. ' +
      'The template that makes a town of nine thousand look like a franchise ' +
      'with a winning record.',
    meta:
      'Souvenir t-shirts in the Classic Varsity template — arched town ' +
      'lettering, the local landmark, and the year the place was incorporated.',
  },
  'retro-postcard': {
    handle: 'retro-postcard',
    title: 'The Retro Postcard rack',
    navLabel: 'Retro Postcard',
    blurb:
      'Greetings from a place nobody sends greetings from. Souvenir stripe ' +
      'across the chest, the town name set the way a 1970s rack card would ' +
      'have set it, printed on a shirt instead of mailed to an aunt.',
    meta:
      'Souvenir t-shirts in the Retro Postcard template — greetings-from ' +
      'lettering and the souvenir stripe, for towns nobody sends postcards from.',
  },
  'faded-slogan': {
    handle: 'faded-slogan',
    title: 'The Faded Slogan rack',
    navLabel: 'Faded Slogan',
    blurb:
      'One deadpan line, printed at 88% ink so it arrives already two hundred ' +
      'washes in. No landmark, no arch, no year. Just a sentence about a place ' +
      'that is true enough to be funny and kind enough to wear home.',
    meta:
      'Souvenir t-shirts in the Faded Slogan template — one deadpan line, ' +
      'printed at 88% ink so it looks two hundred washes old on arrival.',
  },
};

const COLORWAY_BLURBS: Record<Colorway, {blurb: string; meta: string}> = {
  ivory: {
    blurb:
      'The default of the entire souvenir industry, and still the right ' +
      'answer. Garment-dyed off-white that yellows honestly instead of going ' +
      'grey. Wear it until the collar tells the truth about you.',
    meta:
      'Souvenir t-shirts on garment-dyed Ivory — the off-white the whole ' +
      'souvenir industry defaults to, and still the right answer.',
  },
  butter: {
    blurb:
      'A pale, sunned yellow that reads as a shirt somebody left on a dash in ' +
      'August. Flatters exactly one thing: brick-red ink. We use it a lot.',
    meta:
      'Souvenir t-shirts on garment-dyed Butter — pale sunned yellow, the ' +
      'colour of a shirt left on a dashboard in August.',
  },
  'blue-jean': {
    blurb:
      'Washed indigo, the colour of every reliable object in a small town: the ' +
      'work shirt, the cooler, the tarp over the boat. It goes with the rest ' +
      'of your life without being asked.',
    meta:
      'Souvenir t-shirts on garment-dyed Blue Jean — washed indigo, the ' +
      'colour of every dependable object in a small town.',
  },
  brick: {
    blurb:
      'Washed brick, taken straight off the main-street facade that has been ' +
      'holding up the same hardware store since before anyone asked it to. ' +
      'The loudest colour we make, which is not very.',
    meta:
      'Souvenir t-shirts on garment-dyed Brick — the washed red of a ' +
      'main-street facade that has outlasted three businesses.',
  },
  sage: {
    blurb:
      'Motel sage. The colour of the towel, the bedspread, and the paint on ' +
      'the office door, chosen once in 1974 and never revisited because it was ' +
      'correct.',
    meta:
      'Souvenir t-shirts on garment-dyed Sage — motel green, chosen once in ' +
      '1974 and never revisited because it was correct.',
  },
};

const TIER_BLURBS: Record<PopulationTier, {blurb: string; meta: string}> = {
  village: {
    blurb:
      'Under five thousand people. Small enough that the shirt will be ' +
      'recognised on sight by anyone who has ever driven through, and small ' +
      'enough that most of them have not.',
    meta:
      'Souvenir t-shirts for villages under 5,000 people — the smallest ' +
      'places on the rack, commemorated at full seriousness.',
  },
  'small-town': {
    blurb:
      'Five to twenty-five thousand. The heartland of this catalog: big enough ' +
      'for a rink, an arena, and a genuinely contested opinion about pizza; ' +
      'small enough that nobody ever printed the shirt.',
    meta:
      'Souvenir t-shirts for small towns of 5,000 to 25,000 — the heartland ' +
      'of the catalog, and the places most often skipped.',
  },
  'proper-town': {
    blurb:
      'Twenty-five to a hundred thousand. A proper town: two exits, a hospital, ' +
      'a downtown that is doing better than people say. Overlooked at a larger ' +
      'scale, which is its own achievement.',
    meta:
      'Souvenir t-shirts for proper towns of 25,000 to 100,000 — two exits, a ' +
      'hospital, and a downtown doing better than people say.',
  },
  'technically-a-city': {
    blurb:
      'Over a hundred thousand people and still nobody sells the shirt. ' +
      'Technically a city. Functionally a place you drive through on the way ' +
      'to a place with a gift shop.',
    meta:
      'Souvenir t-shirts for places over 100,000 that still have no souvenir ' +
      'shirt — technically cities, functionally overlooked.',
  },
};

function buildCollections(): CatalogCollection[] {
  const collections: CatalogCollection[] = [
    {
      handle: 'most-overlooked',
      title: 'The Most Overlooked rack',
      navLabel: 'Most Overlooked',
      kicker: 'Curated',
      blurb:
        'The towns that had the least chance of ever getting a souvenir — no ' +
        'waterfall, no wine region, no reason for a bus to stop. Hand-picked ' +
        'from the catalog for exactly that reason, and given the full ' +
        'treatment anyway.',
      metaDescription:
        'The most overlooked towns in the catalog — no waterfall, no wine ' +
        'region, no reason for a bus to stop, and a souvenir t-shirt anyway.',
      group: 'curated',
      includes: (town) => Boolean(town.mostOverlooked),
    },
  ];

  for (const style of Object.keys(STYLE_COLLECTIONS) as ShirtStyle[]) {
    const meta = STYLE_COLLECTIONS[style];
    collections.push({
      handle: meta.handle,
      title: meta.title,
      navLabel: meta.navLabel,
      kicker: 'Design template',
      blurb: meta.blurb,
      metaDescription: meta.meta,
      group: 'template',
      includes: (town) => town.style === style,
      shopParams: `style=${style}`,
    });
  }

  for (const colorway of Object.keys(COLORWAY_LABELS) as Colorway[]) {
    const label = COLORWAY_LABELS[colorway];
    collections.push({
      handle: `${colorway}-tees`,
      title: `The ${label} rack`,
      navLabel: label,
      kicker: 'Colorway',
      blurb: COLORWAY_BLURBS[colorway].blurb,
      metaDescription: COLORWAY_BLURBS[colorway].meta,
      group: 'colorway',
      includes: (town) => town.colorway === colorway,
      shopParams: `colorway=${colorway}`,
    });
  }

  for (const tier of Object.keys(TIER_LABELS) as PopulationTier[]) {
    collections.push({
      handle: `${tier}-tees`,
      title: `The ${TIER_LABELS[tier]} rack`,
      navLabel: TIER_LABELS[tier],
      kicker: 'Size of the place',
      blurb: TIER_BLURBS[tier].blurb,
      metaDescription: TIER_BLURBS[tier].meta,
      group: 'size',
      includes: (town) => town.populationTier === tier,
      shopParams: `tier=${tier}`,
    });
  }

  return collections;
}

const COLLECTIONS = buildCollections();

const collectionByHandle = new Map(COLLECTIONS.map((c) => [c.handle, c]));

/**
 * Handles that belong to a page that already exists. Shopify stores
 * conventionally expose /collections/all and /collections/new-arrivals, and
 * inbound links assume them — send them to the real page rather than build a
 * duplicate of it.
 */
export const COLLECTION_REDIRECTS: Record<string, string> = {
  all: '/shop',
  'all-towns': '/shop',
  'new-arrivals': '/new-arrivals',
  new: '/new-arrivals',
  frontpage: '/',
};

export function getCollections(): CatalogCollection[] {
  return COLLECTIONS;
}

export function getCollection(handle: string): CatalogCollection | undefined {
  return collectionByHandle.get(handle);
}

export function getCollectionsByGroup(
  group: CollectionGroup,
): CatalogCollection[] {
  return COLLECTIONS.filter((c) => c.group === group);
}

export const COLLECTION_GROUP_ORDER: CollectionGroup[] = [
  'curated',
  'template',
  'colorway',
  'size',
];

/** Towns in a collection, filed A–Z the way a rack is. */
export function townsInCollection(
  collection: CatalogCollection,
  allTowns: TownProduct[],
): TownProduct[] {
  return allTowns
    .filter(collection.includes)
    .sort((a, b) => a.city.localeCompare(b.city));
}
