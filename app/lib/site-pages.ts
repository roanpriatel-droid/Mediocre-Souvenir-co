import {POLICIES} from './policies';

/**
 * Every non-catalog page on the site, in one list.
 *
 * Two consumers depend on it and used to drift apart: the sitemap (which had
 * a hand-kept array of paths) and site search (which could not find a guide
 * even when someone typed its name). Adding a page here puts it in both.
 */

export interface SitePage {
  path: string;
  title: string;
  /** One line, shown in search results. */
  summary: string;
  /** Extra words people search for that are not in the title. */
  keywords: string[];
  group: 'Guides' | 'The Co.' | 'The fine print';
  /** Excluded from the sitemap — thin, transactional, or noindex by nature. */
  noindex?: boolean;
}

const CORE_PAGES: SitePage[] = [
  {
    path: '/collections/all-souvenirs',
    title: 'All souvenirs',
    summary: 'Every shirt in the shop, every region we have reached.',
    keywords: ['shop', 'browse', 'all', 'catalog', 'products', 'tees', 'shirts'],
    group: 'The Co.',
  },
  {
    path: '/collections/now-open',
    title: 'Now open',
    summary: 'The regions we have actually gotten to, and what is on their racks.',
    keywords: ['open', 'available', 'live', 'in stock'],
    group: 'The Co.',
  },
  {
    path: '/collections/canada',
    title: 'Canada',
    summary: 'Every Canadian province and territory on the rack.',
    keywords: ['canada', 'canadian', 'provinces', 'territories'],
    group: 'The Co.',
  },
  {
    path: '/collections/united-states',
    title: 'United States',
    summary: 'Every US state on the rack.',
    keywords: ['usa', 'us', 'america', 'states'],
    group: 'The Co.',
  },
  {
    path: '/towns',
    title: 'The Towns',
    summary:
      'The full A–Z directory of all 63 provinces and states, set like a motel letterboard.',
    keywords: ['directory', 'a-z', 'index', 'all towns', 'regions', 'board', 'list'],
    group: 'The Co.',
  },
  {
    path: '/our-story',
    title: 'Our story',
    summary:
      'Every town deserves a souvenir, even the ones that don’t. Why any of this exists.',
    keywords: ['about', 'story', 'founded', 'why', 'mission', 'history'],
    group: 'The Co.',
  },
  {
    path: '/certificate',
    title: 'Certificate of Mediocre Authenticity',
    summary:
      'The document that ships with every order and declines to overstate a single thing.',
    keywords: ['certificate', 'authenticity', 'card', 'included', 'coa'],
    group: 'The Co.',
  },
  {
    path: '/postcards',
    title: 'Postcards From Nowhere',
    summary:
      'Short dispatches from the towns we print — Toledo, Gary, Rockford and the rest.',
    keywords: ['blog', 'postcards', 'writing', 'travel', 'editorial', 'journal', 'stories'],
    group: 'The Co.',
  },
  {
    path: '/shipping-returns',
    title: 'Shipping & returns',
    summary:
      'We ship everywhere, even places nicer than the ones on our shirts. 30-day returns.',
    keywords: ['shipping', 'returns', 'delivery', 'how long', 'exchange', 'refund', 'free shipping'],
    group: 'Guides',
  },
  {
    path: '/collections',
    title: 'Collections',
    summary:
      'Every rack in the shop: all souvenirs, new arrivals, what is open now, and one per region.',
    keywords: ['racks', 'curated', 'filed', 'categories'],
    group: 'The Co.',
  },
  {
    path: '/provinces',
    title: 'Browse by region',
    summary:
      'All 63 provinces, territories and states — every one of them open, none of them famous.',
    keywords: ['provinces', 'states', 'region', 'canada', 'united states', 'map', 'waitlist'],
    group: 'The Co.',
  },
  {
    path: '/collections/new-arrivals',
    title: 'New arrivals',
    summary: 'The latest towns to be taken as seriously as they always should have been.',
    keywords: ['new', 'latest', 'recent', 'just added'],
    group: 'The Co.',
  },
  {
    path: '/lookbook',
    title: 'The Lookbook',
    summary:
      'A road trip through the British Columbia collection, in driving order, every stop shoppable.',
    keywords: ['road trip', 'photos', 'styling', 'highway'],
    group: 'The Co.',
  },
  {
    path: '/request-a-town',
    title: 'Request your town',
    summary:
      'Tell us your hometown and join its waitlist. Requests decide which town gets printed next.',
    keywords: ['waitlist', 'suggest', 'submit', 'my town', 'hometown', 'add'],
    group: 'The Co.',
  },
  {
    path: '/contact',
    title: 'Contact',
    summary: 'Write to us about an order, a town, or a fact we got wrong. Answered within two business days.',
    keywords: ['email', 'help', 'support', 'customer service', 'get in touch'],
    group: 'The Co.',
  },
];

