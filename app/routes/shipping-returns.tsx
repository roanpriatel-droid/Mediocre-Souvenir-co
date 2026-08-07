import {Link, useLoaderData} from 'react-router';
import {useNonce} from '@shopify/hydrogen';
import type {Route} from './+types/shipping-returns';
import {Reveal} from '~/components/Reveal';
import {getPolicy, SUPPORT_EMAIL} from '~/lib/policies';
import {SITE_NAME} from '~/lib/seo';

/**
 * Shipping and returns on one page, because that is how people ask about it.
 * The canonical legal documents still live at /policies/*; this is the plain
 * answer with a link to the fine print. Every number here is taken from those
 * documents — if one changes there, change it here too.
 */

export const meta: Route.MetaFunction = ({data}) => [
  {title: `Shipping & Returns — We Ship Everywhere | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'We ship everywhere, even places nicer than the ones on our shirts. ' +
      'Printed to order in 5–10 business days, free over $60 USD, and 30-day ' +
      'returns with no interrogation.',
  },
  ...(data
    ? [
        {
          tagName: 'link' as const,
          rel: 'canonical',
          href: `${data.origin}/shipping-returns`,
        },
      ]
    : []),
];

export async function loader({request}: Route.LoaderArgs) {
  return {origin: new URL(request.url).origin};
}

/** The four numbers people actually came for. */
const FACTS = [
  ['Free', 'Shipping over $60 USD'],
  ['5–10', 'Business days to print'],
  ['3–35', 'Business days in transit'],
  ['30', 'Days to send it back'],
];

const ROUTE_STOPS = [
  {
    label: 'You order',
    when: 'day one',
    note: 'Nothing happens for a moment. This is correct.',
  },
  {
    label: 'It goes to press',
    when: '5–10 days',
    note: 'The shirt is made because you asked for it. Nothing sat in a warehouse hoping.',
  },
  {
    label: 'In transit',
    when: '3–12 days',
    note: 'Standard post from Florida — three to eight business days inside the US, six to twelve into Canada, thirteen to thirty-five for the rest of the world. Tracking is emailed when the carrier takes it.',
  },
  {
    label: 'It arrives',
    when: 'a parcel',
    note: 'From somewhere unremarkable, with the certificate enclosed.',
  },
];

const RATES = [
  {
    name: 'Standard · Canada or the US',
    price: 'Free over $60',
    note: 'Under $60 it is a flat $6.95, shown before you pay. Three to eight business days once the shirt is printed. Prices and thresholds are in US dollars, in both countries.',
  },
  {
    name: 'Into Canada · the border',
    price: 'Same rates',
    note: 'The shirts are printed in Dania Beach, Florida, so a Canadian parcel is an import. Six to twelve business days, customs permitting, and the carrier may collect GST/HST and a handling fee on delivery — those are the recipient’s. We do not mark parcels as gifts and we do not understate their value.',
  },
  {
    name: 'Everywhere else',
    price: 'From $10',
    note: 'We ship worldwide from Florida: $10 for the first shirt and $4 for each one after it, quoted at checkout. Allow 13 to 35 business days, and expect your country to want its VAT or duty before the carrier hands the parcel over. The free-shipping threshold is a North American arrangement and does not apply.',
  },
  {
    name: 'One speed',
    price: 'No express',
    note: 'There is no expedited option, because the honest bottleneck is the press, not the post. Five to ten business days to print is the floor no carrier can move.',
  },
];

const RETURN_STEPS = [
  <>
    Write to <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with your
    order number and which shirt is going back. A person replies within two
    business days with an address.
  </>,
  <>
    Post it back within 30 days of delivery, in wearable condition — unworn
    beyond trying it on, unwashed. Tags help but are not required; we know what
    we printed.
  </>,
  <>
    We refund the original payment method within five business days of the
    parcel arriving. Your bank then takes as long as your bank takes.
  </>,
];

const COVERED = [
  'Arrived damaged or misprinted — send a photograph within 30 days and we replace it. Keep the damaged one; it has been through enough.',
  'Wrong shirt, our error — return shipping is ours, and so is the apology.',
  'Tracking has not moved in seven business days — we open a trace, and reprint at our cost if it is lost.',
  'Cancelled before it goes to press, usually within 24 hours of ordering — refunded in full.',
];

const NOT_A_DEFECT = [
  'Garment-dyed colour varies slightly between shirts and along the seams.',
  'Prints sit a hair off-register. On purpose.',
  'The cotton relaxes about half a size in the first month of wear.',
  'None of this is a fault — but if the shirt is not what you hoped for, the thirty days cover that too.',
];

const FAQS = [
  {
    q: 'Do you ship to somewhere nicer than the towns on the shirts?',
    a: 'Yes. We ship to street addresses in 235 countries, including every one with actual tourism. The shirt will not comment on your surroundings.',
  },
  {
    q: 'How much is shipping?',
    a: 'In Canada and the United States: free over $60 — two shirts, once the multi-town discount applies — and a flat $6.95 below that. Everywhere else: $10 for the first shirt and $4 for each one after. Every figure is US dollars, so a Canadian order is charged in USD too.',
  },
  {
    q: 'How long until it arrives?',
    a: 'Five to ten business days to print, then transit: three to eight inside the US, six to twelve into Canada, thirteen to thirty-five for everywhere else. Orders placed on a weekend or a statutory holiday start their clock on the next business day.',
  },
  {
    q: 'Where does it ship from?',
    a: 'A print shop in Dania Beach, Florida — an unremarkable place, which we consider on brand. Everything ships from there, including the Canadian orders and the ones crossing an ocean.',
  },
  {
    q: 'I typed my address wrong.',
    a: 'Tell us within 24 hours of ordering and we will correct it before the shirt goes to press. After that the parcel is in the carrier’s hands, and a returned-to-sender parcel has to be reshipped at your cost.',
  },
  {
    q: 'What if it does not fit?',
    a: 'Thirty days, no interrogation. Send it back in wearable condition and we refund it. Size exchanges work the same way, though they take another five to ten business days to print.',
  },
  {
    q: 'What if it arrives damaged?',
    a: 'Send a photograph within 30 days and we replace it. You do not need to return the damaged one; it has been through enough.',
  },
  {
    q: 'Tracking has not moved in days.',
    a: 'Tracking can take a day to start reporting movement, which is normal. If it has not moved in seven business days, write to us and we will open a trace with the carrier. A parcel confirmed lost is reprinted and reshipped at our cost.',
  },
  {
    q: 'Will I pay duties?',
    a: 'A US order never leaves the country, so no. Everything else does — it all ships from Florida. A Canadian parcel may be charged GST/HST and a handling fee; parcels elsewhere may be charged VAT, duty, or both. Those are the recipient’s, we cannot waive them, and they are not included in what you pay us. We would rather say this here than let a courier say it at your door.',
  },
];

export default function ShippingReturns() {
  const {origin} = useLoaderData<typeof loader>();
  const nonce = useNonce();
  const shipping = getPolicy('shipping-policy');
  const refund = getPolicy('refund-policy');

  return (
    <div className="ship-page">
      {/* The header is a parcel waybill, because that is what this page is. */}
      <header className="ship-hero msc-page">
        <div className="ship-waybill">
          <div className="ship-waybill-main">
            <span className="msc-kicker">Getting it to you</span>
            <h1>
              Shipping &amp;<br />
              returns.
            </h1>
            <p className="ship-lede">
              We ship worldwide — Canada, the United States, and 233 other
              countries, including every one nicer than the towns on our
              shirts. Printed after you order it, posted from somewhere
              unremarkable, and returnable for thirty days without an
              interview.
            </p>
            <nav className="ship-jump" aria-label="On this page">
              <a href="#ship-route">The route</a>
              <a href="#ship-rates">What it costs</a>
              <a href="#ship-returns">Returns</a>
              <a href="#ship-faq">Questions</a>
            </nav>
          </div>

          <div className="ship-waybill-side">
            <span className="msc-kicker msc-kicker--navy">Waybill</span>
            <dl className="ship-label-lines">
              <div>
                <dt>From</dt>
                <dd>Somewhere unremarkable, North America</dd>
              </div>
              <div>
                <dt>To</dt>
                <dd>Your town, wherever it is. Yes, that one.</dd>
              </div>
              <div>
                <dt>Contents</dt>
                <dd>One shirt. One certificate. No fanfare.</dd>
              </div>
            </dl>
            <div className="msc-stamp" aria-hidden="true">
              Genuine
              <br />
              Postage
              <br />★ ★ ★
            </div>
          </div>
        </div>

        <ul className="ship-facts">
          {FACTS.map(([value, label]) => (
            <li className="ship-fact" key={label}>
              <b>{value}</b>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </header>

      <section className="msc-section msc-page" aria-labelledby="ship-route">
        <div className="msc-section-rule">
          <h2 id="ship-route">The route.</h2>
          <span className="msc-section-note">Order to doorstep</span>
        </div>
        <Reveal>
          <ol className="ship-route">
            {ROUTE_STOPS.map((stop) => (
              <li className="ship-stop" key={stop.label}>
                <span className="ship-stop-rail" aria-hidden="true">
                  <span className="ship-stop-n" />
                </span>
                <strong className="ship-stop-label">{stop.label}</strong>
                <span className="ship-stop-when">{stop.when}</span>
                <p className="ship-stop-note">{stop.note}</p>
              </li>
            ))}
          </ol>
        </Reveal>
        <p className="ship-note">
          Orders placed on a weekend or a statutory holiday start their clock on
          the next business day. Parcels into Canada run six to twelve days,
          and the rest of the world thirteen to thirty-five, customs
          permitting. Genuine takes time.
        </p>
      </section>

      <section
        className="msc-section msc-section--band msc-page"
        aria-labelledby="ship-rates"
      >
        <div className="msc-section-rule">
          <h2 id="ship-rates">What it costs.</h2>
          <span className="msc-section-note">Rates, plainly</span>
        </div>
        <div className="ship-rates-layout">
          <Reveal>
            <div className="ship-rates">
              {RATES.map((rate) => (
                <div className="ship-rate" key={rate.name}>
                  <div className="ship-rate-head">
                    <span className="ship-rate-name">{rate.name}</span>
                    <span className="ship-rate-leader" aria-hidden="true" />
                    <span className="ship-rate-price">{rate.price}</span>
                  </div>
                  <p className="ship-rate-note">{rate.note}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={1}>
            <aside className="ship-nudge">
              <span className="msc-kicker msc-kicker--navy">
                A note on the threshold
              </span>
              <p>
                Free shipping is two shirts. Two shirts is 15% off anyway — the
                ladder applies automatically, mix-and-match, no code to
                remember. The threshold is North American; elsewhere shipping
                is $10 plus $4 a shirt. Every figure on this page is US
                dollars.
              </p>
              <Link className="msc-button msc-button--navy" to="/shop">
                Pick a town
              </Link>
              <span className="msc-marker">it adds up quietly.</span>
            </aside>
          </Reveal>
        </div>
      </section>

      <section className="msc-section msc-page" aria-labelledby="ship-returns">
        <div className="msc-section-rule">
          <h2 id="ship-returns">Returns.</h2>
          <span className="msc-section-note">Thirty days, no interrogation</span>
        </div>

        <div className="ship-returns-layout">
          <Reveal>
            <div className="ship-slip">
              <div className="ship-slip-head">
                <span>Return slip</span>
                <span>No. 30</span>
              </div>
              <div className="ship-slip-body">
                <ol className="ship-slip-steps">
                  {RETURN_STEPS.map((step, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <li className="ship-slip-step" key={i}>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
                <div className="ship-slip-tear" aria-hidden="true" />
                <span className="msc-marker">
                  no restocking fee. no form. no scale of one to five.
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="ship-cols">
              <div className="ship-col">
                <h3>We cover it</h3>
                <ul>
                  {COVERED.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="ship-col ship-col--muted">
                <h3>Not a defect</h3>
                <ul>
                  {NOT_A_DEFECT.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>

        <p className="ship-note">
          Size exchanges work the same way and take another five to ten business
          days to print. If you need it sooner, order the new size and send the
          old one back separately. The <Link to="/size-guide">size guide</Link>{' '}
          exists to make this paragraph unnecessary.
        </p>
      </section>

      <section
        className="msc-section msc-section--band msc-page"
        aria-labelledby="ship-faq"
      >
        <div className="msc-section-rule">
          <h2 id="ship-faq">Questions people ask.</h2>
          <span className="msc-section-note">Answered without a chatbot</span>
        </div>
        <Reveal>
          <div className="ship-faq">
            {[FAQS.slice(0, 5), FAQS.slice(5)].map((column, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <div className="ship-faq-col" key={i}>
                {column.map((faq) => (
                  <details className="msc-accordion" key={faq.q}>
                    <summary>{faq.q}</summary>
                    <div className="msc-accordion-body">
                      <p>{faq.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="msc-section msc-page" style={{paddingBottom: '72px'}}>
        <Reveal>
          <div className="policy-footer" style={{marginInline: 'auto'}}>
            <p>
              This is the plain version. The binding ones are the{' '}
              <Link to="/policies/shipping-policy">
                {shipping?.title ?? 'shipping policy'}
              </Link>{' '}
              and the{' '}
              <Link to="/policies/refund-policy">
                {refund?.title ?? 'refund policy'}
              </Link>
              . Anything unclear is our fault, not yours —{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> reaches a
              person.
            </p>
            <nav className="policy-nav" aria-label="Related">
              <Link to="/size-guide">Size guide</Link>
              <Link to="/care">Care guide</Link>
              <Link to="/faq">FAQ</Link>
              <Link to="/contact">Contact</Link>
            </nav>
          </div>
        </Reveal>
      </section>

      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            url: `${origin}/shipping-returns`,
            mainEntity: FAQS.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: {'@type': 'Answer', text: faq.a},
            })),
          }),
        }}
      />
    </div>
  );
}
