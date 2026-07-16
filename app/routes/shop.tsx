import type {Route} from './+types/shop';
import {RackGrid} from '~/components/TownRackCard';
import {TownSearch} from '~/components/TownSearch';
import {getAllTowns} from '~/lib/catalog';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = () => [
  {title: `Shop All Towns — Vintage Souvenir T-Shirts | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'The whole rack: faux-vintage souvenir t-shirts for every overlooked ' +
      'town we cover. Garment-dyed heavyweight tees, $36 each — collect 2 ' +
      'and save 15%.',
  },
];

export async function loader(_args: Route.LoaderArgs) {
  const towns = getAllTowns().sort((a, b) => a.city.localeCompare(b.city));
  return {towns};
}

export default function Shop({loaderData}: Route.ComponentProps) {
  const {towns} = loaderData;
  return (
    <div className="msc-page" style={{paddingBottom: '88px'}}>
      <div className="province-header">
        <span className="msc-kicker">The whole rack</span>
        <h1>Shop all towns</h1>
        <p className="province-copy">
          {towns.length} towns of modest renown, alphabetically, the way a
          real gift shop would file them.
        </p>
        <TownSearch />
      </div>
      <RackGrid towns={towns} />
    </div>
  );
}