const GUIDE_PAGES: SitePage[] = [
  {
    path: '/materials',
    title: 'Materials & construction',
    summary:
      'Comfort Colors 1717: 6.1 oz heavyweight ring-spun cotton, garment-dyed so the fade is structural.',
    keywords: [
      'fabric',
      'cotton',
      'comfort colors',
      '1717',
      'garment dyed',
      'weight',
      'gsm',
      'blank',
      'quality',
    ],
    group: 'Guides',
  },
  {
    path: '/size-guide',
    title: 'Size & fit guide',
    summary:
      'Measurements for unisex S–3XL, plus a find-my-size flow and notes on how the cotton relaxes.',
    keywords: [
      'sizing',
      'size chart',
      'measurements',
      'fit',
      'chest',
      'length',
      'small',
      'large',
      'xl',
      '3xl',
      'what size',
    ],
    group: 'Guides',
  },
  {
    path: '/care',
    title: 'Care guide',
    summary:
      'Wash cold, inside out, hang dry if you love it. How to keep the fade honest for thirty years.',
    keywords: ['washing', 'laundry', 'dry', 'iron', 'shrink', 'bleach', 'instructions'],
    group: 'Guides',
  },
  {
    path: '/faq',
    title: 'Frequently asked questions',
    summary:
      'Shipping times, returns, the collect-more discount, sizing, and how towns get added.',
    keywords: ['questions', 'help', 'answers', 'discount', 'ladder', 'support'],
    group: 'Guides',
  },
];

/** Policy pages ride along automatically, so a new policy is searchable at once. */
const POLICY_PAGES: SitePage[] = POLICIES.map((policy) => ({
  path: `/policies/${policy.handle}`,
  title: policy.title,
  summary: policy.lead,
  keywords: [
    policy.navLabel.toLowerCase(),
    'policy',
    'fine print',
    ...(policy.handle === 'shipping-policy'
      ? ['delivery', 'how long', 'tracking', 'free shipping', 'duties']
      : []),
    ...(policy.handle === 'refund-policy'
      ? ['returns', 'refund', 'exchange', 'send back', '30 days', 'cancel']
      : []),
    ...(policy.handle === 'privacy-policy'
      ? ['data', 'cookies', 'gdpr', 'personal information', 'delete']
      : []),
    ...(policy.handle === 'terms-of-service'
      ? ['terms', 'legal', 'conditions', 'copyright', 'liability']
      : []),
    ...(policy.handle === 'accessibility'
      ? ['a11y', 'wcag', 'screen reader', 'contrast', 'keyboard']
      : []),
  ],
  group: 'The fine print' as const,
}));

export const SITE_PAGES: SitePage[] = [
  ...CORE_PAGES,
  ...GUIDE_PAGES,
  ...POLICY_PAGES,
];

/** Paths for the sitemap — the home page plus everything indexable here. */
export function sitemapPagePaths(): string[] {
  return ['/', ...SITE_PAGES.filter((page) => !page.noindex).map((p) => p.path)];
}

export function searchSitePages(query: string, limit = 6): SitePage[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SITE_PAGES.filter((page) => {
    const haystack = [page.title, page.summary, ...page.keywords]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  }).slice(0, limit);
}
