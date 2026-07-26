import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/provinces._index';
import {RegionBrowse} from '~/components/RegionBrowse';
import {loadRegionStatus} from '~/lib/shopify-collections';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = () => [
  {title: `Browse by Region — 63 Provinces & States | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'Souvenir t-shirts by province and state. British Columbia is open — ' +
      'every town from Tofino to Trail. Every other region has a waitlist, ' +
      'and the waitlist decides what we print next.',
  },
];

export async function loader({context}: Route.LoaderArgs) {
  const status = await loadRegionStatus(context.storefront);
  return {open: status.open, live: status.live};
}

export default function ProvincesIndex() {
  const {open, live} = useLoaderData<typeof loader>();
  const openCount = Object.values(open).filter(Boolean).length;

  return (
    <div className="msc-page" style={{paddingBottom: '88px'}}>
      <div className="province-header">
        <span className="msc-kicker">The territory</span>
        <h1>Browse by region</h1>
        <p className="province-copy">
          Thirteen provinces and territories, fifty states, and one company
          working through them at the pace of a company that prints town names
          on shirts. Regions we have reached are open. The rest have a
          waitlist, and the waitlist is the whole roadmap — every tile below
          goes somewhere.
        </p>
        {live && openCount > 0 && (
          <span className="msc-kicker msc-kicker--navy">
            {openCount} open · {63 - openCount} in due time
          </span>
        )}
      </div>

      <RegionBrowse open={open} live={live} />

      <div className="msc-form-success" style={{marginTop: '48px'}}>
        <h2>Your town is the whole roadmap.</h2>
        <p style={{maxWidth: '46ch'}}>
          We do not pick regions by market size. We pick them by who asked.
        </p>
        <div className="route-error-actions">
          <Link className="msc-button" to="/request-your-town">
            Name your town
          </Link>
          <Link className="msc-button msc-button--ghost" to="/collections/now-open">
            See what is open
          </Link>
        </div>
      </div>
    </div>
  );
}
