import {REGIONS, type Region} from './catalog';
import {regionNote} from './region-copy';

/**
 * Town-level copy for the product page.
 *
 * Every product this store sells has a place attached, which is the one thing
 * a normal PDP cannot do. This module turns a product title into that place
 * and gives the page four things about it: a parks-sign plaque, a fact of
 * dubious value, two or three sentences of apologetic tourism copy, and a
 * souvenir-stand sell line.
 *
 * Real product data this is built against (queried from the live store):
 *   toledo-oh-varsity      "Toledo, OH — Varsity"
 *   pittsburgh-pa-varsity  "Pittsburgh, PA — Varsity"
 *   detroit-mi-varsity     "Detroit, MI — Varsity"
 *   gary-in-varsity        "Gary, IN — Varsity"
 *   rockford-il-varsity    "Rockford, IL — Varsity"
 *
 * Two rules, both load-bearing:
 *
 *  1. **Never mean toward the place.** The humour is in the sincerity
 *     (BRAND.md). Every line has to be something a local would nod at.
 *  2. **Never invent a fact about a real town.** Hand-tuned towns get real
 *     founding years because they were checked. Everything else reads
 *     "EST. UNRECORDED" rather than a plausible-looking fabrication — the
 *     joke survives, and we do not put false history on a shirt page.
 */

export interface TownCopy {
  /** Real founding year, only where it has been verified. */
  founded?: number;
  /** The plaque's one-line fact. Sentence case, no final period. */
  fact: string;
  /** 2–3 sentences of apologetic tourism board, for the accordion. */
  tourism: string;
  /** Optional override for the souvenir-stand sell line. */
  sell?: string;
}

/** Hand-tuned entries, keyed by product handle. */
const HAND_TUNED: Record<string, TownCopy> = {
  'toledo-oh-varsity': {
    founded: 1833,
    fact: 'has a glass museum better than the one in your city, and free',
    tourism:
      'Toledo is on the way from Detroit to almost anywhere, which has been ' +
      'its structural misfortune for about a century. What nobody mentions is ' +
      'the glass — the city made it for a hundred years, made it well, and ' +
      'built a genuinely excellent museum to say so. Admission is free and on ' +
      'a Tuesday afternoon you will have it largely to yourself.',
    sell: 'Commemorate Toledo. Someone should.',
  },
  'pittsburgh-pa-varsity': {
    founded: 1758,
    fact: 'has 446 bridges, which is more than Venice and nobody believes it',
    tourism:
      'Pittsburgh spent a century being described entirely in terms of steel ' +
      'and then quietly became something else without issuing a statement. ' +
      'It has more bridges than Venice, three rivers that meet at a point, ' +
      'and hills that make every arrival feel slightly staged. People from ' +
      'there are not defensive about it so much as tired of explaining.',
  },
  'detroit-mi-varsity': {
    founded: 1701,
    fact: 'is older than the country it is in, by seventy-five years',
    tourism:
      'Detroit was founded in 1701, which makes it older than the United ' +
      'States by three-quarters of a century — a fact that reframes most ' +
      'sentences written about it. It put the world on wheels and has been ' +
      'discussed in the past tense ever since, largely by people who have not ' +
      'been. The people who live there have noticed.',
  },
  'gary-in-varsity': {
    founded: 1906,
    fact: 'was built on purpose, by a steel company, and named after its chairman',
    tourism:
      'Gary was not settled so much as commissioned: drawn, sited and named ' +
      'in 1906 by a steel company that needed somewhere for the steel to ' +
      'happen. It sits on Lake Michigan next to a national park most people ' +
      'do not know is there, thirty miles from Chicago and permanently ' +
      'compared to it. It made the steel for a century. That is the shirt.',
    sell: 'Commemorate Gary. Genuinely, someone should.',
  },
  'rockford-il-varsity': {
    founded: 1834,
    fact: 'has a Japanese garden people call "surprising for Rockford"',
    tourism:
      'Rockford made the machine tools and the fasteners — the things that ' +
      'made the famous things, which is a category of city nobody prints a ' +
      'shirt for. There is a river through the middle and a Japanese garden ' +
      'good enough that visitors describe it as surprising, which tells you ' +
      'more about the describers than the garden.',
  },
};

