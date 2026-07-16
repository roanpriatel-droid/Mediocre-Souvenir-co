import type {Route} from './+types/new-arrivals';
import {RackGrid} from '~/components/TownRackCard';
import {getNewArrivals} from '~/lib/catalog';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = () => [
  {title: `New Arrivals — Freshly Commemorated Towns | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'The latest overlooked towns to receive their commemorative garment. ' +
      'New towns weekly — souvenir tees, faded on purpose.',
  },
];

export async function loader(_args: Route.LoaderArgs) {
  return {towns: getNewArrivals()};
}

export default function NewArrivals({loaderData}: Route.ComponentProps) {
  const {towns} = loaderData;
  return (
    <div className="msc-page" style={{paddingBottom: '88px'}}>
      <div className="province-header">
        <span className="msc-kicker">Fresh off the press</span>
        <h1>New arrivals</h1>
        <p className="province-copy">
          The latest towns to be taken as seriously as they always should have
          been. New towns weekly.
        </p>
      </div>
      <RackGrid towns={towns} />
    </div>
  );
}
