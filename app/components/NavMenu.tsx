import {lazy, Suspense, useEffect, useRef, useState} from 'react';
import {Link, NavLink, useLocation} from 'react-router';
import {getRegionsByCountry, type Region} from '~/lib/catalog';
import {TownSearch} from '~/components/TownSearch';

/**
 * The navigation. Desktop is a mega menu (MegaNav); mobile is the same tree
 * as collapsible sections (MobileNav).
 *
 * Original notes on the dropdowns:
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
      // All Souvenirs, Now Open and New Arrivals each hold all 2,154 shirts,
      // so listing all three offered one choice three times. The real choice
      // after "where" is "which print".
      title: 'Shop',
      to: '/collections/all-souvenirs',
      items: [
        {title: 'All souvenirs', to: '/collections/all-souvenirs'},
        {title: 'Varsity', to: '/collections/varsity'},
        {title: 'Greetings', to: '/collections/greetings'},
        {title: 'I Heart', to: '/collections/i-heart'},
        {title: 'Tour', to: '/collections/tour'},
        {title: 'Every town, A to Z', to: '/towns'},
        {title: 'Request a town', to: '/request-a-town'},
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
    {
      title: 'Gifts',
      to: '/postcards/gifts-for-someone-who-moved-away-from-home',
      items: [
        {
          title: 'For someone who moved away',
          to: '/postcards/gifts-for-someone-who-moved-away-from-home',
        },
        {
          title: 'For the impossible to shop for',
          to: '/postcards/christmas-gifts-for-people-who-are-impossible-to-shop-for',
        },
        {
          title: 'The Trans-Canada Highway',
          to: '/postcards/trans-canada-highway-souvenirs',
        },
        {
          title: 'A Rust Belt gift guide',
          to: '/postcards/rust-belt-gift-guide',
        },
        {title: 'The certificate in every box', to: '/certificate'},
      ],
    },
    {
      title: 'The Co.',
      to: '/our-story',
      items: [
        {title: 'Our story', to: '/our-story'},
        {title: 'Postcards From Nowhere', to: '/postcards'},
        {title: 'The lookbook', to: '/lookbook'},
        {title: 'Size & fit guide', to: '/size-guide'},
        {title: 'Shipping & returns', to: '/shipping-returns'},
        {title: 'FAQ', to: '/faq'},
        {title: 'Contact', to: '/contact'},
      ],
    },
  ];
}

/* ------------------------------------------------------------------------ */
/* Desktop: a mega menu. Each menu opens a full-width panel under the header. */
/* ------------------------------------------------------------------------ */

const MegaMap = lazy(() => import('~/components/MegaMap'));

const PRINTS = [
  {
    value: 'varsity',
    name: 'Varsity',
    blurb: 'Arched college letters',
    colour: 'blue-jean',
    sample: (
      <>
        <b className="pr-varsity">TOWN</b>
        <i>ATHLETIC DEPT.</i>
      </>
    ),
  },
  {
    value: 'greetings',
    name: 'Greetings',
    blurb: 'The old postcard',
    colour: 'ivory',
    sample: (
      <>
        <i className="pr-script">Greetings from</i>
        <b>TOWN</b>
      </>
    ),
  },
  {
    value: 'i-heart',
    name: 'I Heart',
    blurb: 'The classic, sincerely',
    colour: 'bay',
    sample: (
      <b>
        I <span className="pr-heart">♥</span>
        <br />
        TOWN
      </b>
    ),
  },
  {
    value: 'tour',
    name: 'Tour',
    blurb: 'Band shirt, small venue',
    colour: 'brick',
    sample: (
      <>
        <b>TOWN</b>
        <i>WORLD TOUR · 2026</i>
      </>
    ),
  },
];

const GUIDES = [
  {
    title: 'For someone who moved away',
    to: '/postcards/gifts-for-someone-who-moved-away-from-home',
    tone: 'navy',
  },
  {
    title: 'For the impossible to shop for',
    to: '/postcards/christmas-gifts-for-people-who-are-impossible-to-shop-for',
    tone: 'brick',
  },
  {
    title: 'The Trans-Canada Highway',
    to: '/postcards/trans-canada-highway-souvenirs',
    tone: 'mustard',
  },
  {
    title: 'A Rust Belt gift guide',
    to: '/postcards/rust-belt-gift-guide',
    tone: 'bay',
  },
];

