import {useOptimisticCart, type OptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {ShirtMockup} from '~/components/ShirtMockup';
import {DISPLAY_PRICE, getAllTowns, getMostOverlooked} from '~/lib/catalog';

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
 * One honest upsell: a town not already in the cart, framed by the real
 * ladder discount. Links to the PDP (size still needs choosing there).
 */
function CartUpsell({cart}: {cart: OptimisticCart<CartApiQueryFragment | null>}) {
  const {close} = useAside();
  const inCart = new Set(
    (cart?.lines?.nodes ?? [])
      .map((line) => line.attributes?.find((a) => a.key === 'Town')?.value)
      .filter(Boolean),
  );
  const suggestion =
    getMostOverlooked().find((t) => !inCart.has(t.city)) ??
    getAllTowns().find((t) => !inCart.has(t.city));
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
      <ShirtMockup town={suggestion} className="cart-upsell-art" />
      <div className="cart-upsell-copy">
        <span className="msc-kicker">Add another town you&rsquo;ll never visit</span>
        <strong>
          {suggestion.city}, {suggestion.provinceAbbrev}
        </strong>
        <span className="cart-upsell-price">
          {DISPLAY_PRICE} · {line}
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
