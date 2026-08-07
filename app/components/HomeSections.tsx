import {Link} from 'react-router';
import {useNonce} from '@shopify/hydrogen';
import {PRINT_STYLES} from '~/lib/shopify-catalog';
import {SIZE_TABLE} from '~/components/SizeGuide';
import {SIZES} from '~/lib/catalog';
import {TownSearch} from '~/components/TownSearch';

/**
 * The homepage's middle game.
 *
 * Everything here answers a question that otherwise gets answered by closing
 * the tab: which one do I pick, what happens after I pay, will it fit, what if
 * I hate it, and the five things people email about. None of it invents a
 * claim — every number and promise below is the one already published on
 * /materials, /shipping-returns, /size-guide and /faq, said once more at the
 * moment it changes a decision rather than only on the page nobody visits.
 */

/* ------------------------------------------------------------------ *
 * 1 · Shop by print
 * ------------------------------------------------------------------ */

const STYLE_NOTES: Record<string, {line: string; note: string}> = {
  varsity: {
    line: 'The one the town would print itself',
    note: 'Block letters, arched, ATHLETIC DEPT. underneath. No team, no sport, no record.',
  },
  greetings: {
    line: 'The postcard, worn',
    note: 'Script header over letter-blocks, the way a rack card spelled a place out in 1974.',
  },
  'i-heart': {
    line: 'The declaration',
    note: 'One heart, one town, no further explanation offered or required.',
  },
  tour: {
    line: 'The tour that never happened',
    note: 'Back-of-the-shirt energy for a summer that was, by every account, fine.',
  },
};

