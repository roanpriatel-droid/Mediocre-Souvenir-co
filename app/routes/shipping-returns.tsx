import {Link, useLoaderData} from 'react-router';
import {useNonce} from '@shopify/hydrogen';
import type {Route} from './+types/shipping-returns';
import {Reveal} from '~/components/Reveal';
import {getPolicy, SUPPORT_EMAIL} from '~/lib/policies';
import {SITE_NAME} from '~/lib/seo';

/**
 * Shipping and returns on one page, because that is how people ask about it.
 * The canonical legal documents still live at /policies/*; this is the plain
 * answer with a link to the fine print.
 */

export const meta: Route.MetaFunction = ({data}) => [
  {title: `Shipping & Returns — We Ship Everywhere | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'We ship everywhere, even places nicer than the ones on our shirts. ' +
      'Printed to order in 5–10 business days, free over $60, and 30-day ' +
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

const TIMELINE = [
  ['You order', 'Nothing happens for a moment. This is correct.'],
  ['Printing · 5–10 business days', 'The shirt is made because you asked for it. Nothing sat in a warehouse hoping.'],
  ['In transit · 3–8 business days', 'Standard post, within Canada or within the US. Cross-border runs 6–12, customs permitting.'],
  ['Arrival', 'A parcel from somewhere unremarkable. Certificate enclosed.'],
];

const FAQS = [
  {
    q: 'Do you ship to somewhere nicer than the towns on the shirts?',
    a: 'Yes. We ship anywhere in Canada and the United States, including places with actual tourism. The shirt will not comment on your surroundings.',
  },
  {
    q: 'How much is shipping?',
    a: 'Free on orders over $60 in Canada and the United States — which is two shirts once the multi-town discount applies. Below that, a flat $6.95, the same rate to both countries.',
  },
  {
    q: 'What if it does not fit?',
    a: 'Thirty days, no interrogation. Send it back in wearable condition and we refund it. Size exchanges work the same way, though they take another 5–10 days to print.',
  },
  {
    q: 'What if it arrives damaged?',
    a: 'Send a photograph within 30 days and we replace it. You do not need to return the damaged one; it has been through enough.',
  },
  {
    q: 'Where does it ship from?',
    a: 'Printed to order in North America and dispatched from somewhere unremarkable, which we consider on brand.',
  },
];

export default function ShippingReturns() {
  const {origin} = useLoaderData<typeof loader>();
  const nonce = useNonce();
  const shipping = getPolicy('shipping-policy');
  const refund = getPolicy('refund-policy');

  return (
    <div>
      <header className="article-header">
        <span className="msc-kicker">Getting it to you</span>
        <h1>Shipping &amp; returns.</h1>
        <p style={{fontSize: '18px', maxWidth: '54ch'}}>
          We ship everywhere, even places nicer than the ones on our shirts.
        </p>
      </header>

      <div className="article-body">
        <Reveal>
          <ol className="ship-timeline">
            {TIMELINE.map(([label, note]) => (
              <li key={label}>
                <strong>{label}</strong>
                <span>{note}</span>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal>
          <div className="ship-cards">
            <div className="ship-card">
              <span className="msc-kicker msc-kicker--navy">Free over $60</span>
              <p>
                Canada and the United States, same clean number in both
                currencies. Below it, a flat rate shown before you pay.
              </p>
            </div>
            <div className="ship-card">
              <span className="msc-kicker msc-kicker--navy">30-day returns</span>
              <p>
                No interrogation, no restocking fee, no form that asks you to
                rate your reason on a scale of one to five.
              </p>
            </div>
            <div className="ship-card">
              <span className="msc-kicker msc-kicker--navy">Printed to order</span>
              <p>
                Genuine takes time. Nothing sits in a warehouse becoming
                landfill inventory while it waits for you.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div style={{maxWidth: '720px', width: '100%', marginTop: '36px'}}>
            {FAQS.map((faq) => (
              <details className="msc-accordion" key={faq.q}>
                <summary>{faq.q}</summary>
                <div className="msc-accordion-body">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="policy-footer">
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
              <Link to="/faq">FAQ</Link>
              <Link to="/contact">Contact</Link>
            </nav>
          </div>
        </Reveal>
      </div>

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
