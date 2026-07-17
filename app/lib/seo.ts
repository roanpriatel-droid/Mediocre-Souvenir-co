import {regionPath} from './catalog/regions';
import {
  COLORWAY_LABELS,
  DISPLAY_PRICE,
  localeFor,
  PRICE,
  PRICE_US,
  TIER_LABELS,
  type Region,
  type TownProduct,
} from './catalog/types';

/**
 * SEO templates for the catalog. Every product page must be a rankable
 * landing page for "[city] t-shirt" — title tag, meta description, H1,
 * alt text, and structured data are all derived from the town fields, so
 * a new SKU is fully SEO-complete on creation with zero manual work.
 * Prices read "$36" everywhere — CAD in Canada, USD in the US (parity).
 */

export const SITE_NAME = 'Mediocre Souvenir Co.';
export const SITE_TAGLINE = 'Genuine Merch for Overlooked Places';

export function townTitle(town: TownProduct): string {
  return `${town.city} T-Shirt — Vintage ${town.provinceAbbrev} Souvenir Tee | ${SITE_NAME}`;
}

export function townDescription(town: TownProduct): string {
  return (
    `A genuine faux-vintage ${town.city}, ${town.provinceState} souvenir t-shirt. ` +
    `${town.knownFor}. Garment-dyed Comfort Colors 1717 heavyweight cotton, ` +
    `printed with the respect a town of ${town.population.toLocaleString(localeFor(town.country))} deserves. ` +
    `${DISPLAY_PRICE} — collect 2 and save 15%. Ships across Canada and the US.`
  );
}

export function townH1(town: TownProduct): string {
  return `${town.city} T-Shirt`;
}

export function townImageAlt(town: TownProduct): string {
  return (
    `Faded ${COLORWAY_LABELS[town.colorway].toLowerCase()} ${town.city}, ` +
    `${town.provinceState} souvenir t-shirt with vintage ${labelForStyle(town)} print`
  );
}

function labelForStyle(town: TownProduct): string {
  switch (town.style) {
    case 'classic-varsity':
      return 'arched varsity lettering';
    case 'retro-postcard':
      return 'greetings-from postcard';
    case 'faded-slogan':
      return 'deadpan slogan';
  }
}

export function regionTitle(region: Region, townCount: number): string {
  return `${region.name} Souvenir T-Shirts — ${townCount} Overlooked Towns | ${SITE_NAME}`;
}

export function regionDescription(region: Region, townCount: number): string {
  return (
    `Faux-vintage souvenir t-shirts for ${townCount} overlooked ${region.name} ` +
    `towns — every one commemorated with the reverence a Hawaii gift shop would use. ` +
    `Garment-dyed heavyweight tees, ${DISPLAY_PRICE} each, collect 2 and save 15%.`
  );
}

/** JSON-LD Product structured data — one offer per market currency. */
export function townJsonLd(town: TownProduct, origin: string) {
  const url = `${origin}/products/${town.handle}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${town.city} T-Shirt`,
    description: townDescription(town),
    brand: {'@type': 'Brand', name: SITE_NAME},
    category: 'Apparel & Accessories > Clothing > Shirts & Tops',
    url,
    material: '100% ring-spun cotton (Comfort Colors 1717, garment-dyed)',
    additionalProperty: [
      {'@type': 'PropertyValue', name: 'City', value: town.city},
      {'@type': 'PropertyValue', name: 'Province/State', value: town.provinceState},
      {'@type': 'PropertyValue', name: 'Country', value: town.country},
      {'@type': 'PropertyValue', name: 'Population tier', value: TIER_LABELS[town.populationTier]},
    ],
    offers: [
      {
        '@type': 'Offer',
        price: PRICE.amount,
        priceCurrency: PRICE.currencyCode,
        availability: 'https://schema.org/InStock',
        eligibleRegion: {'@type': 'Country', name: 'CA'},
        url,
      },
      {
        '@type': 'Offer',
        price: PRICE_US.amount,
        priceCurrency: PRICE_US.currencyCode,
        availability: 'https://schema.org/InStock',
        eligibleRegion: {'@type': 'Country', name: 'US'},
        url,
      },
    ],
  };
}

/** JSON-LD ItemList / CollectionPage for a region page. */
export function regionJsonLd(
  region: Region,
  towns: TownProduct[],
  origin: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${region.name} Souvenir T-Shirts`,
    url: `${origin}${regionPath(region)}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: towns.map((town, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${town.city} T-Shirt`,
        url: `${origin}/products/${town.handle}`,
      })),
    },
  };
}
