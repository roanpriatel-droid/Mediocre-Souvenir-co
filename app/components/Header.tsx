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
import {DesktopNav, MobileNav} from '~/components/NavMenu';
import {TownSearch} from '~/components/TownSearch';

interface HeaderProps {
  cart: Promise<CartApiQueryFragment | null>;
  buyerRegion?: {slug: string; name: string} | null;
}

/** Free-shipping threshold, matched to the cart summary and the policy page. */
const FREE_SHIPPING = 75;

type Viewport = 'desktop' | 'mobile';

/**
 * The header.
 *
 * Row one used to be a logo hard left, a cart hard right, and roughly 900px of
 * nothing between them — about 70% of the row was empty on a desktop screen,
 * while the store's single most important action, finding your town, was
 * available only in the hero and vanished the moment you scrolled past it.
 *
 * The dead space now carries that search permanently, flanked by the region we
 * already know the visitor is in (which doubles as a link to their own rack)
 * and a cart that reports value rather than a bare count.
 */
export function Header({cart, buyerRegion = null}: HeaderProps) {
  return (
    <header className="header">
      <NavLink prefetch="intent" to="/" className="header-logo" end>
        <BadgeLogo size={44} />
        <span className="header-logo-word">MEDIOCRE SOUVENIR CO.</span>
      </NavLink>

      <div className="header-search">
        <TownSearch compact />
      </div>

      <div className="header-ctas">
        {buyerRegion && (
          <NavLink
            className="header-region"
            to={`/collections/${buyerRegion.slug}`}
            prefetch="intent"
            title={`Shop ${buyerRegion.name}`}
          >
            <span className="header-region-label">Shipping to</span>
            <span className="header-region-name">{buyerRegion.name}</span>
          </NavLink>
        )}
        <HeaderMenuMobileToggle />
        <CartToggle cart={cart} />
      </div>

      <DesktopNav />
    </header>
  );
}

/** Rendered inside the mobile aside. */
export function HeaderMenu({viewport}: {viewport: Viewport}) {
  const {close} = useAside();
  if (viewport === 'desktop') return <DesktopNav />;
  return <MobileNav onNavigate={close} />;
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

function CartBadge({count, subtotal}: {count: number; subtotal: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  const remaining = FREE_SHIPPING - subtotal;

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
      <span className="header-cart-main">
        Cart
        <span
          className="header-cart-count"
          aria-label={`${count} souvenirs collected`}
        >
          {count}
        </span>
      </span>
      {/* The free-shipping gap, surfaced at the moment it can change a
          decision rather than only once you have opened the cart. */}
      {count > 0 && (
        <span className="header-cart-note">
          {remaining > 0
            ? `$${Math.ceil(remaining)} to free shipping`
            : 'Free shipping unlocked'}
        </span>
      )}
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} subtotal={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return (
    <CartBadge
      count={cart?.totalQuantity ?? 0}
      subtotal={Number(cart?.cost?.subtotalAmount?.amount ?? 0)}
    />
  );
}
