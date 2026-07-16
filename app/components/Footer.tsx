import {Link} from 'react-router';
import {getTownsByProvince, PROVINCES} from '~/lib/catalog';
import {MSCMonogram} from '~/components/Brand';

/**
 * Static brand footer. The browse-by-province link list is the SEO spine —
 * every open province page is one hop from every page on the site.
 */
export function Footer() {
  const openProvinces = PROVINCES.filter((p) => p.status === 'open');
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
            {openProvinces.map((province) => (
              <li key={province.slug}>
                <Link to={`/provinces/${province.slug}`}>
                  {province.name} ({getTownsByProvince(province.slug).length})
                </Link>
              </li>
            ))}
            <li>
              <Link to="/new-arrivals">New arrivals</Link>
            </li>
            <li>
              <Link to="/provinces">All provinces</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>The Co.</h4>
          <ul>
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
          <h4>Fine print</h4>
          <ul>
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
