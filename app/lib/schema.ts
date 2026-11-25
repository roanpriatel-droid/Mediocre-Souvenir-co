/**
 * Shared schema.org building blocks.
 *
 * These mirror the live store configuration, so search engines and AI
 * assistants read the same promises the checkout keeps:
 * - Canada and US: $6.95 USD standard shipping, free from $60.
 * - Everywhere else: value-based international shipping from $10.
 * - Printing takes 5–10 business days; transit is 3–8 to the US and 6–12
 *   to Canada (the shipping policy in policies.ts says the same).
 * - Returns: 30 days from delivery, free of restocking fees.
 * If any of those change in Shopify, change them here too.
 */

export const SITE_NAME = 'Mediocre Souvenir Co.';

const money = (value: string) => ({
  '@type': 'MonetaryAmount',
  value,
  currency: 'USD',
});

const days = (min: number, max: number) => ({
  '@type': 'QuantitativeValue',
  minValue: min,
  maxValue: max,
  unitCode: 'DAY',
});

/** One OfferShippingDetails per market, as Google Merchant listings expect. */
export function shippingDetails() {
  const market = (
    country: string,
    rate: string,
    handling: [number, number],
    transit: [number, number],
  ) => ({
    '@type': 'OfferShippingDetails',
    shippingDestination: {'@type': 'DefinedRegion', addressCountry: country},
    shippingRate: money(rate),
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: days(...handling),
      transitTime: days(...transit),
    },
  });
  return [
    market('US', '6.95', [5, 10], [3, 8]),
    market('CA', '6.95', [5, 10], [6, 12]),
  ];
}

/** The refund policy, in the form Google reads for merchant listings. */
export function returnPolicy(origin: string) {
  return ['US', 'CA'].map((country) => ({
    '@type': 'MerchantReturnPolicy',
    applicableCountry: country,
    returnPolicyCategory:
      'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 30,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/FreeReturn',
    refundType: 'https://schema.org/FullRefund',
    merchantReturnLink: `${origin}/policies/refund-policy`,
  }));
}

export type Crumb = {name: string; path: string};

/** BreadcrumbList for a trail that starts at the homepage. */
export function breadcrumbList(origin: string, trail: Crumb[]) {
  const items = [{name: 'Home', path: '/'}, ...trail];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${origin}${crumb.path}`,
    })),
  };
}

/** Site-wide Organization and WebSite entities, linked by @id. */
export function siteGraph(origin: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'OnlineStore',
        '@id': `${origin}/#organization`,
        name: SITE_NAME,
        alternateName: 'MSC',
        url: origin,
        logo: `${origin}/apple-touch-icon.png`,
        image: `${origin}/og-default.png`,
        slogan: 'Genuine Merch for Overlooked Places',
        foundingDate: '2026',
        description:
          'Faux-vintage souvenir t-shirts for more than 650 overlooked towns ' +
          'across Canada and the United States, printed on garment-dyed ' +
          'Comfort Colors 1717 heavyweight cotton. $36 USD a shirt, 15% off ' +
          'two, 20% off three or more. Ships to Canada, the US and worldwide.',
        areaServed: ['CA', 'US'],
        email: 'mediocresouvenir@stratosync.solutions',
        sameAs: ['https://instagram.com/mediocresouvenirco'],
        hasMerchantReturnPolicy: returnPolicy(origin),
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        name: SITE_NAME,
        url: origin,
        publisher: {'@id': `${origin}/#organization`},
        inLanguage: 'en',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${origin}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}
