import {redirect} from 'react-router';
import type {Route} from './+types/journal.$slug';

/** Old journal article URLs keep working. */
export async function loader({params}: Route.LoaderArgs) {
  return redirect(`/postcards/${params.slug ?? ''}`, 301);
}
