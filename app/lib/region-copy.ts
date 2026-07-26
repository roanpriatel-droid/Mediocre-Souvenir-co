import {REGIONS, type Region} from './catalog';

/**
 * Region copy — the tourism board that undersells.
 *
 * Every region collection page carries a description under its title. The
 * voice is a real tourism board that has run out of superlatives and decided
 * honesty is cheaper: proudly underwhelming, never mean about the place. The
 * humour is entirely in the sincerity (BRAND.md), so every line has to be
 * something a person who lives there would nod at.
 *
 * Live regions get bespoke copy. Everything else runs through `template()`,
 * which is parameterised by a one-line `note` per region so 62 waitlist pages
 * do not read as 62 copies of the same paragraph.
 */

interface RegionCopy {
  /** Full bespoke description. Written for regions that are actually open. */
  description?: string;
  /**
   * The one true thing. Feeds the template for regions not yet open, and the
   * grid tiles. Lower case, no final period — it gets embedded mid-sentence.
   */
  note: string;
}

const COPY: Record<string, RegionCopy> = {
  // ── Canada ────────────────────────────────────────────────────────────
  'british-columbia': {
    note: 'more mountains than anyone can reasonably look at',
    description:
      'British Columbia is the province people mean when they say they want ' +
      'to move somewhere. Most of them mean Vancouver, and Vancouver is not ' +
      'in this collection. What is here is the rest of it: the mill towns, ' +
      'the highway towns, the ones with a lake nobody outside the valley has ' +
      'heard of and a hockey rink that has been resurfaced twice since 1974. ' +
      'Forty of them, from Tofino at the literal end of the road to Trail and ' +
      'its very large smelter, which has been operating since 1901 and is ' +
      'entirely unbothered by your opinion of it. Every shirt here is a real ' +
      'town where people live full lives, mostly without incident.',
  },
  alberta: {note: 'flat in a way that becomes impressive around hour four'},
  saskatchewan: {note: 'the horizon, available in every direction'},
  manitoba: {note: 'two seasons, both of them committed to the bit'},
  ontario: {note: 'a great many towns and one city that gets all the mail'},
  quebec: {note: 'excellent bread in towns of nine hundred people'},
  'new-brunswick': {note: 'covered bridges and a river that reverses, sincerely'},
  'nova-scotia': {note: 'fog with a strong sense of its own history'},
  'prince-edward-island': {note: 'red dirt, potatoes, one very famous orphan'},
  'newfoundland-and-labrador': {
    note: 'the friendliest people and the worst weather, in that order',
  },
  yukon: {note: 'a gold rush that ended and a landscape that did not'},
  'northwest-territories': {note: 'more lake than land, and nobody minds'},
  nunavut: {note: 'the largest territory, the fewest opinions about it'},

  // ── United States ─────────────────────────────────────────────────────
  alabama: {note: 'football, and a quiet confidence about the football'},
  alaska: {note: 'everything is further away than it looks on the map'},
  arizona: {note: 'a dry heat, which people will explain to you'},
  arkansas: {note: 'diamonds in a public field, genuinely, go dig'},
  california: {note: 'the parts of it nobody makes a movie about'},
  colorado: {note: 'a mountain town for every possible budget'},
  connecticut: {note: 'a long history of being on the way to somewhere else'},
  delaware: {note: 'no sales tax and a firm grip on being first'},
  florida: {note: 'the towns between the theme parks, which is most of it'},
  georgia: {note: 'peaches, and an unreasonable number of pecan trees'},
  hawaii: {note: 'already has souvenirs, but not for the leeward side'},
  idaho: {note: 'potatoes, and a great deal of unbothered wilderness'},
  illinois: {note: 'corn, and one city that ignores the corn'},
  indiana: {note: 'a basketball hoop on every garage, unironically'},
  iowa: {note: 'the state fair is genuinely the highlight and that is fine'},
  kansas: {note: 'famously flat, actually rolling, nobody checks'},
  kentucky: {note: 'bourbon, horses, and caves you did not expect'},
  louisiana: {note: 'the food is the whole argument and it wins'},
  maine: {note: 'lobster, fog, and a short but sincere summer'},
  maryland: {note: 'crabs, and strong feelings about the seasoning'},
  massachusetts: {note: 'every town claims a first of something'},
  michigan: {note: 'surrounded by fresh water and quietly smug about it'},
  minnesota: {note: 'ten thousand lakes, most of them unvisited'},
  mississippi: {note: 'the blues started here and never entirely left'},
  missouri: {note: 'the middle of everything, on the way to all of it'},
  montana: {note: 'the sky is doing most of the work'},
  nebraska: {note: 'a sandhill crane migration nobody talks about enough'},
  nevada: {note: 'the ninety-eight percent that is not the Strip'},
  'new-hampshire': {note: 'granite, autumn, and a motto that means it'},
  'new-jersey': {note: 'a diner every four miles and no bad ones'},
  'new-mexico': {note: 'green or red, and the correct answer is both'},
  'new-york': {note: 'the enormous upstate that the postcards forgot'},
  'north-carolina': {note: 'mountains on one end, sandbars on the other'},
  'north-dakota': {note: 'the least visited state, which is a kind of record'},
  ohio: {note: 'the birthplace of an implausible number of astronauts'},
  oklahoma: {note: 'wind, and a general agreement about the wind'},
  oregon: {note: 'someone will pump your gas and rain on your parade'},
  pennsylvania: {note: 'small towns with enormous churches and better pretzels'},
  'rhode-island': {note: 'small enough to cross before the song ends'},
  'south-carolina': {note: 'porches engineered for sitting and nothing else'},
  'south-dakota': {note: 'a mountain with faces and a lot of prairie'},
  tennessee: {note: 'music towns, and the towns that supply the musicians'},
  texas: {note: 'large, and in no hurry to let that go unmentioned'},
  utah: {note: 'red rock in the south, salt in the north, both excessive'},
  vermont: {note: 'maple syrup and a firm stance against billboards'},
  virginia: {note: 'a historical marker for approximately every field'},
  washington: {note: 'the dry half nobody believes exists'},
  'west-virginia': {note: 'roads that are all curve, in the best way'},
  wisconsin: {note: 'cheese, and a genuinely reasonable attitude to winter'},
  wyoming: {note: 'fewer people than most cities, more elk than either'},
};

