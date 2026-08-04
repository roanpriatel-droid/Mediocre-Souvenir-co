import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';

/**
 * The bar that appears once the hero has gone.
 *
 * Above the fold the hero carries the offer and the buttons. Below it the page
 * is nine sections long and, until now, the only way back to a buying decision
 * was the header — which on this store is a wordmark, a small search and a
 * cart. This restores the two things that were on screen at the start: where
 * the visitor is, and what it costs.
 *
 * It observes the hero rather than a scroll offset, so it appears at the
 * moment the hero actually leaves rather than at a hard-coded pixel that would
 * be wrong on every other viewport. No JavaScript, no bar — which is correct,
 * since without JavaScript the page still has a header.
 */
export function StickyShopBar({
  region,
  total,
}: {
  region: {slug: string; name: string; total: number} | null;
  total: number;
}) {
  const [shown, setShown] = useState(false);
  const seen = useRef(false);

  useEffect(() => {
    const hero = document.querySelector('.hero');
    if (!hero || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only ever show it after the hero has been on screen and left, so a
        // deep link that lands mid-page does not open with a bar the visitor
        // has no context for.
        if (entry.isIntersecting) seen.current = true;
        setShown(seen.current && !entry.isIntersecting);
      },
      {threshold: 0},
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="sticky-shop" data-shown={shown || undefined} aria-hidden={!shown}>
      <div className="sticky-shop-inner">
        <p className="sticky-shop-copy">
          {region ? (
            <>
              <strong>{region.name}</strong>
              <span>{region.total} souvenirs · $36 USD · free shipping over $60</span>
            </>
          ) : (
            <>
              <strong>{total.toLocaleString('en-CA')} souvenirs</strong>
              <span>63 regions · $36 USD · free shipping over $60</span>
            </>
          )}
        </p>
        <div className="sticky-shop-actions">
          <Link
            className="msc-button"
            to={region ? `/collections/${region.slug}` : '/collections/all-souvenirs'}
            tabIndex={shown ? undefined : -1}
          >
            {region ? `Shop ${region.name}` : 'Shop all souvenirs'}
          </Link>
          <Link
            className="msc-button msc-button--ghost"
            to="/towns"
            tabIndex={shown ? undefined : -1}
          >
            Find your town
          </Link>
        </div>
      </div>
    </div>
  );
}