/** Pull the town out of "Toledo, OH — Varsity" or "toledo-oh-varsity". */
export function townNameFrom(title: string, handle: string): string {
  const beforeComma = title.split(',')[0]?.trim();
  if (beforeComma && beforeComma.length > 1 && beforeComma !== title.trim()) {
    return beforeComma;
  }

  // Title had no comma — fall back to the handle, dropping the region code
  // and the template suffix.
  const abbrevs = new Set(REGIONS.map((r) => r.abbrev.toLowerCase()));
  const parts = handle.split('-');
  const cut = parts.findIndex((part) => part.length === 2 && abbrevs.has(part));

  // No region code either, so this is not a town-shaped product — a gift card,
  // a bundle, whatever gets added later. Taking the first handle segment would
  // render "Gift Card" as "Gift"; show the real title instead.
  if (cut <= 0) return title.trim();

  return parts
    .slice(0, cut)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Copy for a product's town. Hand-tuned where we have it, otherwise built
 * from the region's own line so 1,600 products do not share one paragraph.
 */
export function townCopyFor(
  handle: string,
  town: string,
  region: Region | undefined,
): TownCopy {
  const tuned = HAND_TUNED[handle];
  if (tuned) return tuned;

  const note = region ? regionNote(region) : 'being somewhere';
  const where = region ? region.name : 'the surrounding area';

  return {
    fact: `is in ${where}, which is known for ${note}`,
    tourism:
      `${town} is a real place in ${where}, and we will be honest: we have ` +
      `not been. What we can tell you is that ${where} is known, if it is ` +
      `known at all, for ${note} — and that ${town} has been getting on with ` +
      `it regardless for longer than anyone has been keeping score. If you ` +
      `are from there and we have undersold it, that is the intended effect.`,
  };
}

/** Was this town's copy written by hand, or generated? Used in the report. */
export function isHandTuned(handle: string): boolean {
  return handle in HAND_TUNED;
}

export function handTunedHandles(): string[] {
  return Object.keys(HAND_TUNED);
}

/** The plaque's EST. line. Never fabricates a year. */
export function foundedLabel(copy: TownCopy): string {
  return copy.founded ? `EST. ${copy.founded}` : 'EST. UNRECORDED';
}

/**
 * The souvenir-stand sell line — the first thing in the description.
 * "Commemorate [Town]. Someone should."
 */
export function sellLine(town: string, copy: TownCopy): string {
  return copy.sell ?? `Commemorate ${town}. Someone should.`;
}

/** Care copy, in voice. */
export const CARE_LINES = [
  'Machine wash cold, like the reception you got there.',
  'Tumble dry low. Hang dry if you have grown attached.',
  'Do not bleach. The fade was applied by professionals.',
  'Iron inside out, low, never on the print.',
];

/** The spec block — identical across the catalogue, which is the point. */
export const SPEC_LINES: [string, string][] = [
  ['Blank', 'Comfort Colors 1717, garment-dyed'],
  ['Weight', '6.1 oz heavyweight, 100% ring-spun cotton'],
  ['Fit', 'Unisex, true to size, relaxes about half a size'],
  ['Print', 'Screen-print aesthetic, slightly off-register on purpose'],
  ['Made', 'Printed to order in North America'],
];

/**
 * The full product description, assembled rather than written per SKU:
 * sell line → the town → spec → care. 1,600 products, one voice.
 */
export function buildDescription(
  town: string,
  copy: TownCopy,
  region: Region | undefined,
): string {
  return [
    sellLine(town, copy),
    copy.tourism,
    `A ${SPEC_LINES[1][1]} on a ${SPEC_LINES[0][1]}. ${SPEC_LINES[2][1]}.`,
    CARE_LINES[0],
    region ? `Ships worldwide. Free over $60 in Canada and the US.` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/** Meta title — town name and region carry the search intent. */
export function productMetaTitle(town: string, region: Region | undefined): string {
  return region
    ? `${town}, ${region.abbrev} T-Shirt — ${region.name} Souvenir Tee`
    : `${town} T-Shirt — Souvenir Tee`;
}

export function productMetaDescription(
  town: string,
  copy: TownCopy,
  region: Region | undefined,
): string {
  const where = region ? `${region.name}` : 'somewhere';
  return (
    `${sellLine(town, copy)} A faux-vintage ${town}, ${where} souvenir ` +
    `t-shirt on garment-dyed heavyweight cotton. ${town} ${copy.fact}. ` +
    `Printed to order, ships with a Certificate of Mediocre Authenticity.`
  );
}

const abbrevToRegion = new Map(
  REGIONS.map((region) => [region.abbrev.toUpperCase(), region]),
);

/**
 * The region a product belongs to.
 *
 * Lives here rather than in the query layer so client components can share
 * one parser with the product page — the card and the PDP disagreeing about a
 * product's own name is exactly the drift this prevents.
 *
 * "Toledo, OH — Varsity" → OH. Falls back to the handle
 * ("toledo-oh-varsity"), where the region sits between the city and the
 * template. Returns undefined rather than guessing, so a Gift Card never
 * lands in Ohio.
 */
export function regionForProduct(product: {
  title: string;
  handle: string;
}): Region | undefined {
  const fromTitle = /,\s*([A-Za-z]{2})\b/.exec(product.title);
  if (fromTitle) {
    const region = abbrevToRegion.get(fromTitle[1].toUpperCase());
    if (region) return region;
  }

  for (const segment of product.handle.split('-')) {
    if (segment.length === 2) {
      const region = abbrevToRegion.get(segment.toUpperCase());
      if (region) return region;
    }
  }

  return undefined;
}

