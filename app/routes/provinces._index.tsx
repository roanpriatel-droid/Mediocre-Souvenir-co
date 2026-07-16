import type {Route} from './+types/provinces._index';
import {RegionBrowse} from '~/components/RegionBrowse';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = () => [
  {title: `Browse by Province — Every Overlooked Region | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'Souvenir t-shirts by province and state. British Columbia is open — ' +
      'every town from Tofino to Trail. Alberta is next. The rest of the ' +
      'continent, in due time.',
  },
];

export default function ProvincesIndex() {
  return (
    <div className="msc-page" style={{paddingBottom: '88px'}}>
      <div className="province-header">
        <span className="msc-kicker">The territory</span>
        <h1>Browse by province</h1>
        <p className="province-copy">
          We work one region at a time, giving every town the attention a
          proper gift shop would. British Columbia is open. Alberta is next.
          Then east, until the map runs out.
        </p>
      </div>
      <RegionBrowse />
    </div>
  );
}
