/** The horizontal furniture: announcement bar, marquee, trust bar. */

const ANNOUNCEMENTS = [
  'FREE SHIPPING OVER $75 · CANADA & USA',
  'NEW TOWNS IN DUE TIME',
  'NOW OPEN: THE GREAT LAKES · TOLEDO, PITTSBURGH, DETROIT, GARY, ROCKFORD',
  'COLLECT 2 SAVE 15% · COLLECT 3 SAVE 20%',
];

/**
 * Rotating announcement bar.
 *
 * All lines render into the DOM and CSS cycles them, so there is no layout
 * shift, no hydration mismatch from a random first frame, and the whole set is
 * available to a screen reader at once rather than one line at a time.
 */
export function AnnouncementBar() {
  return (
    <div className="announcement-bar">
      <div className="announcement-rotator">
        {ANNOUNCEMENTS.map((line, i) => (
          <span
            key={line}
            className="announcement-line"
            style={{animationDelay: `${i * 4}s`}}
          >
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}

const MARQUEE_ITEMS = [
  'COLLECT 2 SAVE 15%',
  'NEW TOWNS WEEKLY',
  'GENUINE SOUVENIR',
  'FREE SHIPPING $75+',
  'CANADA & USA',
];

export function MarqueeStrip({variant}: {variant?: 'mustard'}) {
  // content rendered twice so the 50% translate loops seamlessly
  const run = (key: string) => (
    <div className="marquee-content" key={key} aria-hidden={key === 'b'}>
      {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
        <span key={i}>{item} ★</span>
      ))}
    </div>
  );
  return (
    <div className={`marquee${variant === 'mustard' ? ' marquee--mustard' : ''}`}>
      <div className="marquee-track">
        {run('a')}
        {run('b')}
      </div>
    </div>
  );
}

const TRUST_ITEMS = [
  {
    title: 'Easy returns',
    note: '30 days. No interrogation.',
  },
  {
    title: 'Free shipping over $75',
    note: 'Canada and the US. The mail knows where your town is.',
  },
  {
    title: 'Secure checkout',
    note: 'Shopify handles the money. We handle the reverence.',
  },
  {
    title: 'Printed to order',
    note: 'Allow 5–10 business days. Genuine takes time.',
  },
];

export function TrustBar() {
  return (
    <div className="trust-bar">
      {TRUST_ITEMS.map((item) => (
        <div className="trust-item" key={item.title}>
          <div className="trust-item-title">{item.title}</div>
          <div className="trust-item-note">{item.note}</div>
        </div>
      ))}
    </div>
  );
}
