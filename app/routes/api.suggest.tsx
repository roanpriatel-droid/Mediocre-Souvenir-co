import type {Route} from './+types/api.suggest';
import {suggestProducts} from '~/lib/shopify-search';
import {loadTowns, townPath, type Town} from '~/lib/towns';

export interface SearchSuggestion {
  key: string;
  to: string;
  title: string;
  meta: string | null;
}

const LIMIT = 6;

/**
 * Typeahead for the search boxes.
 *
 * Towns come first, because a town is what people type: "akr" offers
 * "Akron, OH · 4 prints", which opens the town page with every print. Product
 * matches from Shopify's predictive search fill whatever room is left.
 */
export async function loader({request, context}: Route.LoaderArgs) {
  const query = (new URL(request.url).searchParams.get('q') ?? '').trim();
  if (query.length < 2) return Response.json({suggestions: []});

  const normal = (text: string) =>
    text.toLowerCase().replace(/[.,]/g, '').replace(/\s+/g, ' ').trim();
  const wanted = normal(query);

  const [towns, products] = await Promise.all([
    loadTowns(context.storefront).catch(() => new Map<string, Town>()),
    suggestProducts(context.storefront, query, LIMIT),
  ]);

  // Names that start with the query rank above names that merely contain it.
  const rankOf = (town: Town) => {
    const place = normal(town.place);
    if (place.startsWith(wanted)) return 0;
    if (place.split(' ').some((word) => word.startsWith(wanted))) return 1;
    if (place.includes(wanted)) return 2;
    return -1;
  };
  const matches = [...towns.values()]
    .map((town) => ({town, rank: rankOf(town)}))
    .filter(({rank}) => rank >= 0)
    .sort(
      (a, b) => a.rank - b.rank || a.town.place.localeCompare(b.town.place),
    )
    .slice(0, LIMIT)
    .map(({town}) => town);

  const suggestions: SearchSuggestion[] = matches.map((town) => {
    const count = town.products.length;
    return {
      key: `town:${town.slug}`,
      to: townPath(town.slug),
      title: town.place,
      meta: `${count} ${count === 1 ? 'print' : 'prints'}`,
    };
  });

  for (const product of products) {
    if (suggestions.length >= LIMIT + 2) break;
    suggestions.push({
      key: `product:${product.handle}`,
      to: `/products/${product.handle}`,
      title: product.title,
      meta: product.price ? `$${product.price}` : null,
    });
  }

  return Response.json(
    {suggestions},
    {headers: {'Cache-Control': 'public, max-age=60'}},
  );
}
