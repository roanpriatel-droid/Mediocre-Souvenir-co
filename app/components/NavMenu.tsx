import {useEffect, useId, useRef, useState} from 'react';
import {Link, NavLink} from 'react-router';
import {getRegionsByCountry, type Region} from '~/lib/catalog';
import {TownSearch} from '~/components/TownSearch';

/**
 * The navigation, as dropdowns.
 *
 * Sixty-three regions cannot live in a flat nav bar, and making people hunt
 * through a directory page to find their own province was the wrong default —
 * the whole promise of the site is "find your place fast". So Canada opens to
 * all thirteen regions and USA opens to all fifty states in columns, each one
 * a direct link to its collection.
 *
 * Accessibility notes, since a hover-only menu would exclude a lot of people:
 * the trigger is a real button with aria-expanded and aria-controls, pointer
 * devices may hover to open, Escape closes and returns focus to the trigger,
 * clicking outside closes, and every panel item is an ordinary focusable link.
 * Closed is the server-rendered default so there is no hydration flash.
 */

export interface NavLeaf {
  title: string;
  to: string;
}

export interface NavGroup {
  title: string;
  to: string;
  /** Rendered as a wide multi-column panel — used for the fifty states. */
  wide?: boolean;
  items: NavLeaf[];
}

export type NavEntry = NavLeaf | NavGroup;

const isGroup = (entry: NavEntry): entry is NavGroup => 'items' in entry;

function regionLeaves(country: Region['country']): NavLeaf[] {
  return getRegionsByCountry(country).map((region) => ({
    title: region.name,
    to: `/collections/${region.slug}`,
  }));
}

export function buildNav(): NavEntry[] {
  return [
    {
      title: 'Shop',
      to: '/collections/all-souvenirs',
      items: [
        {title: 'All souvenirs', to: '/collections/all-souvenirs'},
        {title: 'Now open', to: '/collections/now-open'},
        {title: 'New arrivals', to: '/collections/new-arrivals'},
        {title: 'Coming in due time', to: '/collections/coming-in-due-time'},
        {title: 'All collections', to: '/collections'},
      ],
    },
    {
      title: 'Canada',
      to: '/collections/canada',
      items: [
        {title: 'All of Canada', to: '/collections/canada'},
        ...regionLeaves('Canada'),
      ],
    },
    {
      title: 'USA',
      to: '/collections/united-states',
      wide: true,
      items: [
        {title: 'All of the USA', to: '/collections/united-states'},
        ...regionLeaves('United States'),
      ],
    },
    {title: 'The Towns', to: '/towns'},
    {
      title: 'The Co.',
      to: '/our-story',
      items: [
        {title: 'Our story', to: '/our-story'},
        {title: 'Certificate of Authenticity', to: '/certificate'},
        {title: 'Postcards From Nowhere', to: '/postcards'},
        {title: 'Request a town', to: '/request-a-town'},
        {title: 'The lookbook', to: '/lookbook'},
        {title: 'Size & fit guide', to: '/size-guide'},
        {title: 'Shipping & returns', to: '/shipping-returns'},
        {title: 'FAQ', to: '/faq'},
        {title: 'Contact', to: '/contact'},
      ],
    },
  ];
}

export function DesktopNav() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const entries = buildNav();

  // Click-outside and Escape are handled here rather than on the panel, so
  // Escape works from anywhere inside an open menu — key events from the links
  // bubble to the document either way.
  useEffect(() => {
    if (openIndex === null) return;

    const onPointerDown = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenIndex(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpenIndex(null);
      // Return focus to the trigger that opened the panel.
      navRef.current
        ?.querySelectorAll<HTMLButtonElement>('.nav-dropdown-trigger')
        ?.[openIndex]?.focus();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openIndex]);

  return (
    <nav
      className="header-menu-desktop"
      role="navigation"
      aria-label="Main"
      ref={navRef}
      onMouseLeave={() => setOpenIndex(null)}
    >
      {entries.map((entry, i) =>
        isGroup(entry) ? (
          <NavDropdown
            key={entry.title}
            group={entry}
            open={openIndex === i}
            onOpen={() => setOpenIndex(i)}
            onClose={() => setOpenIndex(null)}
          />
        ) : (
          <NavLink
            key={entry.title}
            className="header-menu-item"
            to={entry.to}
            prefetch="intent"
            onMouseEnter={() => setOpenIndex(null)}
          >
            {entry.title}
          </NavLink>
        ),
      )}
    </nav>
  );
}

function NavDropdown({
  group,
  open,
  onOpen,
  onClose,
}: {
  group: NavGroup;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="nav-dropdown">
      <button
        type="button"
        ref={buttonRef}
        className="header-menu-item nav-dropdown-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        onClick={() => (open ? onClose() : onOpen())}
        onMouseEnter={onOpen}
      >
        {group.title}
        <span className="nav-dropdown-caret" aria-hidden="true">
          ▾
        </span>
      </button>

      <div
        id={panelId}
        className="nav-dropdown-panel"
        data-wide={group.wide || undefined}
        hidden={!open}
      >
        <ul>
          {group.items.map((item) => (
            <li key={item.to}>
              <Link to={item.to} prefetch="intent" onClick={onClose}>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
        {group.wide && (
          <p className="nav-dropdown-foot">
            <Link to="/towns" onClick={onClose}>
              Every region, A–Z, on one page →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Mobile: the same structure as collapsible sections rather than hover
 * panels. <details> gives keyboard and screen-reader behaviour for free and
 * works before hydration.
 */
export function MobileNav({onNavigate}: {onNavigate: () => void}) {
  const entries = buildNav();
  return (
    <nav className="header-menu-mobile" role="navigation" aria-label="Main">
      {/* The header hides its search below the nav breakpoint, so the drawer
          carries it — otherwise the core action is unreachable on a phone. */}
      <div className="nav-mobile-search">
        <TownSearch compact />
      </div>
      {entries.map((entry) =>
        isGroup(entry) ? (
          <details className="nav-mobile-group" key={entry.title}>
            <summary>{entry.title}</summary>
            <ul>
              {entry.items.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} onClick={onNavigate} prefetch="intent">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ) : (
          <NavLink
            className="header-menu-item"
            key={entry.title}
            to={entry.to}
            onClick={onNavigate}
            prefetch="intent"
          >
            {entry.title}
          </NavLink>
        ),
      )}
    </nav>
  );
}
