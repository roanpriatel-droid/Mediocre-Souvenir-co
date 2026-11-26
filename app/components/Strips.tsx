/** The horizontal furniture: announcement bar, marquee, trust bar. */

const ANNOUNCEMENTS = [
  'Free shipping over $60 · Canada & USA',
  'Collect 2, save 15% · Collect 3, save 20%',
  'New: four vintage colours · Ivory, Bay, Blue Jean, Brick',
  'Printed to order on garment-dyed Comfort Colors 1717',
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
  'FREE SHIPPING $60+ USD',
  'NOW SHIPPING WORLDWIDE',
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
    <div
      className={`marquee${variant === 'mustard' ? ' marquee--mustard' : ''}`}
    >
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
    title: 'Free shipping over $60',
    note: 'In Canada and the US, in US dollars. Worldwide from $10.',
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
