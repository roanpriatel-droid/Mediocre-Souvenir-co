import type {Storefront} from '@shopify/hydrogen';
import {
  loadDerivedCatalog,
  PRINT_STYLES,
  type ProductIndexEntry,
} from './shopify-catalog';
import {regionForProduct} from './town-copy';
import type {Region} from './catalog';

/**
 * Towns, as opposed to products.
 *
 * Each town is sold as up to four products, one per print ("akron-oh-varsity",
 * "akron-oh-greetings", ...). A town page gathers them under the town's own
 * address, /towns/akron-oh, which is the page that should answer a search for
 * "Akron Ohio shirt" or "Akron souvenir" rather than any single print.
 */

export interface Town {
  /** "akron-oh": the product handle without its print suffix. */
  slug: string;
  /** "Akron, OH", as it appears before the dash in the product title. */
  place: string;
  /** "Akron". */
  name: string;
  region: Region | undefined;
  products: ProductIndexEntry[];
}

export function townPath(slug: string): string {
  return `/towns/${slug}`;
}

/** "akron-oh-varsity" → "akron-oh"; undefined when there is no print suffix. */
export function townSlugOf(handle: string): string | undefined {
  const style = PRINT_STYLES.find((s) => handle.endsWith(`-${s.value}`));
  return style ? handle.slice(0, -(style.value.length + 1)) : undefined;
}

/** Every town in the catalogue, keyed by slug, built from the product index. */
export async function loadTowns(
  storefront: Storefront,
): Promise<Map<string, Town>> {
  const {entries} = await loadDerivedCatalog(storefront);
  const towns = new Map<string, Town>();
  for (const entry of entries) {
    const slug = townSlugOf(entry.handle);
    if (!slug) continue;
    let town = towns.get(slug);
    if (!town) {
      const place = entry.title.split(' — ')[0]?.trim() ?? entry.title;
      town = {
        slug,
        place,
        name: place.split(',')[0]?.trim() ?? place,
        region: regionForProduct(entry),
        products: [],
      };
      towns.set(slug, town);
    }
    town.products.push(entry);
  }
  // Prints in the same order everywhere: Varsity, Greetings, I Heart, Tour.
  const rank = (handle: string) =>
    PRINT_STYLES.findIndex((s) => handle.endsWith(`-${s.value}`));
  for (const town of towns.values()) {
    town.products.sort((a, b) => rank(a.handle) - rank(b.handle));
  }
  return towns;
}
