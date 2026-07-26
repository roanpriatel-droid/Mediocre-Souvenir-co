import {Link} from 'react-router';
import type {Route} from './+types/policies._index';
import {Reveal} from '~/components/Reveal';
import {POLICIES, POLICY_UPDATED_LABEL, SUPPORT_EMAIL} from '~/lib/policies';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = () => [
  {title: `Policies — Shipping, Returns, Privacy, Terms | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'The fine print, written plainly: shipping and delivery times, 30-day ' +
      'returns, what we collect and why, terms of service, and our ' +
      'accessibility statement.',
  },
];

export default function Policies() {
  return (
    <div className="msc-page" style={{paddingBottom: '88px'}}>
      <div className="province-header">
        <span className="msc-kicker">The fine print</span>
        <h1>Policies</h1>
        <p className="province-copy">
          Written to be read, not to be survived. If a policy on this page does
          not answer your question, the answer is probably &ldquo;write to us
          and we will sort it out,&rdquo; and that is a real policy too.
        </p>
      </div>

      <div className="policy-index">
        {POLICIES.map((policy, i) => (
          <Reveal key={policy.handle} delay={(i % 3) as 0 | 1 | 2}>
            <Link className="policy-card" to={`/policies/${policy.handle}`}>
              <span className="msc-kicker msc-kicker--navy">
                {policy.navLabel}
              </span>
              <h2>{policy.title}</h2>
              <p>{policy.lead}</p>
              <span className="policy-card-more">Read it →</span>
            </Link>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="policy-footer" style={{marginTop: '40px'}}>
          <p>
            All five were last updated {POLICY_UPDATED_LABEL}. Questions go to{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>, or through
            the <Link to="/contact">contact page</Link>. Common questions are
            answered faster on the <Link to="/faq">FAQ</Link>.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
