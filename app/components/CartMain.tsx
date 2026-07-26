import {useEffect} from 'react';
import {useOptimisticCart, type OptimisticCart} from '@shopify/hydrogen';
import {Link, useFetcher} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {
  cardPriceLabel,
  type SouvenirCard as SouvenirCardData,
} from '~/lib/shopify-collections';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

export type LineItemChildrenMap = {[parentId: string]: CartLine[]};
/** Returns a map of all line items and their children. */
function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const children: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const lineChildren = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(lineChildren)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
}
/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const childrenMap = getLineItemChildrenMap(cart?.lines?.nodes ?? []);

  return (
    <section
      className={className}
      aria-label={layout === 'page' ? 'Cart page' : 'Cart drawer'}
    >
      <CartEmpty hidden={linesCount} layout={layout} />
      <div className="cart-details">
        <p id="cart-lines" className="sr-only">
          Line items
        </p>
        <div>
          <ul aria-labelledby="cart-lines">
            {(cart?.lines?.nodes ?? []).map((line) => {
              // we do not render non-parent lines at the root of the cart
              if (
                'parentRelationship' in line &&
                line.parentRelationship?.parent
              ) {
                return null;
              }
              return (
                <CartLineItem
                  key={line.id}
                  line={line}
                  layout={layout}
                  childrenMap={childrenMap}
                />
              );
            })}
          </ul>
        </div>
        {cartHasItems && <CartUpsell cart={cart} />}
        {cartHasItems && <CartSummary cart={cart} layout={layout} />}
      </div>
    </section>
  );
}

/**
 * One honest upsell, drawn from the store rather than the local catalog —
 * suggesting a town we could not actually sell was the old behaviour.
 */
function CartUpsell({cart}: {cart: OptimisticCart<CartApiQueryFragment | null>}) {
  const {close} = useAside();
  const fetcher = useFetcher<{suggestion: SouvenirCardData | null}>();

  const inCart = (cart?.lines?.nodes ?? [])
    .map((line) =>
      line.merchandise && 'product' in line.merchandise
        ? line.merchandise.product?.handle
        : undefined,
    )
    .filter(Boolean) as string[];

  const key = inCart.join(',');
  useEffect(() => {
    void fetcher.load(`/api/upsell?exclude=${encodeURIComponent(key)}`);
    // fetcher identity changes every render; depending on it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const suggestion = fetcher.data?.suggestion;
  if (!suggestion) return null;

  const qty = cart?.totalQuantity ?? 0;
  const line =
    qty === 1
      ? 'One more town saves 15% on both.'
      : qty === 2
        ? 'A third town makes it 20% off everything.'
        : 'For the drawer.';

  return (
    <Link
      className="cart-upsell"
      to={`/products/${suggestion.handle}`}
      onClick={close}
      prefetch="intent"
    >
      {suggestion.featuredImage ? (
        <img
          className="cart-upsell-art"
          src={suggestion.featuredImage.url}
          alt={suggestion.featuredImage.altText || suggestion.title}
          loading="lazy"
          width={72}
          height={72}
        />
      ) : (
        <div className="cart-upsell-art rack-card-art-empty" aria-hidden="true">
          <span>{suggestion.title.slice(0, 2).toUpperCase()}</span>
        </div>
      )}
      <div className="cart-upsell-copy">
        <span className="msc-kicker">Add another town you&rsquo;ll never visit</span>
        <strong>{suggestion.title}</strong>
        <span className="cart-upsell-price">
          {cardPriceLabel(suggestion)} · {line}
        </span>
      </div>
    </Link>
  );
}

function CartEmpty({
  hidden = false,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  return (
    <div hidden={hidden} className="cart-empty">
      <p className="cart-empty-title">Nothing collected yet.</p>
      <p>Every town is somebody&rsquo;s hometown. Go find yours.</p>
      <Link
        className="msc-button"
        to="/collections/all-souvenirs"
        onClick={close}
        prefetch="viewport"
      >
        Browse the towns
      </Link>
    </div>
  );
}
