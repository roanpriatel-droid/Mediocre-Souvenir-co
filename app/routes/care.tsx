import {Link} from 'react-router';
import type {Route} from './+types/care';
import {Reveal} from '~/components/Reveal';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `Care Guide — Keep the Fade Honest | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'How to care for a garment-dyed heavyweight cotton tee: cold wash, ' +
      'inside out, hang dry if you love it. The shirt has seen worse.',
  },
  {tagName: 'link', rel: 'canonical', href: `${data?.origin ?? ''}/care`},
];

const CARE_RULES = [
  {
    title: 'Wash cold, inside out',
    body: 'Garment-dyed cotton holds its color best in cold water, and washing inside out protects the print from the drum. With like colors, in the sense that everything you own is probably already faded.',
  },
  {
    title: 'Skip the bleach, obviously',
    body: 'The shirt spent its first day of life in a dye tank getting the fade exactly right. Bleach would be editorializing.',
  },
  {
    title: 'Hang dry if you love it',
    body: 'Low tumble dry is acceptable. Hang drying is what the shirt would choose for itself. Either way, expect the cotton to relax about half a size over the first month of wear — this is the arrangement, not a defect.',
  },
  {
    title: 'Iron inside out, low, never on the print',
    body: 'A heavyweight tee mostly refuses to wrinkle out of self-respect. If you must iron, do it inside out on low. Direct heat on the print is how souvenirs become regrets.',
  },
  {
    title: 'Mend, don’t retire',
    body: 'A small hole in year six is seniority, not failure. Any dry cleaner can bar-tack it. A shirt with a repair outranks a new one at every reunion.',
  },
];

export async function loader({request}: Route.LoaderArgs) {
  return {origin: new URL(request.url).origin};
}

export default function CareGuide() {
  return (
    <div>
      <header className="article-header">
        <span className="msc-kicker">Maintenance</span>
        <h1>Care guide.</h1>
        <p style={{fontSize: '18px', maxWidth: '52ch'}}>
          The shirt is heavyweight garment-dyed cotton. It has already been
          through worse than your laundry. Still, some guidance.
        </p>
      </header>
      <div className="article-body" style={{gap: '0'}}>
        <Reveal>
          <div style={{maxWidth: '720px', width: '100%'}}>
            {CARE_RULES.map((rule) => (
              <details className="msc-accordion" key={rule.title}>
                <summary>{rule.title}</summary>
                <div className="msc-accordion-body">
                  <p>{rule.body}</p>
                </div>
              </details>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <div className="msc-prose" style={{marginTop: '32px'}}>
            <p>
              The goal of all of this is simple: in thirty years the shirt
              should be in a thrift store, mislabeled as vintage, priced
              higher than we sold it for. Fabric philosophy on the{' '}
              <Link to="/materials">Materials page</Link>.
            </p>
            <span className="msc-marker">machine wash cold. quiet pride.</span>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