const FALLBACK: RegionCopy = {note: 'somewhere worth commemorating anyway'};

export function regionNote(region: Region): string {
  return (COPY[region.slug] ?? FALLBACK).note;
}

/**
 * The description under a region collection title.
 *
 * Open regions use bespoke copy where it exists. Everything else gets the
 * template — the same structure, but built from the region's own note, its
 * country, and whether it is next in line, so the waitlist pages read like a
 * tourism board rather than a placeholder.
 */
export function regionDescription(region: Region, isOpen: boolean): string {
  const copy = COPY[region.slug] ?? FALLBACK;

  if (isOpen && copy.description) return copy.description;

  if (isOpen) {
    return (
      `${region.name} is open. It is known, if it is known at all, for ` +
      `${copy.note} — which is exactly the sort of thing a souvenir should ` +
      `commemorate and never does. Every shirt here is a real town where ` +
      `people live full lives, mostly without incident.`
    );
  }

  const queuePosition =
    region.status === 'next'
      ? 'It is next on the route, which means soon, which means soon-ish.'
      : 'It is on the route. The route is long and we are driving it in order.';

  return (
    `${region.name} has ${copy.note}, and not one shirt to show for it. ` +
    `We have not gotten here yet. ${queuePosition} ` +
    `Leave your email and we will tell you the day ${region.name} finally ` +
    `gets the underwhelming tribute it has earned.`
  );
}

/** Short line for the region grid tile and meta descriptions. */
export function regionTagline(region: Region): string {
  return `${region.name} — ${regionNote(region)}.`;
}

/** Used by the waitlist form heading. Deadpan, affectionate, never mean. */
export function waitlistPrompt(region: Region): string {
  return `Get notified when we get around to insulting ${region.name}.`;
}

/** Every region that has hand-written long-form copy, for the audit trail. */
export function regionsWithBespokeCopy(): string[] {
  return REGIONS.filter((region) => COPY[region.slug]?.description).map(
    (region) => region.slug,
  );
}
