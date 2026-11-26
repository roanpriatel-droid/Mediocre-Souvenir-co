import {Suspense, useEffect, useRef, useState} from 'react';
import {Await, NavLink, useAsyncValue, useLocation} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {BadgeLogo} from '~/components/Brand';
import {MegaNav, MobileNav} from '~/components/NavMenu';
import {TownSearch} from '~/components/TownSearch';

interface HeaderProps {
  cart: Promise<CartApiQueryFragment | null>;
  buyerRegion?: {slug: string; name: string; country?: string} | null;
}

/** Free-shipping threshold, matched to the cart summary and the policy page. */
const FREE_SHIPPING = 60;

type Viewport = 'desktop' | 'mobile';

/**
 * The header: one row. Logo, the five menus, then search, the visitor's own
 * region and the cart. It used to be three stacked bars (announcement, logo
 * and a giant search pill, then the menu on its own line) that cost about
 * 200px of every screen. It sticks to the top and tightens once you scroll.
 */
export function Header({cart, buyerRegion = null}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sh" data-scrolled={scrolled || undefined}>
      <div className="sh-bar">
        <NavLink prefetch="intent" to="/" className="sh-logo" end>
          <BadgeLogo size={48} className="sh-badge" />
          <span className="sh-word">
            <span>Mediocre</span>
            <span>Souvenir Co.</span>
          </span>
        </NavLink>

        <MegaNav />

        <div className="sh-tools">
          <HeaderSearch />
          {buyerRegion && (
            <NavLink
              className="sh-region"
              to={`/collections/${buyerRegion.slug}`}
              prefetch="intent"
              title={`Shop ${buyerRegion.name}`}
            >
              <span className="sh-region-pin" aria-hidden="true">
                ★
              </span>
              <span className="sh-region-text">
                <span className="sh-region-label">Your rack</span>
                <span className="sh-region-name">{buyerRegion.name}</span>
              </span>
            </NavLink>
          )}
          <CartToggle cart={cart} />
          <HeaderMenuMobileToggle />
        </div>
      </div>
    </header>
  );
}

/**
 * Search as an icon that opens a field under the header, so the row stays
 * calm and the homepage hero keeps the one big search box.
 */
function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  return (
    <div className="sh-search" ref={rootRef} data-open={open || undefined}>
      <button
        type="button"
        className="sh-icon-button"
        aria-label={open ? 'Close search' : 'Find your town'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          {open ? (
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          ) : (
            <>
              <circle
                cx="10.5"
                cy="10.5"
                r="6.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              />
              <path
                d="M15.5 15.5L21 21"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>
        <span className="sh-search-label">Find your town</span>
      </button>
      {open && (
        <div className="sh-search-panel">
          {/* Focus moves to the field only because the visitor just asked
              for it by pressing the search button. */}
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <TownSearch compact autoFocus />
          <p className="sh-search-hint">
            667 towns across Canada and the US. Try Moose Jaw, Akron or Hilo.
          </p>
        </div>
      )}
    </div>
  );
}

/** Rendered inside the mobile aside. */
export function HeaderMenu({viewport}: {viewport: Viewport}) {
  const {close} = useAside();
  if (viewport === 'desktop') return <MegaNav />;
  return <MobileNav onNavigate={close} />;
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="sh-icon-button sh-menu-toggle"
      onClick={() => open('mobile')}
      aria-label="Open menu"
      type="button"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          d="M3 6h18M3 12h18M3 18h18"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
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
      className="sh-cart"
      data-filled={count > 0 || undefined}
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
      <svg
        className="sh-cart-icon"
        viewBox="0 0 24 24"
        width="22"
        height="22"
        aria-hidden="true"
      >
        <path
          d="M5 8h14l-1.2 11.2a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3L5 8z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M9 10V7a3 3 0 0 1 6 0v3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="sh-cart-text">
        <span className="sh-cart-label">Cart</span>
        {count > 0 && (
          <span className="sh-cart-note">
            {remaining > 0
              ? `$${Math.ceil(remaining)} to free shipping`
              : 'Free shipping unlocked'}
          </span>
        )}
      </span>
      <span
        className="sh-cart-count"
        aria-label={`${count} souvenirs in your cart`}
      >
        {count}
      </span>
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