export function PrintStyles() {
  return (
    <div className="home-styles">
      {PRINT_STYLES.map((style) => {
        const copy = STYLE_NOTES[style.value];
        return (
          <Link
            className="home-style"
            key={style.value}
            to={`/collections/all-souvenirs?style=${style.value}`}
            prefetch="intent"
          >
            <span className="msc-kicker msc-kicker--navy">{style.label}</span>
            <strong>{copy.line}</strong>
            <span className="home-style-note">{copy.note}</span>
            <span className="collection-card-more">See the rack →</span>
          </Link>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 2 · How it works
 * ------------------------------------------------------------------ */

const STEPS = [
  {
    n: '01',
    h: 'Find your town',
    p: 'Sixty-three regions, every one of them open. Search it, or browse the directory until something you have driven through appears.',
  },
  {
    n: '02',
    h: 'We print it after you order',
    p: 'On a Comfort Colors 1717 — 6.1 oz, garment-dyed, so the fade is in the fabric. Five to ten business days before it moves, because nothing is sitting in a warehouse waiting to be a landfill problem.',
  },
  {
    n: '03',
    h: 'It arrives with paperwork',
    p: 'A Certificate of Mediocre Authenticity on card stock, confirming your town is — to the best of our knowledge — a place. Distinction: none on record.',
  },
];

export function HowItWorks() {
  return (
    <ol className="home-steps">
      {STEPS.map((step) => (
        <li className="home-step" key={step.n}>
          <span className="home-step-n" aria-hidden="true">
            {step.n}
          </span>
          <h3>{step.h}</h3>
          <p>{step.p}</p>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ *
 * 3 · Size and fit
 * ------------------------------------------------------------------ */

export function SizeAndFit() {
  return (
    <div className="home-fit">
      <div className="home-fit-copy">
        <span className="msc-kicker">Unisex · S–3XL · true to size</span>
        <h2 id="size-fit">It fits like a shirt you already own.</h2>
        <p>
          Unisex sizing, cut true, S through 3XL. The cotton relaxes about half
          a size as it breaks in, which is the only surprise in the garment and
          a pleasant one. If you are between sizes, size down and wait a week.
        </p>
        <div className="home-fit-actions">
          <Link className="msc-button msc-button--ghost" to="/size-guide">
            Full measurements
          </Link>
          <Link className="msc-button msc-button--ghost" to="/materials">
            What it is made of
          </Link>
        </div>
      </div>

      <table className="home-fit-table">
        <caption>Garment chest, flat, in inches</caption>
        <thead>
          <tr>
            <th scope="col">Size</th>
            {SIZES.map((size) => (
              <th scope="col" key={size}>
                {size}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Chest</th>
            {SIZES.map((size) => (
              <td key={size}>{SIZE_TABLE[size].chest}&Prime;</td>
            ))}
          </tr>
          <tr>
            <th scope="row">Length</th>
            {SIZES.map((size) => (
              <td key={size}>{SIZE_TABLE[size].length}&Prime;</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 4 · What every order includes
 * ------------------------------------------------------------------ */

const INCLUDED = [
  {
    h: 'Thirty-day returns',
    p: 'No interrogation, no restocking fee, no form asking you to rate your disappointment out of five. Size exchanges work the same way.',
  },
  {
    h: 'Free shipping over $60 USD',
    p: 'In Canada and the United States, which is two shirts and change — and two shirts is where the discount starts anyway. Everywhere else ships from $10.',
  },
  {
    h: '15% off two, 20% off three',
    p: 'Applied automatically at checkout. Mix any towns you like. There is no code to hunt for and no newsletter to join first.',
  },
  {
    h: 'The certificate, always',
    p: 'Card stock, signed, in every order. It certifies almost nothing and it does so formally.',
  },
];

export function OrderIncludes() {
  return (
    <ul className="home-includes">
      {INCLUDED.map((item) => (
        <li key={item.h}>
          <h3>{item.h}</h3>
          <p>{item.p}</p>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ *
 * 5 · The five questions people actually ask
 * ------------------------------------------------------------------ */

const HOME_FAQS = [
  {
    q: 'How long does shipping take? Honestly?',
    a: 'Longer than you would like, and we are sorry about that. Every shirt is printed after you order it, so allow 5–10 business days before it moves, then transit on top. Free over $60 in Canada and the US, which does not make the wait shorter but does make it cheaper. Elsewhere allow 13–35 days for transit.',
  },
  {
    q: 'What if I do not like it?',
    a: 'Thirty days, no interrogation, no restocking fee. Send it back in wearable condition and we refund it. Size exchanges work the same way.',
  },
  {
    q: 'How do the sizes run?',
    a: 'Unisex, true to size, S–3XL. The cotton relaxes about half a size as it breaks in. Full measurements and a find-my-size flow are on the Size & Fit Guide.',
  },
  {
    q: 'What shirt do you print on?',
    a: 'The Comfort Colors 1717: heavyweight 6.1 oz, 100% ring-spun cotton, garment-dyed so the faded look is in the fabric, not printed on. We do not substitute lighter blanks.',
  },
  {
    q: 'Can I wear a town I have never been to?',
    a: 'Yes. A souvenir commemorates a place, not your attendance record. Nobody interrogates a person in a NASA shirt about their spacewalks.',
  },
];

export function HomeFaq({origin}: {origin: string}) {
  const nonce = useNonce();
  return (
    <>
      <div className="home-faq">
        {HOME_FAQS.map((faq) => (
          <details className="home-faq-item" key={faq.q}>
            <summary>{faq.q}</summary>
            <p>{faq.a}</p>
          </details>
        ))}
      </div>

      {/*
        The same five questions as structured data. Google renders FAQ rich
        results from this, which is free width in the search listing for a
        store that cannot buy its way to one.
      */}
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            '@id': `${origin}/#faq`,
            mainEntity: HOME_FAQS.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: {'@type': 'Answer', text: faq.a},
            })),
          }),
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ *
 * 6 · Type your town
 * ------------------------------------------------------------------ */

/**
 * The highest-intent action on the store, finally given room.
 *
 * Somebody who types their own hometown into a search box has already decided
 * they want the thing; they are only checking whether it exists. Until now
 * that box lived at 15px in the header, competing with a wordmark and a cart.
 * The component's full-size mode — bigger field, live suggestions, the hint
 * line underneath — was written months ago and had no caller.
 */
export function TownSearchBlock({total}: {total: number}) {
  return (
    <div className="home-search">
      <span className="msc-kicker">The whole point</span>
      <h2 id="find-town">Type your town. We probably have it.</h2>
      <p>
        {total.toLocaleString('en-CA')} souvenirs across sixty-three regions,
        and none of them are for anywhere famous. If yours is not on the rack
        yet, the box will say so and offer to put it on the list.
      </p>
      <div className="home-search-field">
        <TownSearch />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 7 · The print, up close
 * ------------------------------------------------------------------ */

/**
 * Texture, from the photography that already exists.
 *
 * The store owns one mockup repeated two thousand times, which is the ceiling
 * on how rich this page can look — at normal zoom. At 6x it stops being a
 * repeated photograph and becomes ink on garment-dyed cotton, which is exactly
 * the thing the product page is trying to describe in words. Same files, same
 * CDN, no new assets and no new photography budget.
 *
 * Plain <img> rather than Hydrogen's <Image> on purpose: that component writes
 * an inline style="width:100%", and an inline style beats the stylesheet that
 * does the zooming. See the hero wall for the bug that taught us this.
 */
export function PrintCloseUps({
  tiles,
}: {
  tiles: {id: string; url: string; town: string; handle: string}[];
}) {
  if (!tiles.length) return null;
  return (
    <div className="home-macro">
      {tiles.slice(0, 4).map((tile, i) => (
        <Link
          className="home-macro-cell"
          key={tile.id}
          to={`/products/${tile.handle}`}
          prefetch="intent"
          data-slot={i}
        >
          <img
            src={`${tile.url}${tile.url.includes('?') ? '&' : '?'}width=900&height=900&crop=center`}
            alt={`The print on the ${tile.town} souvenir, close up`}
            loading="lazy"
            decoding="async"
          />
          <span className="home-macro-label">{tile.town}</span>
        </Link>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 8 · The gift case
 * ------------------------------------------------------------------ */

export function GiftBlock() {
  return (
    <div className="home-gift">
      <div className="home-gift-copy">
        <span className="msc-kicker">For someone from there</span>
        <h2 id="gift">
          Nobody has ever bought their father a shirt from Trail before.
        </h2>
        <p>
          The best souvenir is not for the person who went. It is for the person
          who <em>left</em> — who grew up on that highway, who still says the
          name with a certain defensiveness, and who has never once seen it
          printed on anything.
        </p>
        <p className="home-gift-note">
          Find the town they are from, not the town they live in. That is the
          whole trick, and it works every time.
        </p>
        <div className="home-fit-actions">
          <Link className="msc-button" to="/towns">
            Find their town
          </Link>
          <Link className="msc-button msc-button--ghost" to="/certificate">
            What&rsquo;s in the box
          </Link>
        </div>
      </div>
      <ul className="home-gift-list">
        <li>
          <strong>Arrives with a certificate</strong>
          <span>
            Card stock, signed, formally attesting that their hometown is a
            place. It reads like a joke and hangs like a diploma.
          </span>
        </li>
        <li>
          <strong>Unisex, S–3XL, true to size</strong>
          <span>
            The one measurement you have to guess is the one most forgiving to
            guess wrong. Exchanges are thirty days, no interrogation.
          </span>
        </li>
        <li>
          <strong>Two shirts save 15%</strong>
          <span>
            Which is convenient, because you are going to want the one from
            your own town too.
          </span>
        </li>
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 9 · The manifesto
 * ------------------------------------------------------------------ */

export function Manifesto() {
  return (
    <div className="home-manifesto">
      <p className="home-manifesto-mark" aria-hidden="true">
        &ldquo;
      </p>
      <blockquote>
        <p>
          Hawaii gets the full treatment. Sunset script, a state flower, four
          fonts and a hibiscus. Meanwhile a town of nine thousand people with a
          working mill, one good diner and a hockey rink named after somebody&rsquo;s
          father gets nothing — not a magnet, not a spoon, not a shirt.
        </p>
        <p>
          We could not find a reason for that. So we print the overlooked places
          with the exact reverence a gift shop in Maui would use, and we do not
          wink while we do it. The joke, if there is one, is that there was
          never anything funny about it.
        </p>
      </blockquote>
      <div className="home-manifesto-sig">
        <span>Mediocre Souvenir Co.</span>
        <Link to="/about">Why we do this →</Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 10 · The numbers
 * ------------------------------------------------------------------ */

export function BigNumbers({
  total,
  regions,
}: {
  total: number;
  regions: number;
}) {
  const stats = [
    {n: total.toLocaleString('en-CA'), l: 'Souvenirs in print'},
    {n: String(regions), l: 'Regions, all open'},
    {n: '4', l: 'Ways to say a town'},
    {n: '0', l: 'Famous places'},
  ];
  return (
    <dl className="home-numbers">
      {stats.map((stat) => (
        <div key={stat.l}>
          <dt>{stat.n}</dt>
          <dd>{stat.l}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ------------------------------------------------------------------ *
 * 11 · The biggest racks
 * ------------------------------------------------------------------ */

/**
 * Depth as a credibility signal.
 *
 * The honest version of a bestseller row. There is no order data here to rank
 * by and inventing one would be the single most off-brand thing this store
 * could do — but "Ontario holds 94" is true, checkable, and answers the same
 * question a shopper is really asking, which is whether anyone is home.
 */
export function BiggestRacks({
  racks,
}: {
  racks: {slug: string; name: string; total: number}[];
}) {
  if (!racks.length) return null;
  const most = racks[0]?.total || 1;
  return (
    <ol className="home-racks">
      {racks.map((rack, i) => (
        <li key={rack.slug}>
          <Link to={`/collections/${rack.slug}`} prefetch="intent">
            <span className="home-rack-pos" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="home-rack-name">{rack.name}</span>
            {/* The bar is the ranking, drawn to scale. */}
            <span
              className="home-rack-bar"
              aria-hidden="true"
              style={{'--fill': `${Math.round((rack.total / most) * 100)}%`} as React.CSSProperties}
            />
            <span className="home-rack-total">{rack.total}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
