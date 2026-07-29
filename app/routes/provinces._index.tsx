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
      'Souvenir t-shirts for every province, territory and state in Canada ' +
      'and the United States. Sixty-three regions, all of them open, none of ' +
      'them famous.',
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
          Thirteen provinces and territories, fifty states, and a shirt for
          towns in every one of them. We started with the places other
          souvenir racks drove past and did not stop. Pick a region below —
          they are all open, and none of them are famous.
        </p>
        {live && openCount > 0 && (
          <span className="msc-kicker msc-kicker--navy">
            {openCount} regions open · {openCount === 63 ? 'all of them' : 'more in due time'}
          </span>
        )}
      </div>

      <RegionBrowse open={open} live={live} />

      <div className="msc-form-success" style={{marginTop: '48px'}}>
        <h2>Your town not on a shirt yet?</h2>
        <p style={{maxWidth: '46ch'}}>
          Every region is open, but not every town in them is drawn. Tell us
          which one we missed — that is how the next batch gets chosen.
        </p>
        <div className="route-error-actions">
          <Link className="msc-button" to="/request-a-town">
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
