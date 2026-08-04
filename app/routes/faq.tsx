import {useLoaderData} from 'react-router';
import type {Route} from './+types/faq';
import {useNonce} from '@shopify/hydrogen';
import {Reveal} from '~/components/Reveal';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `FAQ — Shipping, Returns, Sizing | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'Answers on shipping, returns, sizing, materials, and how towns get ' +
      'added to the Mediocre Souvenir Co. catalog.',
  },
  {tagName: 'link', rel: 'canonical', href: `${data?.origin ?? ''}/faq`},
];

const FAQS = [
  {
    q: 'How long does shipping take? Honestly?',
    a: 'Longer than you would like, and we are sorry about that. Every shirt is printed after you order it, so allow 5–10 business days before it even moves, then transit on top. We could hold stock and ship it tomorrow; we would then be a warehouse with a landfill problem. Free over $60 USD in Canada and the US, which does not make the wait shorter but does make it cheaper.',
  },
  {
    q: 'What if I do not like it?',
    a: 'That is a completely reasonable outcome and we have planned for it. Thirty days, no interrogation, no restocking fee, no form asking you to rate your disappointment out of five. Send it back in wearable condition and we refund it. Size exchanges work the same way.',
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
    q: 'My town isn’t here. Why not?',
    a: 'Every region is open — all thirteen provinces and territories and all fifty states — so the region is not the problem. Your specific town just has not been drawn yet, and that is our oversight rather than a comment on the town. Nominate it on Request A Town and it goes into the next batch. We are sorry it was not already there.',
  },
  {
    q: 'Can I wear a town I’ve never been to?',
    a: 'Yes. A souvenir commemorates a place, not your attendance record. Nobody interrogates a person in a NASA shirt about their spacewalks.',
  },
  {
    q: 'Where does it actually come from?',
    a: 'Somewhere unremarkable in North America. We would tell you the town but it is not on the rack yet either, which we recognise is a little embarrassing given the entire premise.',
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
        <p style={{fontSize: '18px', maxWidth: '54ch'}}>
          Everything people ask, answered plainly and with a certain amount of
          apologising. If yours is missing, that is an oversight on our part —{' '}
          <a href="/contact">the contact page</a> reaches a person.
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
