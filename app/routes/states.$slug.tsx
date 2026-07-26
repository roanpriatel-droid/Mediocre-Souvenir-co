import {redirect} from 'react-router';
import type {Route} from './+types/states.$slug';
import {getRegion} from '~/lib/catalog';

/** See provinces.$slug — states landed on /collections/:slug too. */
export async function loader({params}: Route.LoaderArgs) {
  const region = getRegion(params.slug ?? '', 'state');
  return redirect(region ? `/collections/${region.slug}` : '/provinces', 301);
}
