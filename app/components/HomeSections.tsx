import {Link} from 'react-router';
import {useNonce} from '@shopify/hydrogen';
import {PRINT_STYLES} from '~/lib/shopify-catalog';
import {SIZE_TABLE} from '~/components/SizeGuide';
import {SIZES} from '~/lib/catalog';

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
    h: 'Free shipping over $75',
    p: 'Canada and the United States, which is two shirts and change — and two shirts is where the discount starts anyway.',
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
    a: 'Longer than you would like, and we are sorry about that. Every shirt is printed after you order it, so allow 5–10 business days before it moves, then transit on top. Free over $75 in Canada and the US, which does not make the wait shorter but does make it cheaper.',
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
