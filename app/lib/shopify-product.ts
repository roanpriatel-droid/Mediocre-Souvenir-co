import type {Storefront} from '@shopify/hydrogen';

/**
 * Live product lookup for the PDP.
 *
 * The town catalog still owns the *story* of a product — population, est.
 * year, the one thing the place is known for, the generative artwork. The
 * store owns *commerce*: real variants, real prices, real stock. This module
 * fetches the second half and leaves the first alone, so a PDP can show a
 * live $36.00 CAD variant price and a certificate of mediocre authenticity on
 * the same page without either source pretending to be the other.
 *
 * Returns null on any failure. The PDP falls back to the catalog stand-in,
 * which is what it used before the store had products.
 */

export const PRODUCT_QUERY = `#graphql
  fragment SouvenirProductMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment SouvenirProductImage on Image {
    id
    url
    altText
    width
    height
  }
  query SouvenirProduct(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      handle
      title
      description
      vendor
      availableForSale
      featuredImage {
        ...SouvenirProductImage
      }
      images(first: 8) {
        nodes {
          ...SouvenirProductImage
        }
      }
      options {
        name
        optionValues {
          name
        }
      }
      priceRange {
        minVariantPrice {
          ...SouvenirProductMoney
        }
        maxVariantPrice {
          ...SouvenirProductMoney
        }
      }
      variants(first: 100) {
        nodes {
          id
          title
          availableForSale
          quantityAvailable
          price {
            ...SouvenirProductMoney
          }
          compareAtPrice {
            ...SouvenirProductMoney
          }
          selectedOptions {
            name
            value
          }
          image {
            ...SouvenirProductImage
          }
        }
      }
      collections(first: 20) {
        nodes {
          handle
          title
        }
      }
      seo {
        title
        description
      }
    }
  }
` as const;

export interface LiveVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  price: {amount: string; currencyCode: string};
  compareAtPrice?: {amount: string; currencyCode: string} | null;
  selectedOptions: {name: string; value: string}[];
  image?: {url: string; altText?: string | null} | null;
}

export interface LiveProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  vendor: string;
  availableForSale: boolean;
  featuredImage: {url: string; altText?: string | null} | null;
  images: {id?: string | null; url: string; altText?: string | null}[];
  options: {name: string; values: string[]}[];
  priceRange: {
    minVariantPrice: {amount: string; currencyCode: string};
    maxVariantPrice: {amount: string; currencyCode: string};
  };
  variants: LiveVariant[];
  collections: {handle: string; title: string}[];
}

export async function loadProduct(
  storefront: Storefront,
  handle: string,
): Promise<LiveProduct | null> {
  try {
    const data = await storefront.query(PRODUCT_QUERY, {
      variables: {handle},
      cache: storefront.CacheShort(),
    });
    const product = data?.product;
    if (!product) return null;

    return {
      id: product.id,
      handle: product.handle,
      title: product.title,
      description: product.description ?? '',
      vendor: product.vendor ?? '',
      availableForSale: Boolean(product.availableForSale),
      featuredImage: product.featuredImage ?? null,
      images: product.images?.nodes ?? [],
      options: (product.options ?? []).map((option: any) => ({
        name: option.name,
        values: (option.optionValues ?? []).map((value: any) => value.name),
      })),
      priceRange: product.priceRange,
      variants: product.variants?.nodes ?? [],
      collections: product.collections?.nodes ?? [],
    };
  } catch (error) {
    console.error(`[msc:product] "${handle}" failed to load`, error);
    return null;
  }
}

/** The option Shopify uses for size, whatever the merchant called it. */
export function sizeOptionName(product: LiveProduct): string | null {
  const match = product.options.find((option) =>
    /^(size|sizes)$/i.test(option.name),
  );
  return match?.name ?? product.options[0]?.name ?? null;
}

/** Variant for a chosen size, matched on the size option. */
export function variantForSize(
  product: LiveProduct,
  optionName: string | null,
  size: string,
): LiveVariant | undefined {
  if (!optionName) return product.variants[0];
  return product.variants.find((variant) =>
    variant.selectedOptions.some(
      (option) => option.name === optionName && option.value === size,
    ),
  );
}

/** "$36.00" / "US$36.00" — Intl does the work so the market decides. */
export function formatMoney(money: {
  amount: string;
  currencyCode: string;
}): string {
  const amount = Number(money.amount);
  try {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: money.currencyCode,
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return `$${amount}`;
  }
}
