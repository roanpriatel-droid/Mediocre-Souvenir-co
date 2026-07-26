import {Link} from 'react-router';
import {getOpenRegions, getTownsByRegion, regionPath} from '~/lib/catalog';
import {MSCMonogram} from '~/components/Brand';

/**
 * Static brand footer. The browse-by-region link list is the SEO spine —
 * every open province and state page is one hop from every page on the site.
 */
export function Footer() {
  const openRegions = getOpenRegions();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <MSCMonogram size={72} onDark />
          <div className="footer-wordmark">MEDIOCRE SOUVENIR CO.</div>
          <div className="footer-tagline">
            Genuine merch for overlooked places
          </div>
          <p style={{fontSize: '14px', maxWidth: '38ch', opacity: 0.8}}>
            Commemorating the places other souvenirs forgot. Every garment
            honors a real town where people live full lives, mostly without
            incident.
          </p>
        </div>
        <div className="footer-col">
          <h4>Browse</h4>
          <ul>
            <li>
              <Link to="/shop">Shop all towns</Link>
            </li>
            {openRegions.map((region) => (
              <li key={region.slug}>
                <Link to={regionPath(region)}>
                  {region.name} ({getTownsByRegion(region.slug).length})
                </Link>
              </li>
            ))}
            <li>
              <Link to="/new-arrivals">New arrivals</Link>
            </li>
            <li>
              <Link to="/collections">Collections</Link>
            </li>
            <li>
              <Link to="/provinces">All regions</Link>
            </li>
            <li>
              <Link to="/search">Search</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>The Co.</h4>
          <ul>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/lookbook">Lookbook</Link>
            </li>
            <li>
              <Link to="/journal">The Journal</Link>
            </li>
            <li>
              <Link to="/request-your-town">Request your town</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
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
          <h4>Guides &amp; fine print</h4>
          <ul>
            <li>
              <Link to="/materials">Materials &amp; construction</Link>
            </li>
            <li>
              <Link to="/size-guide">Size &amp; fit guide</Link>
            </li>
            <li>
              <Link to="/care">Care guide</Link>
            </li>
            <li>
              <Link to="/faq">FAQ</Link>
            </li>
            <li>
              <Link to="/policies/shipping-policy">Shipping</Link>
            </li>
            <li>
              <Link to="/policies/refund-policy">Returns</Link>
            </li>
            <li>
              <Link to="/policies/privacy-policy">Privacy</Link>
            </li>
            <li>
              <Link to="/policies/terms-of-service">Terms</Link>
            </li>
            <li>
              <Link to="/policies/accessibility">Accessibility</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Mediocre Souvenir Co. · Est. 2026</span>
        <span>You were somewhere.</span>
      </div>
    </footer>
  );
}
