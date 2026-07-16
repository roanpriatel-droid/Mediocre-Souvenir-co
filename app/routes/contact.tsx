import type {Route} from './+types/contact';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = () => [
  {title: `Contact | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'Write to Mediocre Souvenir Co. about orders, towns, or anything else. ' +
      'We read everything, slowly and with care.',
  },
];

export default function Contact() {
  return (
    <div className="msc-narrow-page">
      <span className="msc-kicker">The front desk</span>
      <h1>Contact.</h1>
      <p>
        Questions about an order, a town, or the general concept of
        commemorating places that never asked to be commemorated — write to
        us. We read everything, slowly and with care.
      </p>
      <div className="msc-form" style={{gap: '12px'}}>
        <div>
          <span className="msc-label">Email</span>
          <a href="mailto:hello@mediocresouvenir.co" style={{fontWeight: 700}}>
            hello@mediocresouvenir.co
          </a>
        </div>
        <div>
          <span className="msc-label">Instagram</span>
          <a
            href="https://instagram.com/mediocresouvenirco"
            target="_blank"
            rel="noreferrer"
            style={{fontWeight: 700}}
          >
            @mediocresouvenirco
          </a>
        </div>
        <div>
          <span className="msc-label">Response time</span>
          <p>Within two business days. Genuine takes time.</p>
        </div>
      </div>
      <span className="msc-marker">thanks for visiting.</span>
    </div>
  );
}
