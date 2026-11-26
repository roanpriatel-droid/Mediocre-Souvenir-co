import type {Storefront} from '@shopify/hydrogen';

/**
 * The homepage hero's postcard rack: six shirts across the vintage colours,
 * each picked by the alt text the catalogue gives every photo ("... souvenir
 * t-shirt in brick, folded, flat lay"). If a product has not received its
 * new colours yet, the card falls back to that product's lead photo.
 */
export const RACK: {handle: string; colour: string; view: string}[] = [
  {handle: 'moose-jaw-sk-greetings', colour: 'ivory', view: 'folded, flat lay'},
  {handle: 'roswell-nm-varsity', colour: 'blue jean', view: 'front'},
  {handle: 'thunder-bay-on-tour', colour: 'brick', view: 'folded, flat lay'},
  {handle: 'hilo-hi-i-heart', colour: 'bay', view: 'folded'},
  {handle: 'fargo-nd-varsity', colour: 'brick', view: 'front'},
  {handle: 'butte-mt-greetings', colour: 'blue jean', view: 'folded, flat lay'},
];

export interface RackCard {
  handle: string;
  place: string;
  /** Read from the photo's alt text; null when it does not say. */
  colour: string | null;
  image: {url: string; altText: string | null; width: number; height: number};
}

export async function loadRackCards(
  storefront: Storefront,
): Promise<RackCard[]> {
  const cards = await Promise.all(
    RACK.map(async ({handle, colour, view}) => {
      try {
        const data = await storefront.query(RACK_QUERY, {
          variables: {handle},
          cache: storefront.CacheLong(),
        });
        const product = data?.product;
        if (!product) return null;
        const nodes = product.images.nodes;
        const wanted = `in ${colour}, ${view}`;
        const image =
          nodes.find((node) => node.altText?.endsWith(wanted)) ??
          nodes.find((node) => node.altText?.includes(` in ${colour}, `)) ??
          nodes.find((node) =>
            /in (bay|blue jean|brick), folded, flat lay$/.test(
              node.altText ?? '',
            ),
          ) ??
          nodes[0];
        if (!image?.width || !image.height) return null;
        return {
          handle,
          place: product.title.split(' — ')[0],
          // The colour of the photo actually shown, so the swatch never lies.
          colour:
            /souvenir t-shirt in ([a-z ]+),/.exec(image.altText ?? '')?.[1] ??
            null,
          image: {
            url: image.url,
            altText: image.altText ?? null,
            width: image.width,
            height: image.height,
          },
        };
      } catch {
        return null;
      }
    }),
  );
  return cards.filter((card): card is RackCard => card !== null);
}

const RACK_QUERY = `#graphql
  query HeroRackProduct($handle: String!) {
    product(handle: $handle) {
      title
      images(first: 40) {
        nodes {
          url
          altText
          width
          height
        }
      }
    }
  }
` as const;
