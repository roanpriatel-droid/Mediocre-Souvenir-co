import {useLoaderData} from 'react-router';
import type {Route} from './+types/faq';
import {useNonce} from '@shopify/hydrogen';
import {Reveal} from '~/components/Reveal';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = () => [
  {title: `FAQ — Shipping, Returns, Sizing | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'Answers on shipping, returns, sizing, materials, and how towns get ' +
      'added to the Mediocre Souvenir Co. catalog.',
  },
];

const FAQS = [
  {
    q: 'How long does shipping take?',
    a: 'Every shirt is printed when you order it — allow 5–10 business days for printing plus transit. Genuine takes time. Shipping is free in Canada and the US on orders over $75.',
  },
  {
    q: 'What is your return policy?',
    a: 'Thirty days, no interrogation. If the shirt is not right, send it back in wearable condition and we refund it. Exchanges for size work the same way.',
  },
  {
    q: 'How does the collect-more discount work?',
    a: 'Two or more shirts save 15%, three or more save 20%. It applies automatically at checkout, mixes and matches across any towns, and requires no code.',
  },
  {
    q: 'What shirt do you print on?',
    a: 'The Comfort Colors 1717: heavyweight 6.1 oz, 100% ring-spun cotton, garment-dyed so the faded look is in the fabric, not printed on. We do not substitute lighter blanks. Details on the Materials page.',
  },
  {
    q: 'How do the sizes run?',
    a: 'Unisex, true to size, S–3XL. The cotton relaxes about half a size as it breaks in. Full measurements and a find-my-size flow are on the Size & Fit Guide.',
  },
  {
    q: 'My town isn’t on the rack. How does it get there?',
    a: 'Submit it through Request Your Town. The waitlist decides the print order — enough requests and your town gets researched, drawn, and shelved with the rest. This is the whole system; there is no other system.',
  },
  {
    q: 'Can I wear a town I’ve never been to?',
    a: 'Yes. A souvenir commemorates a place, not your attendance record. Nobody interrogates a person in a NASA shirt about their spacewalks.',
  },
  {
    q: 'Where do you ship from?',
    a: 'Shirts are printed to order in North America and dispatched from somewhere unremarkable, which we consider on-brand.',
  },
];

export async function loader({request}: Route.LoaderArgs) {
  return {origin: new URL(request.url).origin};
}

export default function FAQ() {
  const {origin} = useLoaderData<typeof loader>();
  const nonce = useNonce();
  return (
    <div>
      <header className="article-header">
        <span className="msc-kicker">The front desk</span>
        <h1>Frequently asked questions.</h1>
        <p style={{fontSize: '18px', maxWidth: '52ch'}}>
          Everything people ask, answered plainly. If yours is missing,{' '}
          the <a href="/contact">contact page</a> works.
        </p>
      </header>
      <div className="article-body">
        <Reveal>
          <div style={{maxWidth: '720px', width: '100%'}}>
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
      </div>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            url: `${origin}/faq`,
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
