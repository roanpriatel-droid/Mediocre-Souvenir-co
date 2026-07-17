import type {Route} from './+types/provinces._index';
import {RegionBrowse} from '~/components/RegionBrowse';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = () => [
  {title: `Browse by Region — Provinces & States | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'Souvenir t-shirts by province and state. British Columbia is open — ' +
      'every town from Tofino to Trail. Alberta is next, then east across ' +
      'Canada, then south into the United States. The route is long.',
  },
];

export default function ProvincesIndex() {
  return (
    <div className="msc-page" style={{paddingBottom: '88px'}}>
      <div className="province-header">
        <span className="msc-kicker">The territory</span>
        <h1>Browse by region</h1>
        <p className="province-copy">
          We work one region at a time, giving every town the attention a
          proper gift shop would. British Columbia is open. Alberta is next.
          Then east across Canada, then south — the United States is on the
          route, and the route is long.
        </p>
      </div>
      <RegionBrowse />
    </div>
  );
}