export function MegaNav() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const entries = buildNav().filter(isGroup);

  useEffect(() => setOpenIndex(null), [location.pathname]);

  useEffect(() => {
    if (openIndex === null) return;
    const onPointerDown = (event: MouseEvent) => {
      const header = navRef.current?.closest('.sh');
      if (header && !header.contains(event.target as Node)) setOpenIndex(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpenIndex(null);
      navRef.current
        ?.querySelectorAll<HTMLButtonElement>('.mega-trigger')
        ?.[openIndex]?.focus();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openIndex]);

  // A short grace period so moving the pointer diagonally from a trigger to
  // its panel does not snap the menu shut.
  const openSoon = (index: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpenIndex(index), 90);
  };
  const closeSoon = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpenIndex(null), 180);
  };
  const keep = () => {
    if (timer.current) clearTimeout(timer.current);
  };
  const close = () => setOpenIndex(null);

  return (
    <nav
      className="mega"
      aria-label="Main"
      ref={navRef}
      onMouseLeave={closeSoon}
      onMouseEnter={keep}
    >
      {entries.map((entry, index) => {
        const open = openIndex === index;
        const panelId = `mega-panel-${index}`;
        return (
          <div className="mega-item" key={entry.title}>
            <button
              type="button"
              className="mega-trigger"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenIndex(open ? null : index)}
              onMouseEnter={() => openSoon(index)}
            >
              {entry.title}
              <svg viewBox="0 0 10 6" width="9" height="6" aria-hidden="true">
                <path
                  d="M1 1l4 4 4-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            </button>
            <div
              id={panelId}
              className="mega-panel"
              hidden={!open}
              onMouseEnter={keep}
            >
              <div className="mega-inner">
                <MegaContent entry={entry} onNavigate={close} open={open} />
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function MegaContent({
  entry,
  onNavigate,
  open,
}: {
  entry: NavGroup;
  onNavigate: () => void;
  open: boolean;
}) {
  if (entry.title === 'Shop') {
    return (
      <div className="mega-shop">
        <div className="mega-prints">
          {PRINTS.map((print) => (
            <Link
              key={print.value}
              to={`/collections/${print.value}`}
              className="mega-print"
              data-colour={print.colour}
              onClick={onNavigate}
              prefetch="intent"
            >
              <span className="mega-print-art">{print.sample}</span>
              <span className="mega-print-name">{print.name}</span>
              <span className="mega-print-blurb">{print.blurb}</span>
            </Link>
          ))}
        </div>
        <MegaLinks
          heading="Browse"
          items={entry.items.filter(
            (item) => !PRINTS.some((p) => item.to.endsWith(`/${p.value}`)),
          )}
          onNavigate={onNavigate}
        />
      </div>
    );
  }

  if (entry.title === 'Canada' || entry.title === 'USA') {
    const country = entry.title === 'Canada' ? 'Canada' : 'United States';
    const [all, ...regions] = entry.items;
    return (
      <div
        className="mega-country"
        data-country={entry.title === 'Canada' ? 'ca' : 'us'}
      >
        <div className="mega-map">
          {open ? (
            <Suspense fallback={<div className="mega-map-fallback" />}>
              <MegaMap country={country} onNavigate={onNavigate} />
            </Suspense>
          ) : null}
        </div>
        <div className="mega-regions">
          <span className="mega-heading">
            {entry.title === 'Canada'
              ? '13 provinces & territories'
              : '50 states'}
          </span>
          <ul data-many={regions.length > 20 || undefined}>
            {regions.map((item) => (
              <li key={item.to}>
                <Link to={item.to} onClick={onNavigate} prefetch="intent">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mega-foot">
            <Link to={all.to} onClick={onNavigate} className="mega-cta">
              {all.title} →
            </Link>
            <Link to="/towns" onClick={onNavigate}>
              Every town, A to Z →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (entry.title === 'Gifts') {
    const extra = entry.items.filter(
      (item) => !GUIDES.some((guide) => guide.to === item.to),
    );
    return (
      <div className="mega-gifts">
        <div className="mega-guides">
          {GUIDES.map((guide) => (
            <Link
              key={guide.to}
              to={guide.to}
              className="mega-guide"
              data-tone={guide.tone}
              onClick={onNavigate}
              prefetch="intent"
            >
              <span className="mega-guide-kicker">Gift guide</span>
              <span className="mega-guide-title">{guide.title}</span>
              <span className="mega-guide-go">Read it →</span>
            </Link>
          ))}
        </div>
        <MegaLinks heading="Also" items={extra} onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div className="mega-co">
      <MegaLinks
        heading="The company"
        items={entry.items}
        onNavigate={onNavigate}
      />
      <Link
        to="/collections/all-souvenirs"
        className="mega-promo"
        onClick={onNavigate}
      >
        <span className="mega-promo-kicker">The collector&rsquo;s deal</span>
        <span className="mega-promo-title">
          Two shirts, 15% off.
          <br />
          Three or more, 20% off.
        </span>
        <span className="mega-promo-note">
          Mix any towns. Applied at checkout.
        </span>
      </Link>
    </div>
  );
}

function MegaLinks({
  heading,
  items,
  onNavigate,
}: {
  heading: string;
  items: NavLeaf[];
  onNavigate: () => void;
}) {
  return (
    <div className="mega-links">
      <span className="mega-heading">{heading}</span>
      <ul>
        {items.map((item) => (
          <li key={item.to}>
            <Link to={item.to} onClick={onNavigate} prefetch="intent">
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
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
