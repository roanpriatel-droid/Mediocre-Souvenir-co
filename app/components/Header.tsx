import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {BadgeLogo} from '~/components/Brand';

interface HeaderProps {
  cart: Promise<CartApiQueryFragment | null>;
}

type Viewport = 'desktop' | 'mobile';

/**
 * The nav maps onto the store's collections.
 *
 * People arrive looking for a place, so the path to a region is never more
 * than two clicks: country → region, or Regions → the grid. "Now Open" is the
 * shortcut for the only question a returning visitor has.
 */
export const NAV_ITEMS = [
  {title: 'Shop All', to: '/collections/all-souvenirs'},
  {title: 'Canada', to: '/collections/canada'},
  {title: 'United States', to: '/collections/united-states'},
  {title: 'New Arrivals', to: '/collections/new-arrivals'},
  {title: 'Now Open', to: '/collections/now-open'},
  {title: 'Regions', to: '/provinces'},
];

export function Header({cart}: HeaderProps) {
  return (
    <header className="header">
      <NavLink prefetch="intent" to="/" className="header-logo" end>
        <BadgeLogo size={46} />
        <span className="header-logo-word">MEDIOCRE SOUVENIR CO.</span>
      </NavLink>
      <HeaderMenu viewport="desktop" />
      <div className="header-ctas">
        <HeaderMenuMobileToggle />
        <CartToggle cart={cart} />
      </div>
    </header>
  );
}

export function HeaderMenu({viewport}: {viewport: Viewport}) {
  const {close} = useAside();
  return (
    <nav className={`header-menu-${viewport}`} role="navigation">
      {NAV_ITEMS.map((item) => (
        <NavLink
          className="header-menu-item"
          end={item.to === '/'}
          key={item.to}
          onClick={close}
          prefetch="intent"
          to={item.to}
        >
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
      aria-label="Open menu"
    >
      ☰
    </button>
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      className="header-cart-link"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      Cart
      <span
        className="header-cart-count"
        aria-label={`${count} souvenirs collected`}
      >
        {count}
      </span>
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}
