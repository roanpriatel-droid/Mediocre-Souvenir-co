import {Link} from 'react-router';
import {getRegionsByCountry} from '~/lib/catalog';
import {MSCMonogram} from '~/components/Brand';
import {EmailCapture} from '~/components/EmailCapture';

/**
 * The fat footer — five columns and the site's densest internal-link surface.
 *
 * All thirteen Canadian regions fit, so all thirteen are here. Fifty US states
 * do not, so the USA column links The Towns directory first and then the ten
 * states people actually search for; the directory carries the other forty.
 * Between this and the region grid, every one of the 69 collection pages is
 * within two hops of any page on the site, which is what gets them crawled.
 */

/** Highest-search-volume state names, not the ten biggest states. */
const HEADLINE_STATES = [
  'ohio',
  'pennsylvania',
  'michigan',
  'illinois',
  'indiana',
  'new-york',
  'texas',
  'california',
  'florida',
  'wisconsin',
];

export function Footer() {
  const canada = getRegionsByCountry('Canada');
  const states = getRegionsByCountry('United States');
  const headline = HEADLINE_STATES.map((slug) =>
    states.find((region) => region.slug === slug),
  ).filter((region) => region !== undefined);

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <MSCMonogram size={72} onDark />
          <div className="footer-wordmark">MEDIOCRE SOUVENIR CO.</div>
          <div className="footer-tagline">
            Genuine merch for overlooked places
          </div>
          <p className="footer-brand-copy">
            Commemorating the places other souvenirs forgot. Every garment
            honors a real town where people live full lives, mostly without
            incident.
          </p>
        </div>

        <div className="footer-col">
          <h4>Shop Canada</h4>
          <ul>
            {canada.map((region) => (
              <li key={region.slug}>
                <Link to={`/collections/${region.slug}`}>{region.name}</Link>
              </li>
            ))}
            <li>
              <Link to="/collections/canada">
                <strong>All of Canada →</strong>
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Shop USA</h4>
          <ul>
            <li>
              <Link to="/towns">
                <strong>All 50 states → The Towns</strong>
              </Link>
            </li>
            {headline.map((region) => (
              <li key={region.slug}>
                <Link to={`/collections/${region.slug}`}>{region.name}</Link>
              </li>
            ))}
            <li>
              <Link to="/collections/united-states">
                <strong>All of the USA →</strong>
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>The Brand</h4>
          <ul>
            <li>
              <Link to="/our-story">Our story</Link>
            </li>
            <li>
              <Link to="/certificate">Certificate of Authenticity</Link>
            </li>
            <li>
              <Link to="/postcards">Postcards From Nowhere</Link>
            </li>
            <li>
              <Link to="/request-a-town">Request a town</Link>
            </li>
            <li>
              <Link to="/towns">The Towns directory</Link>
            </li>
            <li>
              <Link to="/lookbook">The lookbook</Link>
            </li>
            <li>
              <Link to="/materials">Materials &amp; construction</Link>
            </li>
            <li>
              <a
                href="https://instagram.com/mediocresouvenirco"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Help</h4>
          <ul>
            <li>
              <Link to="/faq">FAQ</Link>
            </li>
            <li>
              <Link to="/shipping-returns">Shipping &amp; returns</Link>
            </li>
            <li>
              <Link to="/size-guide">Size &amp; fit guide</Link>
            </li>
            <li>
              <Link to="/care">Care guide</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/search">Search</Link>
            </li>
            <li>
              <Link to="/policies/shipping-policy">Shipping policy</Link>
            </li>
            <li>
              <Link to="/policies/refund-policy">Refund policy</Link>
            </li>
            <li>
              <Link to="/policies/privacy-policy">Privacy</Link>
            </li>
            <li>
              <Link to="/policies/terms-of-service">Terms of service</Link>
            </li>
            <li>
              <Link to="/policies/accessibility">Accessibility</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-newsletter">
        <EmailCapture source="footer" />
      </div>

      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Mediocre Souvenir Co. Souvenirs from
          places you&rsquo;ve technically been.
        </span>
        <span className="footer-payments" aria-label="Payment methods accepted">
          <i>VISA</i>
          <i>MC</i>
          <i>AMEX</i>
          <i>PAYPAL</i>
          <i>SHOP PAY</i>
          <i>APPLE PAY</i>
        </span>
      </div>
    </footer>
  );
}
