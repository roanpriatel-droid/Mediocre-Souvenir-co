/** The horizontal furniture: announcement bar, marquee, trust bar. */

export function AnnouncementBar() {
  return (
    <div className="announcement-bar">
      GENUINE SOUVENIRS · FREE CANADIAN SHIPPING OVER $75
    </div>
  );
}

const MARQUEE_ITEMS = [
  'COLLECT 2 SAVE 15%',
  'NEW TOWNS WEEKLY',
  'GENUINE SOUVENIR',
  'FREE SHIPPING $75+',
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
    note: 'Anywhere in Canada. The mail knows where your town is.',
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
