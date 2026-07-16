import {
  COLORWAY_LABELS,
  PRICE,
  TIER_LABELS,
  type Province,
  type TownProduct,
} from './catalog/types';

/**
 * SEO templates for the catalog. Every product page must be a rankable
 * landing page for "[city] t-shirt" — title tag, meta description, H1,
 * alt text, and structured data are all derived from the town fields, so
 * a new SKU is fully SEO-complete on creation with zero manual work.
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
    `printed with the respect a town of ${town.population.toLocaleString('en-CA')} deserves. ` +
    `$${PRICE.amount} CAD — collect 2 and save 15%.`
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

export function provinceTitle(province: Province, townCount: number): string {
  return `${province.name} Souvenir T-Shirts — ${townCount} Overlooked Towns | ${SITE_NAME}`;
}

export function provinceDescription(province: Province, townCount: number): string {
  return (
    `Faux-vintage souvenir t-shirts for ${townCount} overlooked ${province.name} ` +
    `towns — every one commemorated with the reverence a Hawaii gift shop would use. ` +
    `Garment-dyed heavyweight tees, $${PRICE.amount} each, collect 2 and save 15%.`
  );
}

/** JSON-LD Product structured data for a town tee. */
export function townJsonLd(town: TownProduct, origin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${town.city} T-Shirt`,
    description: townDescription(town),
    brand: {'@type': 'Brand', name: SITE_NAME},
    category: 'Apparel & Accessories > Clothing > Shirts & Tops',
    url: `${origin}/products/${town.handle}`,
    material: '100% ring-spun cotton (Comfort Colors 1717, garment-dyed)',
    additionalProperty: [
      {'@type': 'PropertyValue', name: 'City', value: town.city},
      {'@type': 'PropertyValue', name: 'Province/State', value: town.provinceState},
      {'@type': 'PropertyValue', name: 'Country', value: town.country},
      {'@type': 'PropertyValue', name: 'Population tier', value: TIER_LABELS[town.populationTier]},
    ],
    offers: {
      '@type': 'Offer',
      price: PRICE.amount,
      priceCurrency: PRICE.currencyCode,
      availability: 'https://schema.org/InStock',
      url: `${origin}/products/${town.handle}`,
    },
  };
}

/** JSON-LD ItemList / CollectionPage for a province page. */
export function provinceJsonLd(
  province: Province,
  towns: TownProduct[],
  origin: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${province.name} Souvenir T-Shirts`,
    url: `${origin}/provinces/${province.slug}`,
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
