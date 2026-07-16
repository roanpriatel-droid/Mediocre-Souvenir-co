import {LADDER, PRICE} from '~/lib/catalog';

/**
 * COLLECT MORE, PAY LESS — the gift shop price card.
 * The discount itself is a Shopify automatic discount (mix and match, no
 * code, applies at checkout). Configure it in the real store admin before
 * launch — see the LAUNCH TODO in README.md — or checkout won't honor it.
 */
export function CollectLadder() {
  const base = Number(PRICE.amount);
  return (
    <div className="collect-ladder">
      <div className="msc-kicker">House rules</div>
      <h2>Collect more, pay less</h2>
      <div className="collect-ladder-tiers">
        {LADDER.map((tier) => {
          const each = (base * (1 - tier.discount)).toFixed(2).replace('.00', '');
          return (
            <div
              key={tier.qty}
              className={`collect-ladder-tier${
                tier.discount > 0 ? ' collect-ladder-tier--highlight' : ''
              }`}
            >
              <span className="collect-ladder-qty">{tier.label}</span>
              <span className="collect-ladder-deal">{tier.deal}</span>
              <span className="collect-ladder-each">${each} each</span>
            </div>
          );
        })}
      </div>
      <p className="collect-ladder-note">
        Mix and match any towns. Applies automatically at checkout — no code,
        no ceremony.
      </p>
    </div>
  );
}

/** Compact tier strip for the product page. */
export function ProductLadderStrip() {
  return (
    <div className="product-ladder-strip" aria-label="Quantity discounts">
      {LADDER.map((tier) => (
        <div key={tier.qty} className={tier.discount > 0 ? 'is-deal' : ''}>
          {tier.label}: {tier.deal}
        </div>
      ))}
    </div>
  );
}
