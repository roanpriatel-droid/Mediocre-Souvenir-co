import {Link} from 'react-router';
import type {Route} from './+types/certificate';
import {Reveal} from '~/components/Reveal';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = () => [
  {title: `Certificate of Mediocre Authenticity | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'Every order ships with a Certificate of Mediocre Authenticity: a ' +
      'formal document making no claims whatsoever about the significance of ' +
      'your town. Signed anyway.',
  },
  {property: 'og:title', content: 'Certificate of Mediocre Authenticity'},
  {
    property: 'og:description',
    content: 'A formal document that declines to overstate anything.',
  },
];

const CLAUSES = [
  {
    term: 'Subject',
    detail: 'The town named on the garment. A real place, on a real map.',
  },
  {
    term: 'Distinction',
    detail: 'None on record. This field has never once been filled in.',
  },
  {
    term: 'Significance',
    detail:
      'Not asserted. The certificate makes no claim the town is important, scenic, or worth the detour.',
  },
  {
    term: 'Verification',
    detail:
      'The town exists. People live there. Both of these have been checked.',
  },
  {
    term: 'Issued by',
    detail: 'The management, who have not visited, and say so.',
  },
];

export default function CertificatePage() {
  return (
    <div>
      <header className="article-header">
        <span className="msc-kicker">Included with every order</span>
        <h1>The Certificate of Mediocre Authenticity.</h1>
        <p style={{fontSize: '18px', maxWidth: '52ch'}}>
          A formal document, printed on card stock, that declines to overstate
          a single thing. It is the most honest paperwork in retail.
        </p>
      </header>

      <div className="article-body">
        <Reveal>
          <div className="certificate-showpiece">
            <div className="certificate-rule" aria-hidden="true" />
            <p className="certificate-eyebrow">Mediocre Souvenir Co.</p>
            <h2>Certificate of Mediocre Authenticity</h2>
            <p className="certificate-lede">
              This is to certify that the town named hereon is, to the best of
              our knowledge, a place.
            </p>
            <dl className="certificate-terms">
              {CLAUSES.map((clause) => (
                <div key={clause.term}>
                  <dt>{clause.term}</dt>
                  <dd>{clause.detail}</dd>
                </div>
              ))}
            </dl>
            <div className="certificate-sign">
              <span className="msc-marker">the management</span>
              <div className="msc-stamp">
                Genuine
                <br />
                Souvenir
                <br />★ ★ ★
              </div>
            </div>
            <div className="certificate-rule" aria-hidden="true" />
          </div>
        </Reveal>

        <Reveal>
          <div className="msc-prose" style={{marginTop: '36px'}}>
            <h2>Why a certificate at all</h2>
            <p>
              Because the places we print have spent a century being described
              by other people in terms of what they are not. Not scenic. Not a
              destination. Not worth the exit. The certificate is a document
              that describes a town in terms of what it actually is: somewhere
              that exists, where people live full lives, mostly without
              incident.
            </p>
            <p>
              It is also, we admit, a joke about certificates. Every gift shop
              on earth issues a document swearing that its keychain is genuine.
              Ours swears to almost nothing, in the same typeface, at the same
              size, with the same stamp. That is the whole gag and we are
              committed to it.
            </p>

            <h2>What it is printed on</h2>
            <p>
              Uncoated card, cream, slightly heavier than it needs to be. The
              stamp is applied at a small rotation because a stamp applied
              perfectly straight has never happened in the history of stamps.
              It fits in a glovebox, a bathroom mirror frame, or the drawer
              where you keep the other things you did not throw out.
            </p>

            <h2>Can I get one without buying a shirt</h2>
            <p>
              No. It certifies the garment. A certificate on its own would be a
              document certifying nothing, which even we consider a step too
              far.
            </p>
            <span className="msc-marker">no distinction on record.</span>
          </div>
        </Reveal>
      </div>

      <section className="msc-section msc-page" style={{paddingBottom: '80px'}}>
        <Reveal>
          <div className="msc-form-success">
            <h2>It comes with the shirt.</h2>
            <p style={{maxWidth: '44ch'}}>
              Pick a town and the paperwork follows.
            </p>
            <div className="route-error-actions">
              <Link className="msc-button" to="/collections/all-souvenirs">
                Browse the souvenirs
              </Link>
              <Link className="msc-button msc-button--ghost" to="/towns">
                The directory
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
